"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchBrands,
  fetchCategories,
  fetchGifticonDetail,
  updateGifticon,
} from "@/lib/gifticons";
import { uploadImageToPinata, uploadMetadataToPinata } from "@/lib/utils";

interface EditGifticonFormProps {
  id: string;
}
interface Brand {
    brandId: number;
    brandName: string;
}
  
interface Category {
    categoryId: number;
    categoryName: string;
}


export default function EditGifticonForm({ id }: EditGifticonFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);  

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    brand: "",
    category: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [brandData, categoryData, detail] = await Promise.all([
          fetchBrands(),
          fetchCategories(),
          fetchGifticonDetail(Number(id)),
        ]);

        setBrands(brandData);
        setCategories(categoryData);
        setFormData({
          name: detail.gifticonTitle || "",
          description: detail.description || "",
          price: detail.price?.toString() || "",
          brand: detail.brandName || "",
          category: detail.categoryName || "",
        });
        setImagePreview(detail.imageUrl || null);
        setOriginalImageUrl(detail.imageUrl || null);
      } catch (err) {
        toast({
          title: "로드 실패",
          description: "기프티콘 정보를 불러오지 못했습니다.",
          variant: "destructive",
        });
      }
    };

    load();
  }, [id, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const selectedBrand = brands.find((b) => b.brandName === formData.brand)!;
        const selectedCategory = categories.find((c) => c.categoryName === formData.category)!;
      
        if (
        !formData.name ||
        !formData.price ||
        !selectedBrand ||
        !selectedCategory
        ) {
        toast({
          title: "입력 오류",
          description: "모든 필수 항목을 입력해주세요.",
          variant: "destructive",
        });
        return;
        }

      const fileInput = document.getElementById("image") as HTMLInputElement;
      const file = fileInput?.files?.[0];
      let imageUrl = originalImageUrl;
      let metadataUrl = "";

      if (file) {
        const imageCid = await uploadImageToPinata(file);
        imageUrl = `https://ipfs.io/ipfs/${imageCid}`;
      }

      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        attributes: [
          { trait_type: "Brand", value: selectedBrand.brandName },
          { trait_type: "Category", value: selectedCategory.categoryName },
        ],
      };

      const metadataCid = await uploadMetadataToPinata(metadata);
      metadataUrl = `https://ipfs.io/ipfs/${metadataCid}`;

      await updateGifticon(Number(id), {
        gifticonTitle: formData.name,
        price: Number(formData.price),
        brandId: selectedBrand.brandId,
        categoryId: selectedCategory.categoryId,
        imageUrl,
        metadataUrl,
        description: formData.description,
      });

      toast({
        title: "수정 완료",
        description: "상품 정보가 수정되었습니다.",
      });

      router.push(`/products/${id}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "수정 실패",
        description: "상품 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">상품명 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="price">가격 *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">카테고리 *</Label>
            <Select
              value={formData.category}
              onValueChange={(val) => handleSelectChange("category", val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {categories.map((cat: any) => (
                  <SelectItem key={cat.categoryId} value={cat.categoryName}>
                    {cat.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand">브랜드 *</Label>
            <Select
              value={formData.brand}
              onValueChange={(val) => handleSelectChange("brand", val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="브랜드 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {brands.map((brand: any) => (
                  <SelectItem key={brand.brandId} value={brand.brandName}>
                    {brand.brandName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description">상품 설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          <div>
            <Label htmlFor="image">상품 이미지</Label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div className="relative w-full h-full">
                    <Image
                      src={imagePreview}
                      alt="preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 수정 중...</> : "상품 수정"}
        </Button>
      </div>
    </form>
  );
}