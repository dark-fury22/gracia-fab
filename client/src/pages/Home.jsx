import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrustBadges from "../components/TrustBadges";
import TrendingDeals from "../components/TrendingDeals";
import BrandStory from "../components/BrandStory";
import LaunchBanner from "../components/LaunchBanner";
import Testimonials from "../components/Testimonials";
import ContactTeaser from "../components/ContactTeaser";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

function Home({ onCartOpen }) {
  return (
    <div className="home">
      <SEO
        title="Home"
        description="Gracia Fab is your AI-powered beauty advisor. Get personalized skincare, haircare, wig styles and bridal beauty recommendations made just for you."
        keywords="skincare Nigeria, haircare Nigeria, beauty products Nigeria, AI beauty advisor, wigs Lagos, bridal beauty"
        url="/"
      />
      <Navbar onCartOpen={onCartOpen} />
      <Hero />
      <TrustBadges />
      <TrendingDeals />
      <BrandStory />
      <LaunchBanner />
      <Testimonials />
      <ContactTeaser />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default Home;
