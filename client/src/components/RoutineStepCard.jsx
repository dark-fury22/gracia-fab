import { Link } from "react-router-dom";

function RoutineStepCard({ step }) {
  return (
    <div className="rg-step-card">
      <div className="rg-step-number">{step.step}</div>
      <div className="rg-step-content">
        <div className="rg-step-header">
          <strong>{step.type}</strong>
          {step.frequency && (
            <span className="rg-step-freq">{step.frequency}</span>
          )}
        </div>
        <p className="rg-step-instruction">{step.instruction}</p>
        {step.why && <p className="rg-step-why">💡 {step.why}</p>}
        {step.tip && <p className="rg-step-tip">✦ {step.tip}</p>}

        {step.product ? (
          <Link
            to={`/products/${step.product._id}`}
            className="rg-step-product"
          >
            <img
              src={step.product.image}
              alt={step.product.name}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&h=80&fit=crop";
              }}
            />
            <div>
              <span>{step.product.name}</span>
              <span className="rg-step-price">
                ₦{step.product.price?.toLocaleString()}
              </span>
            </div>
            <span className="rg-step-shop">Shop →</span>
          </Link>
        ) : step.productName ? (
          <div className="rg-step-suggestion">
            🛍️ Look for: <em>{step.productName}</em>
            <Link to="/products" className="rg-browse-link">
              Browse Products →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default RoutineStepCard;
