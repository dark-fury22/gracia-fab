import Order from "../models/Order.js";
import Product from "../models/Product.js";
import fetch from "node-fetch";

// WhatsApp notification helper
const sendWhatsAppNotification = async (phone, message) => {
  try {
    if (!phone) {
      console.log("No phone number provided");
      return;
    }

    // Remove non-numeric characters
    const formattedPhone = phone.replace(/\D/g, "");

    // Basic validation
    if (formattedPhone.length < 10) {
      console.log("Invalid phone number");
      return;
    }

    console.log(`📱 WhatsApp to ${formattedPhone}: ${message}`);

    /*
    FUTURE REAL INTEGRATION:

    await fetch('https://api.twilio.com/...', {
      method: 'POST',
      headers: {...},
      body: JSON.stringify({...})
    })
    */
  } catch (err) {
    console.error("WhatsApp notification failed:", err.message);
  }
};

// @desc   Create new order
// @route  POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { orderItems, deliveryAddress, deliveryPrice } = req.body;

    // Validate order items
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        message: "No order items",
      });
    }

    if (typeof deliveryPrice !== "number" || deliveryPrice < 0) {
      return res.status(400).json({
        message: "Invalid delivery price",
      });
    }

    // Recalculate prices from database
    let itemsPrice = 0;

    const validatedItems = [];

    const productIds = orderItems.map((i) => i.product);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    // quick lookup map
    const productMap = new Map();
    products.forEach((p) => productMap.set(p._id.toString(), p));

    let itemsPrice = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const product = productMap.get(item.product);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product}`,
        });
      }

      if (!item.qty || item.qty < 1) {
        return res.status(400).json({
          message: "Invalid quantity",
        });
      }

      itemsPrice += product.price * item.qty;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        qty: item.qty,
      });
    }

    const totalPrice = itemsPrice + deliveryPrice;

    const order = await Order.create({
      user: req.user._id,

      orderItems: validatedItems,

      deliveryAddress,

      deliveryPrice,

      totalPrice,

      status: "pending",

      isPaid: false,
    });
    await sendWhatsAppNotification(
      order.deliveryAddress.phone,
      `✅ Order #${order._id.toString().slice(-8).toUpperCase()} confirmed!

Total: ₦${order.totalPrice.toLocaleString()}

We’re preparing your beauty essentials 💄`,
    );

    res.status(201).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc   Verify Paystack payment & mark order as paid
// @route  PUT /api/orders/:id/pay
export const verifyPayment = async (req, res) => {
  const { reference } = req.body;

  try {
    // Validate reference
    if (!reference) {
      return res.status(400).json({
        message: "Payment reference is required",
      });
    }

    // Check secret key
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        message: "Paystack secret key missing",
      });
    }

    // Find order first
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Ensure owner
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // Prevent double payment
    if (order.isPaid) {
      return res.status(400).json({
        message: "Order already paid",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Order cannot be paid in current state",
      });
    }

    // Verify payment with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const paystackData = await paystackRes.json();

    console.log("PAYSTACK RESPONSE:", paystackData);

    // Check Paystack response
    if (!paystackData.status) {
      return res.status(400).json({
        message: paystackData.message,
      });
    }

    // Ensure transaction successful
    if (paystackData.data.status !== "success") {
      return res.status(400).json({
        message: `Payment not successful (${paystackData.data.status})`,
      });
    }

    // Verify amount
    const paidAmount = paystackData.data.amount / 100;

    if (Math.round(paidAmount) !== Math.round(order.totalPrice)) {
      return res.status(400).json({
        message: "Payment amount mismatch",
      });
    }

    if (
      paystackData.data.customer?.email &&
      paystackData.data.customer.email !== req.user.email
    ) {
      return res.status(400).json({
        message: "Payment email mismatch",
      });
    }

    // Mark order paid
    order.isPaid = true;

    order.paidAt = Date.now();

    order.status = "processing";

    order.paymentResult = {
      reference: paystackData.data.reference,
      status: paystackData.data.status,
      amount: paidAmount,
      paidAt: paystackData.data.paid_at,
    };

    const updatedOrder = await order.save();

    console.log("ORDER PAID:", updatedOrder._id);

    res.json(updatedOrder);
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc   Get logged in user orders
// @route  GET /api/orders/myorders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc   Get order by ID
// @route  GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Ensure owner
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
