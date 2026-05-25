import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
import AdminDashboard from "./pages/AdminDashboard";
import BackToTop from "./components/BackToTop";
import InstallPrompt from "./components/InstallPrompt";
import BeautyLanding from "./pages/BeautyLanding";

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
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* ── Protected routes ── */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home onCartOpen={openCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsLayout onCartOpen={openCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetail onCartOpen={openCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommend"
          element={
            <ProtectedRoute>
              <Recommend />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About onCartOpen={openCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact onCartOpen={openCart} />
            </ProtectedRoute>
          }
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
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* ── Catch all ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <BackToTop />
      <InstallPrompt />
    </Router>
  );
}

export default App;
