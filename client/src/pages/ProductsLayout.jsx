import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Products from "./Products";
import SEO from "../components/SEO";

function ProductsLayout({ onCartOpen }) {
  return (
    <>
      <SEO
        title="Beauty Products"
        description="Shop our curated collection of skincare, haircare, wigs and bridal beauty products. AI-powered recommendations for every skin and hair type."
        keywords="beauty products Nigeria, skincare Lagos, haircare products, wigs Nigeria, bridal beauty"
        url="/products"
      />
      <Navbar onCartOpen={onCartOpen} />
      <Products />
      <Footer />
    </>
  );
}

export default ProductsLayout;
