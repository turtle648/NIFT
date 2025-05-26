// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GifticonNFT
 * @dev ERC1155 구조에서 시리얼 넘버 단위 NFT를 관리하고, tokenId에 대한 메타 정보도 포함하는 스마트 컨트랙트
 */
contract GifticonNFT is ERC1155, Ownable, ERC1155Holder, ReentrancyGuard {
    // ⚙️ 상태 변수
    // 시리얼 넘버 단위 개별 NFT에 대한 정보
    struct SerialInfo {
        uint256 price;              // 판매 가격
        address seller;             // 판매자 주소
        address owner;              // 현재 소유자 주소
        address originalOwner;      // 원래 소유자 (선물 때문에 있음)
        uint256 expirationDate;     // 만료일 (timestamp)
        bool redeemed;              // 사용 여부
        uint256 redeemedAt;         // 사용한 시간
        bool isPending;             // 선물 상태
        uint256 pendingDate;        // 선물 상태가 아니면 0, 선물 중일 경우, 현재날짜 + 5
        address pendingRecipient;   // 수신자
    }

    // tokenId에 해당하는 메타 정보
    struct TokenInfo {
        string name;
        string description;
        uint256 totalSupply;
        string metadataURI;
    }

    // 시리얼 넘버 자동 증가용 변수 (100000번부터 시작)
    uint256 private _nextSerial = 100000;
    enum TransferMode { Purchase, Gift, Admin } // 0: 구매 전송, 1: 선물, 2: 관리자 소유권 이전

    // 매핑
    mapping(uint256 => uint256) private _serialToTokenId; // 시리얼 넘버 → tokenId
    mapping(uint256 => SerialInfo) private _serialInfos;    // 시리얼 넘버 → 시리얼 정보
    mapping(uint256 => TokenInfo) private _tokenInfos;      // tokenId → 메타 정보
    mapping(address => uint256[]) private _ownedSerials;    // 특정 사용자가 소유하는 시리얼 넘버들
    mapping(address => bool) private _authorizedTransfers; // 안전한 전송을 위한 허용된 전송자
    mapping(bytes32 => mapping(uint256 => bool)) private _isPendingGift;
    mapping(bytes32 => uint256[]) private _pendingGiftsByAlias; // aliasName -> pending serial numbers

    IERC20 public ssfToken; // 결제에 사용될 ERC20 토큰

    // 📢 이벤트 선언
    event Minted(address indexed owner, uint256 indexed tokenId, uint256 serialNumber, uint256 transactionTime);
    event ListedForSale(uint256 indexed tokenId, uint256 indexed serialNumber, uint256 price, address indexed seller, uint256 expirationDate, string metadataURI, uint256 transactionTime);
    event NFTPurchased(address indexed buyer, uint256 indexed serialNumber, uint256 price, uint256 transactionTime);
    event Redeemed(address indexed owner, uint256 indexed serialNumber, uint256 tokenId, uint256 transactionTime);
    event CancelledSale(uint256 indexed serialNumber, uint256 transactionTime);
    event Gifted(address indexed sender, address indexed recipient, uint256 indexed serialNumber, uint256 transactionTime);
    event SerialOwnershipTransferred(uint256 indexed serialNumber, address indexed from, address indexed to, uint256 transactionTime);
    event GiftPending(address indexed sender, uint256 indexed serialNumber, uint256 tokenId, string aliasName, address indexed recipient, uint256 transactionTime);

    // 🏗️ 생성자
    constructor(address _ssfToken) ERC1155("ipfs://bafkreig6fxmhvpretfa4dviorm2ejbiu75h6gdinnpxinjcci4uk2gkn5q") Ownable() {
        ssfToken = IERC20(_ssfToken);
        _authorizedTransfers[msg.sender] = true;       // 배포자
        _authorizedTransfers[address(this)] = true;    // 컨트랙트 자기 자신
    }

    // 🛡️ 수정자
    // 안전한 전송을 위해 함수 실행 전후 authorizedTransfers를 설정
    modifier onlyAuthorizedTransfer() {
        require(_authorizedTransfers[msg.sender] || msg.sender == address(this), "Unauthorized transfer");
        _;
    }

    // 📞 외부/공개 함수

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, ERC1155Receiver) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev NFT 여러 개를 민팅하면서 tokenId와 시리얼 정보를 등록하는 함수
     */
    function mintBatchWithSerials(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        string calldata name,
        string calldata description,
        string calldata metadataURI
    ) public onlyAuthorizedTransfer {
        require(amount > 0, "Amount must be > 0");

        // tokenId에 대한 메타 정보 저장
        TokenInfo storage info = _tokenInfos[tokenId];

        if (bytes(info.name).length == 0) {
            // 새로 등록된 tokenId인 경우
            _tokenInfos[tokenId] = TokenInfo({
                name: name,
                description: description,
                totalSupply: amount,
                metadataURI: metadataURI
            });
        } else {
            // 이미 등록된 tokenId면 totalSupply만 증가
            info.totalSupply += amount;
        }

        // 실제 ERC1155 토큰 민팅
        _mint(to, tokenId, amount, "");

        // 각각에 대해 시리얼 정보 생성
        for (uint256 i = 0; i < amount; i++) {
            uint256 serial = _generateNextSerial();

            _serialToTokenId[serial] = tokenId;
            _serialInfos[serial] = SerialInfo({
                price: price,
                seller: address(0),
                owner: to,
                originalOwner: to,
                expirationDate: block.timestamp + 90 days,
                redeemed: false,
                redeemedAt: 0,
                isPending: false,
                pendingDate: 0,
                pendingRecipient: address(0)
            });

            _addSerialToOwner(to, serial);

            emit Minted(to, tokenId, serial, block.timestamp);
        }
    }

    // 특정 시리얼 넘버의 NFT를 판매 목록에 등록
    function listForSale(uint256 serialNumber, uint256 price) public {
        SerialInfo storage info = _serialInfos[serialNumber];
        require(info.owner == msg.sender, "Not the owner");
        require(info.seller == address(0), "Already listed for sale");
        require(!info.redeemed, "Already redeemed");
        require(price > 0, "Price must be > 0");

        // 컨트랙트에 대한 전체 토큰 전송 승인
        if (!isApprovedForAll(msg.sender, address(this))) {
            _setApprovalForAll(msg.sender, address(this), true);
        }

        info.price = price;
        info.seller = msg.sender;
        uint256 tokenId = _serialToTokenId[serialNumber];

        emit ListedForSale(tokenId, serialNumber, price, msg.sender, info.expirationDate, _tokenInfos[tokenId].metadataURI, block.timestamp);
    }

    // 시리얼 넘버 기반으로 NFT 구매
    function purchaseBySerial(uint256 serialNumber) public nonReentrant {
        SerialInfo storage info = _serialInfos[serialNumber];
        require(info.seller != address(0), "Not listed");
        require(!info.redeemed, "Already redeemed");
        require(info.price > 0, "Price not set");

        uint256 tokenId = _serialToTokenId[serialNumber];
        address seller = info.seller;
        uint256 purchasePrice = info.price;
        require(isApprovedForAll(seller, address(this)), "Contract not approved by seller");

        // 판매자가 실제 NFT를 가지고 있는지 확인
        require(balanceOf(seller, tokenId) >= 1, "Seller doesn't own the token");

        // SSF 토큰 결제: 구매자가 판매자에게 직접 송금
        bool success = ssfToken.transferFrom(msg.sender, seller, info.price);
        require(success, "ERC20 payment failed");

        // 판매자로부터 구매자에게 직접 NFT 전송
        _safeTransferFrom(seller, msg.sender, tokenId, 1, abi.encode(serialNumber, uint256(TransferMode.Purchase)));

        // 상태 업데이트
        info.owner = msg.sender;
        info.seller = address(0);
        info.price = 0;

        _removeSerialFromOwner(seller, serialNumber);
        _addSerialToOwner(msg.sender, serialNumber);

        emit NFTPurchased(msg.sender, serialNumber, purchasePrice, block.timestamp);
        emit SerialOwnershipTransferred(serialNumber, seller, msg.sender, block.timestamp);
    }

    // 기프티콘 사용 처리
    function redeem(uint256 serialNumber, address brandAdress) public {
        SerialInfo storage info = _serialInfos[serialNumber];
        require(info.redeemedAt == 0, "redeemedAt should not be set before");
        require(info.owner == msg.sender, "Not owner");
        require(!info.redeemed, "Already redeemed");
        require(brandAdress != address(0), "Invalid brand address");
        require(!info.isPending, "Pending because it is send to someone");
        require(info.seller == address(0), "cannot use that is already list to sale");
        require(block.timestamp < info.expirationDate, "Expired");

        _internalTransfer(msg.sender, brandAdress, serialNumber, TransferMode.Admin);

        info.redeemed = true;
        info.redeemedAt = block.timestamp;

        emit Redeemed(msg.sender, serialNumber, _serialToTokenId[serialNumber], block.timestamp);
    }

    // 판매 취소 처리
    function cancelSale(uint256 serialNumber) public nonReentrant {
        SerialInfo storage info = _serialInfos[serialNumber];

        // 판매자 검증
        require(info.seller == msg.sender, "Not the seller");
        require(!info.redeemed, "Already redeemed");

        // 판매자가 NFT를 소유 중인지 확인
        uint256 tokenId = _serialToTokenId[serialNumber];
        require(
            balanceOf(msg.sender, tokenId) >= 1,
            "You must own the NFT to cancel sale"
        );

        // 상태 초기화
        info.owner = msg.sender;
        info.seller = address(0);
        info.price = 0;

        emit CancelledSale(serialNumber, block.timestamp);
    }

    // 소유주가 받는이에게 선물을 보내 기프티콘 상태를 pending으로 변경
    function giftToFriend(uint256 serialNumber, address recipient) public nonReentrant {
        SerialInfo storage info = _serialInfos[serialNumber];

        // 소유권 및 사용 가능 상태 확인
        require(!info.isPending, "Already in gift state");
        require(info.owner == msg.sender, "Not owner");
        require(!info.redeemed, "Already redeemed");

        info.pendingDate = block.timestamp + 5 days;
        info.isPending = true;
        info.pendingRecipient = recipient;

        emit GiftPending(msg.sender, serialNumber, _serialToTokenId[serialNumber], "", recipient, block.timestamp);
    }

    // kakaoId로 선물하기 
    // TODO: 카드 info 저장되게 하자
    function giftToFriendByAlias(uint256 serialNumber, string calldata aliasName) public nonReentrant {
        SerialInfo storage info = _serialInfos[serialNumber];
        require(!info.isPending, "Already in gift state");
        require(info.owner == msg.sender, "Not owner");
        require(!info.redeemed, "Already redeemed");

        bytes32 aliasHash = keccak256(abi.encodePacked(aliasName));

        info.isPending = true;
        info.pendingDate = block.timestamp + 5 days;
        info.pendingRecipient = address(0);

        _isPendingGift[aliasHash][serialNumber] = true;
        _pendingGiftsByAlias[aliasHash].push(serialNumber);

        emit GiftPending(msg.sender, serialNumber, _serialToTokenId[serialNumber], aliasName, address(0), block.timestamp);
    }

    // 선물을 받은 사람이 지갑주소를 연결한 뒤, 받으려고 할때
    function claimGiftByAlias(string calldata aliasName, uint256 serialNumber) public nonReentrant {
        bytes32 aliasHash = keccak256(abi.encodePacked(aliasName));
        require(_isPendingGift[aliasHash][serialNumber], "No pending gift with this serial number for this alias");

        SerialInfo storage info = _serialInfos[serialNumber];
        require(info.isPending, "Not in gift state");
        require(!info.redeemed, "Already redeemed");
        require(block.timestamp < info.pendingDate, "Gift expired");

        address originalOwner = info.owner;

        _internalTransfer(originalOwner, msg.sender, serialNumber, TransferMode.Gift);

        _removePendingGiftByAlias(aliasHash, serialNumber);
        _isPendingGift[aliasHash][serialNumber] = false;

        emit Gifted(originalOwner, msg.sender, serialNumber, block.timestamp);
    }

    // 🔍 조회 함수들

    // 시리얼 넘버로부터 tokenId 조회
    function getTokenIdBySerial(uint256 serialNumber) public view returns (uint256) {
        return _serialToTokenId[serialNumber];
    }

    // 시리얼 넘버 소유자 조회
    function getOwnerOfSerial(uint256 serialNumber) public view returns (address) {
        return _serialInfos[serialNumber].owner;
    }

    // 시리얼 넘버 상세 정보 조회
    function getSerialInfo(uint256 serialNumber) public view returns (
        uint256 price,
        address seller,
        address owner,
        address originalOwner,
        uint256 expirationDate,
        bool redeemed,
        uint256 redeemedAt,
        bool isPending,
        uint256 pendingDate,
        address pendingRecipient
    ) {
        SerialInfo memory info = _serialInfos[serialNumber];
        return (
            info.price,
            info.seller,
            info.owner,
            info.originalOwner,
            info.expirationDate,
            info.redeemed,
            info.redeemedAt,
            info.isPending,
            info.pendingDate,
            info.pendingRecipient
        );
    }

    // tokenId 기반 메타 정보 조회
    function getTokenInfo(uint256 tokenId) public view returns (
        string memory name,
        string memory description,
        uint256 totalSupply,
        string memory metadataURI
    ) {
        TokenInfo memory info = _tokenInfos[tokenId];
        return (
            info.name,
            info.description,
            info.totalSupply,
            info.metadataURI
        );
    }

    // kakaoID 기반 _isPendingGift 목록 조회하기
    function getPendingGiftsByKakaoId(string calldata kakaoId) public view returns (uint256[] memory) {
        bytes32 aliasHash = keccak256(abi.encodePacked(kakaoId));
        return _pendingGiftsByAlias[aliasHash];
    }

    // URI 변경 함수 (owner만 가능)
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    // 특정 주소가 소유한 시리얼 넘버 목록 조회
    function getSerialsByOwner(address owner) public view returns (uint256[] memory) {
        return _ownedSerials[owner];
    }

    // 허용된 사용자만 특정 시리얼 넘버의 NFT를 강제 전송할 수 있음
    function authorizedTransferBySerial(address from, address to, uint256 serialNumber) external onlyAuthorizedTransfer {
        uint256 tokenId = _serialToTokenId[serialNumber];
        require(balanceOf(from, tokenId) >= 1, "Sender doesn't own the token");
        _internalTransfer(from, to, serialNumber, TransferMode.Admin);
    }

    // 🛠️ 내부 함수

    // 다른 사용자에게 NFT 전달
    function _internalTransfer(address from, address to, uint256 serialNumber, TransferMode mode) internal {
        SerialInfo storage info = _serialInfos[serialNumber];

        require(info.owner == from, "Not owner");
        require(!info.redeemed, "Already redeemed");

        uint256 tokenId = _serialToTokenId[serialNumber];
        require(balanceOf(from, tokenId) >= 1, "Sender doesn't own the token");

        _safeTransferFrom(from, to, tokenId, 1, abi.encode(serialNumber, uint256(mode)));

        // 상태 업데이트
        info.owner = to;
        info.seller = address(0);
        info.price = 0;
        info.isPending = false;
        info.pendingDate = 0;
        info.pendingRecipient = address(0);

        _removeSerialFromOwner(from, serialNumber);
        _addSerialToOwner(to, serialNumber);

        emit SerialOwnershipTransferred(serialNumber, from, to, block.timestamp);
    }

    // 전송/민팅/소각 전 호출되는 훅 함수
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        if (from != address(0) && to != address(0)) {
            require(ids.length == 1, "Batch transfer not supported for serial-based NFTs");

            uint256 tokenId = ids[0];
            require(data.length >= 32, "Not enough data");

            uint256 serial;
            TransferMode mode = TransferMode.Purchase;

            if (data.length >= 64) {
                (serial, mode) = abi.decode(data, (uint256, TransferMode));
            } else {
                serial = abi.decode(data, (uint256));
            }

            require(_serialToTokenId[serial] == tokenId, "Serial/tokenId mismatch");

            SerialInfo memory info = _serialInfos[serial];
            require(!info.redeemed, "Cannot transfer: already redeemed");

            if (mode == TransferMode.Gift) {
                require(info.seller == address(0), "Cannot gift: listed for sale");
            }
        }
    }

    // 소유자의 시리얼 넘버 기반 토큰 정보 추가
    function _addSerialToOwner(address to, uint256 serial) internal {
        _ownedSerials[to].push(serial);
    }

    // 소유자의 시리얼 넘버 기반 토큰 정보 삭제
    function _removeSerialFromOwner(address from, uint256 serial) internal {
        // 삭제 최적화 위해 'swap & pop' 방식 사용 가능
        uint256[] storage list = _ownedSerials[from];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == serial) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
    }


    // 내부적으로 시리얼 넘버 생성
    function _generateNextSerial() internal returns (uint256) {
        _nextSerial += 1;
        return _nextSerial;
    }

    // 특정 alias에 대한 pending 선물 목록에서 serialNumber 제거
    function _removePendingGiftByAlias(bytes32 aliasHash, uint256 serialNumber) internal {
        uint256[] storage serialList = _pendingGiftsByAlias[aliasHash];
        for (uint256 i = 0; i < serialList.length; i++) {
            if (serialList[i] == serialNumber) {
                serialList[i] = serialList[serialList.length - 1];
                serialList.pop();
                break;
            }
        }
    }
}