import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendWhatsApp, messages } from "../services/whatsappService.js";
import { awardPoints } from "./loyaltyController.js";
import {
  whatsappQueue,
  emailQueue,
  addToQueue,
} from "../queues/index.js";
import { emailTemplates } from "../services/emailService.js";
import logger from "../utils/logger.js";
import { DELIVERY_FEE } from "../config/shipping.js";
import { confirmOrderPayment } from "../services/orderPayment.js";
import { getMonnifyConfig } from "../services/monnify.js";

// @desc   Create new order
// @route  POST /api/orders
export const createOrder = async (req, res) => {
  try {
    // deliveryPrice from the client is deliberately ignored — the server sets
    // the fee, otherwise a tampered request could skip it entirely.
    const { orderItems, deliveryAddress } = req.body;
    const deliveryPrice = DELIVERY_FEE;

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

    // ── STOCK CHECK
    const stockErrors = [];

    for (const item of orderItems) {
      const product = productMap.get(item.product.toString());

      if (!product) {
        stockErrors.push(`Product not found: ${item.product}`);
        continue;
      }

      if (!item.quantity || item.quantity < 1) {
        stockErrors.push(`Invalid quantity for ${product.name}`);
        continue;
      }

      if (product.stock !== undefined && product.stock < item.quantity) {
        stockErrors.push(
          `"${product.name}" only has ${product.stock} left in stock`,
        );
      }
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({
        message: stockErrors.join(", "),
      });
    }

    // ── BUILD VALIDATED ITEMS
    for (const item of orderItems) {
      const product = productMap.get(item.product.toString());

      itemsPrice += product.price * item.quantity;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const totalPrice = itemsPrice + deliveryPrice;

    // ── CREATE ORDER
    const order = await Order.create({
      user: req.user._id,

      orderItems: validatedItems,

      deliveryAddress,

      itemsPrice,

      deliveryPrice,

      totalPrice,

      status: "pending",

      isPaid: false,
    });

    // Stock is only checked here, not decremented — it's committed once
    // payment is confirmed (see services/orderPayment.js), so unpaid orders
    // never hold inventory.

    // Notify the customer — email always fires (every account has one);
    // WhatsApp only fires when a delivery phone was actually given.
    const phone = order.deliveryAddress?.phone;
    const name = order.deliveryAddress?.fullName || "Customer";
    const orderId = order._id.toString().slice(-8).toUpperCase();

    if (phone) {
      await addToQueue(whatsappQueue, "order-confirmed", {
        phone,
        message: messages.orderConfirmed(name, orderId, order.totalPrice),
        type: "order-confirmed",
      });
    }

    const template = emailTemplates.orderConfirmed(
      name,
      orderId,
      order.totalPrice,
      order.orderItems,
    );

    await addToQueue(emailQueue, "order-confirmed", {
      to: req.user.email,
      subject: template.subject,
      html: template.html,
      type: "order-confirmed",
    });

    logger.info({ orderId: order._id }, "Order created");

    res.status(201).json(order);
  } catch (error) {
    logger.error({ err: error }, "createOrder error");

    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc   Start a Monnify payment for an order
// @route  POST /api/orders/:id/pay/init
// Generates the payment reference and saves it on the order *before* the
// customer pays, then returns everything the Monnify web SDK needs. The amount
// is the server's order total — never a client-side figure.
export const initPayment = async (req, res) => {
  try {
    const monnify = getMonnifyConfig();
    if (!monnify.isConfigured) {
      logger.error("Monnify is not configured (MONNIFY_* env vars missing)");
      return res.status(500).json({
        message: "Payments are temporarily unavailable. Please try again later.",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: "Order already paid" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Order cannot be paid in current state" });
    }

    // A fresh reference per attempt (Monnify rejects reused references), tied
    // to this order so a webhook for it can only ever settle this order.
    order.paymentReference = `GF-${order._id}-${Date.now()}`;
    await order.save();

    res.json({
      reference: order.paymentReference,
      amount: order.totalPrice,
      currency: "NGN",
      customerName: order.deliveryAddress?.fullName || req.user.name,
      customerEmail: req.user.email,
      apiKey: monnify.apiKey,
      contractCode: monnify.contractCode,
      isTestMode: monnify.isTestMode,
    });
  } catch (error) {
    logger.error({ err: error }, "initPayment error");
    res.status(500).json({ message: error.message });
  }
};

// @desc   Verify a Monnify payment with Monnify & mark the order as paid
// @route  PUT /api/orders/:id/pay
export const verifyPayment = async (req, res) => {
  const { reference } = req.body;

  try {
    if (!getMonnifyConfig().isConfigured) {
      return res.status(500).json({
        message: "Payments are temporarily unavailable. Please try again later.",
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: "Order already paid" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Order cannot be paid in current state" });
    }

    // The client may echo back the reference it paid with; it must be the
    // one we issued for this order.
    if (reference && reference !== order.paymentReference) {
      return res
        .status(400)
        .json({ message: "Payment reference does not match this order" });
    }

    const result = await confirmOrderPayment(order, {
      expectedEmail: req.user.email,
    });
    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    logger.info({ orderId: result.order._id }, "Order marked as paid");
    res.json(result.order);
  } catch (error) {
    logger.error({ err: error }, "verifyPayment error");
    res.status(500).json({ message: error.message });
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

// @desc   Update order status (admin only)
// @route  PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Use the state machine method (prevents invalid transitions)
    order.advanceStatus(status, note);
    await order.save();

    const phone = order.deliveryAddress?.phone;
    const name = order.deliveryAddress?.fullName || "Customer";
    const orderId = order._id.toString().slice(-8).toUpperCase();
    const orderUserEmail = (await Order.findById(order._id).populate("user"))
      .user.email;

    if (status === "shipped") {
      if (phone) {
        await addToQueue(whatsappQueue, "order-shipped", {
          phone,
          message: messages.orderShipped(name, orderId),
          type: "order-shipped",
        });
      }

      const template = emailTemplates.orderShipped(name, orderId);

      await addToQueue(emailQueue, "order-shipped", {
        to: orderUserEmail,
        subject: template.subject,
        html: template.html,
        type: "order-shipped",
      });
    }

    if (status === "delivered") {
      if (phone) {
        await addToQueue(whatsappQueue, "order-delivered", {
          phone,
          message: messages.orderDelivered(name),
          type: "order-delivered",
        });
      }

      const template = emailTemplates.orderDelivered(name);

      await addToQueue(emailQueue, "order-delivered", {
        to: orderUserEmail,
        subject: template.subject,
        html: template.html,
        type: "order-delivered",
      });
    }

    logger.info({ orderId: order._id, status }, "Order status updated");
    res.json(order);
  } catch (error) {
    // This catches invalid transitions too
    res.status(400).json({ message: error.message });
  }
};
