"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditGifticonForm from "@/components/edit";

export default function ProductEdit({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <PageHeader
          title="상품 수정"
          description="NFT 기프티콘 상품 정보를 수정합니다."
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <EditGifticonForm id={params.id} />
        </CardContent>
      </Card>
    </div>
  );
}
