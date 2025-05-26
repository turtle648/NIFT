const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface User {
  userId: number;
  kakaoId: number;
  nickName: string;
  walletAddress: string;
  profileImage: string;
  gender: string;
  age: string;
  role: number; // 0: 일반 사용자, 1: 사업장, 2: 차단됨
}


export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch(`${BASE_URL}/admin/user`)
  if (!res.ok) throw new Error("유저 불러오기 실패")
  return res.json()
}