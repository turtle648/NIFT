import { Calendar, CreditCard, Package, Tag } from "lucide-react";

interface ProductDetailsProps {
  name: string;
  price: number;
  category: string;
  brand: string;
  validity: string;
  createdAt: string;
  description: string;
}

const ProductDetails = ({
  name,
  price,
  category,
  brand,
  validity,
  createdAt,
  description,
}: ProductDetailsProps) => (
  <div>
    <h2 className="text-2xl font-bold mb-2">{name}</h2>
    <div className="flex items-center text-2xl font-bold text-blue-600 mb-4">
     🪙 {price.toLocaleString()}
    </div>

    <div className="space-y-4">
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-600" />
            <span className="text-gray-500">카테고리:</span> {category}
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-gray-500">브랜드:</span> {brand}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-2">상품 설명</h3>
        <p className="text-gray-700 whitespace-pre-line">{description}</p>
      </div>
    </div>
  </div>
);

export default ProductDetails;
