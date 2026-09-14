import { useState, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyCode from "./pages/VerifyCode";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductsLayout from "./pages/ProductsLayout";
import ProductDetail from "./pages/ProductDetail";
import Recommend from "./pages/Recommend";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import MyOrders from "./pages/MyOrders";
import Dashboard from "./pages/Dashboard";
import Wishlist from "./pages/Wishlist";
// Lazy-loaded: only admins ever visit this route, so its ~1,100-line
// bundle shouldn't ship in every visitor's initial page load.
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
import BackToTop from "./components/BackToTop";
import InstallPrompt from "./components/InstallPrompt";
import BeautyLanding from "./pages/BeautyLanding";
import SkinToneDetector from "./components/SkinToneDetector";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SkinAnalysis from "./pages/SkinAnalysis";
import RoutineGenerator from "./pages/RoutineGenerator";
import AiConciergeChat from "./components/AiConciergeChat";

// Wrapper pages
function SkinToneDetectorPage({ onCartOpen }) {
  return (
    <>
      <Navbar onCartOpen={onCartOpen} />
      <SkinToneDetector />
      <Footer />
    </>
  );
}

// ── Protected route — redirects to login if not authenticated ──
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "DM Sans, sans-serif",
          fontSize: "0.9rem",
        }}
      >
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── Admin route — redirects non-admins ──
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return children;
}

// ── Public only route — redirects logged-in users to home ──
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  return (
    <Router>
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
      <Routes>
        {/* ── Public only (redirect to home if logged in) ── */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/verify-code"
          element={<VerifyCode />}
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        {/* ── Public browsing — anyone can shop and build a cart without an account ── */}
        <Route path="/" element={<Home onCartOpen={openCart} />} />
        <Route
          path="/products"
          element={<ProductsLayout onCartOpen={openCart} />}
        />
        <Route
          path="/products/:id"
          element={<ProductDetail onCartOpen={openCart} />}
        />
        <Route path="/cart" element={<Cart />} />
        {/* AI Advisor is public — a shopper should get real value (matched
            products) before we ever ask them to create an account. */}
        <Route path="/recommend" element={<Recommend onCartOpen={openCart} />} />
        {/* ── Protected routes ── */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout onCartOpen={openCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation/:id"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About onCartOpen={openCart} />} />
        <Route
          path="/contact"
          element={<Contact onCartOpen={openCart} />}
        />
        <Route
          path="/beauty/:slug"
          element={
            <ProtectedRoute>
              <BeautyLanding onCartOpen={openCart} />
            </ProtectedRoute>
          }
        />
        {/* ── Admin only ── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Suspense fallback={null}>
                <AdminDashboard />
              </Suspense>
            </AdminRoute>
          }
        />
        {/* Skin Tone Detector runs entirely client-side and calls only
            public endpoints — no reason to gate it behind login. */}
        <Route
          path="/skin-tone"
          element={<SkinToneDetectorPage onCartOpen={openCart} />}
        />
        <Route
          path="/skin-analysis"
          element={
            <ProtectedRoute>
              <SkinAnalysis onCartOpen={openCart} />
            </ProtectedRoute>
          }
        />
        {/* Public, same reasoning as /recommend — the generated routine
            is the hook; login only matters once they want to save it. */}
        <Route
          path="/routine-generator"
          element={<RoutineGenerator onCartOpen={openCart} />}
        />
        {/* ── Catch all ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <BackToTop />
      <InstallPrompt />
      <AiConciergeChat onCartOpen={openCart} />
    </Router>
  );
}

export default App;
