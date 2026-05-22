import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Admin.css";
import SEO from "../components/SEO";

const tabs = [
  { id: "overview", label: "📊 Overview" },
  { id: "products", label: "🛍️ Products" },
  { id: "orders", label: "📦 Orders" },
  { id: "users", label: "👥 Users" },
];

const statusColors = {
  pending: "#f39c12",
  processing: "#3498db",
  shipped: "#9b59b6",
  delivered: "#27ae60",
  cancelled: "#e74c3c",
};

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "skincare",
    brand: "",
    countInStock: "10",
    tags: "",
    isFeatured: false,
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    if (!user.isAdmin) return navigate("/");
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (activeTab === "products") fetchProducts();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("${config.API_URL}/api/admin/stats", {
        headers: getHeaders(),
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("${config.API_URL}/api/admin/products", {
        headers: getHeaders(),
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("${config.API_URL}/api/admin/orders", {
        headers: getHeaders(),
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("${config.API_URL}/api/admin/users", {
        headers: getHeaders(),
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (
      !productForm.name ||
      !productForm.price ||
      !productForm.image ||
      !productForm.description
    ) {
      return setFormError("Please fill in all required fields");
    }

    try {
      const url = editProduct
        ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/products/${editProduct._id}`
        : "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/products";

      const method = editProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          countInStock: Number(productForm.countInStock),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setFormSuccess(
        editProduct ? "✅ Product updated!" : "✅ Product created!",
      );
      setShowProductForm(false);
      setEditProduct(null);
      resetForm();
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/products/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/orders/${orderId}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ status }),
        },
      );
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product?.price,
      image: product?.image,
      category: product.category,
      brand: product.brand,
      countInStock: product.countInStock,
      tags: product.tags?.join(", ") || "",
      isFeatured: product.isFeatured,
    });
    setShowProductForm(true);
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "skincare",
      brand: "",
      countInStock: "10",
      tags: "",
      isFeatured: false,
    });
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  if (!user?.isAdmin) return null;

  return (
    <>
      <Navbar />
      <div className="admin-page">
        {/* Admin Header */}
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard 👑</h1>
            <p>Manage your BeautyAI store</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="admin-content">
            {loading ? (
              <p className="admin-loading">Loading stats...</p>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div>
                      <p className="stat-label">Total Revenue</p>
                      <h2 className="stat-value">
                        {formatPrice(stats?.totalRevenue || 0)}
                      </h2>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div>
                      <p className="stat-label">Total Orders</p>
                      <h2 className="stat-value">{stats?.totalOrders}</h2>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🛍️</div>
                    <div>
                      <p className="stat-label">Total Products</p>
                      <h2 className="stat-value">{stats?.totalProducts}</h2>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div>
                      <p className="stat-label">Total Users</p>
                      <h2 className="stat-value">{stats?.totalUsers}</h2>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="admin-section">
                  <h2>Recent Orders</h2>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentOrders?.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-8).toUpperCase()}</td>
                          <td>{order.user?.name || "Unknown"}</td>
                          <td>{formatPrice(order.totalPrice)}</td>
                          <td>
                            <span
                              className="status-pill"
                              style={{
                                background: statusColors[order.status],
                              }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-NG",
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === "products" && (
          <div className="admin-content">
            <div className="admin-section-header">
              <h2>Products ({products.length})</h2>
              <button
                className="btn-admin-add"
                onClick={() => {
                  setEditProduct(null);
                  resetForm();
                  setShowProductForm(true);
                }}
              >
                + Add Product
              </button>
            </div>

            {formSuccess && <div className="admin-success">{formSuccess}</div>}

            {/* Product Form */}
            {showProductForm && (
              <div className="admin-form-card">
                <h3>{editProduct ? "Edit Product" : "Add New Product"}</h3>

                {formError && <div className="admin-error">⚠️ {formError}</div>}

                <form onSubmit={handleProductSubmit}>
                  <div className="admin-form-grid">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g. Vitamin C Serum"
                      />
                    </div>
                    <div className="form-group">
                      <label>Brand *</label>
                      <input
                        type="text"
                        value={productForm.brand}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            brand: e.target.value,
                          })
                        }
                        placeholder="e.g. GlowLab"
                      />
                    </div>
                    <div className="form-group">
                      <label>Price (₦) *</label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            price: e.target.value,
                          })
                        }
                        placeholder="e.g. 8500"
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="skincare">Skincare</option>
                        <option value="haircare">Haircare</option>
                        <option value="wig">Wig</option>
                        <option value="hairstyle">Hairstyle</option>
                        <option value="bridal">Bridal</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Stock Count</label>
                      <input
                        type="number"
                        value={productForm.countInStock}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            countInStock: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Tags (comma separated)</label>
                      <input
                        type="text"
                        value={productForm.tags}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            tags: e.target.value,
                          })
                        }
                        placeholder="e.g. serum, vitamin c, brightening"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Image URL *</label>
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          image: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the product..."
                      rows={4}
                    />
                  </div>

                  <div className="form-group form-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            isFeatured: e.target.checked,
                          })
                        }
                      />
                      Mark as Featured Product
                    </label>
                  </div>

                  <div className="admin-form-actions">
                    <button type="submit" className="btn-admin-save">
                      {editProduct ? "💾 Update Product" : "✅ Create Product"}
                    </button>
                    <button
                      type="button"
                      className="btn-admin-cancel"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditProduct(null);
                        setFormError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            {loading ? (
              <p className="admin-loading">Loading products...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product?.image}
                          alt={product.name}
                          className="admin-product-img"
                        />
                      </td>
                      <td className="product-name-cell">
                        <p>{product.name}</p>
                        <span>{product.brand}</span>
                      </td>
                      <td>
                        <span className="category-pill">
                          {product.category}
                        </span>
                      </td>
                      <td>{formatPrice(product?.price)}</td>
                      <td>{product.countInStock}</td>
                      <td>{product.isFeatured ? "⭐ Yes" : "—"}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div className="admin-content">
            <div className="admin-section-header">
              <h2>All Orders ({orders.length})</h2>
            </div>

            {loading ? (
              <p className="admin-loading">Loading orders...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-8).toUpperCase()}</td>
                      <td>
                        <p>{order.user?.name || "Unknown"}</p>
                        <span className="cell-sub">{order.user?.email}</span>
                      </td>
                      <td>{order.orderItems.length} item(s)</td>
                      <td>{formatPrice(order.totalPrice)}</td>
                      <td>
                        <span
                          className={`pay-pill
                            ${order.isPaid ? "paid" : "unpaid"}`}
                        >
                          {order.isPaid ? "✅ Paid" : "⏳ Unpaid"}
                        </span>
                      </td>
                      <td>
                        <span
                          className="status-pill"
                          style={{
                            background: statusColors[order.status],
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString("en-NG")}
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateStatus(order._id, e.target.value)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === "users" && (
          <div className="admin-content">
            <div className="admin-section-header">
              <h2>All Users ({users.length})</h2>
            </div>

            {loading ? (
              <p className="admin-loading">Loading users...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Skin Type</th>
                    <th>Hair Type</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.skinType || "—"}</td>
                      <td>{u.hairType || "—"}</td>
                      <td>
                        <span
                          className={`role-pill
                          ${u.isAdmin ? "admin" : "user"}`}
                        >
                          {u.isAdmin ? "👑 Admin" : "👤 User"}
                        </span>
                      </td>
                      <td>
                        {new Date(u.createdAt).toLocaleDateString("en-NG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default AdminDashboard;
