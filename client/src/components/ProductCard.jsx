import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import WishlistButton from "./WishlistButton";
import "./ProductCard.css";
import { useToast } from "../components/Toast";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <div className="product-image-wrapper">
          <img
            src={product?.image}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.onerror = null; // prevent infinite loop
              e.target.src =
                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop";
            }}
          />
          {product.isFeatured && <span className="product-badge">NEW</span>}
          <div className="product-wishlist-btn">
            <WishlistButton productId={product._id} />
          </div>
        </div>
      </Link>

      <div className="product-info">
        <p className="product-brand">{product.brand}</p>
        <Link to={`/products/${product._id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-bottom">
          <span className="product-price">{formatPrice(product?.price)}</span>
          <button
            className="btn-add-to-cart"
            onClick={() => {
              addToCart(product);
              addToast(`Added ${product.name} to cart 🛒`, "success");
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-price" />
      </div>
    </div>
  );
}

export default ProductCard;
