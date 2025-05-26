import Image from "next/image";

interface ProductImageProps {
  imageUrl: string;
  altText: string;
}

const ProductImage = ({ imageUrl, altText }: ProductImageProps) => (
  <div className="relative h-80 w-full mb-4 overflow-hidden rounded-md">
    <Image
      src={imageUrl || "/placeholder.svg"}
      alt={altText}
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, 50vw"
      priority
    />
  </div>
);

export default ProductImage;
