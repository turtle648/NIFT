// components/MintingModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { mintNFT } from "@/lib/mintNFT";

export default function MintingModal({ open, setOpen, product }: any) {
  const [quantity, setQuantity] = useState(1);
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    if (!product) return;

    // ✅ 요기에 넣으면 됨!
    console.log("🐛 민팅 직전 product 확인:", product);
    console.log("🐛 metadataURI 확인:", product.metadataUrl);

    try {
      setMinting(true);
      const address = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAddress = address[0];

      const txHash = await mintNFT({
        userAddress,
        gifticonId: product.gifticonId,
        quantity,
        price: product.price,
        name: product.gifticonTitle,
        description: product.description,
        metadataURI: product.metadataUrl || "ipfs://default",
      });

      console.log("✅ 민팅 성공:", txHash);
      alert("🎉 상품 발급에 성공했습니다!");
    } catch (err) {
      console.error("❌ 민팅 실패:", err);
      alert("❌ 민팅 실패");
    } finally {
      setMinting(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>민팅하기</DialogTitle>
          <DialogDescription>
            {product?.gifticonTitle} NFT를 민팅합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 mt-4">
          <span>수량</span>
          <Input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20"
          />
        </div>
        <DialogFooter>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleMint}
            disabled={minting}
          >
            {minting ? "발급 중..." : "발급하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
