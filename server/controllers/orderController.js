import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendWhatsApp, messages } from "../services/whatsappService.js";
import { awardPoints } from "./loyaltyController.js";
import fetch from "node-fetch";
import {
  whatsappQueue,
  emailQueue,
  pointsQueue,
  addToQueue,
} from "../queues/index.js";
import { emailTemplates } from "../services/emailService.js";
import logger from "../utils/logger.js";

// @desc   Create new order
// @route  POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { orderItems, deliveryAddress, deliveryPrice } = req.body;

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

    // ── REDUCE STOCK
    for (const item of validatedItems) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true },
      );

      if (!updated) {
        throw new Error("Stock update failed");
      }
    }

    // ── OPTIONAL: AUTO UPDATE isInStock
    for (const item of validatedItems) {
      const updatedProduct = await Product.findById(item.product);

      if (updatedProduct.stock <= 0) {
        updatedProduct.isInStock = false;
        await updatedProduct.save();
      }
    }

    // Send WhatsApp order confirmation
    const phone = order.deliveryAddress?.phone;
    const name = order.deliveryAddress?.fullName || "Customer";
    const orderId = order._id.toString().slice(-8).toUpperCase();

    if (phone) {
      const orderId = order._id.toString().slice(-8).toUpperCase();

      // WhatsApp queue
      await addToQueue(whatsappQueue, "order-confirmed", {
        phone,
        message: messages.orderConfirmed(name, orderId, order.totalPrice),
        type: "order-confirmed",
      });

      // Email queue
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
    }

    logger.info({ orderId: order._id }, "Order created");

    res.status(201).json(order);
  } catch (error) {
    logger.error({ err: error }, "createOrder error");

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

    // A Paystack reference is a one-time proof of payment for one
    // transaction — without this check, a reference from an order a user
    // already legitimately paid for could be replayed here to mark a
    // *different*, unpaid order (of the same total) as paid for free.
    const referenceInUse = await Order.findOne({
      "paymentResult.reference": reference,
      _id: { $ne: order._id },
    });
    if (referenceInUse) {
      return res.status(400).json({
        message: "This payment reference has already been used",
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

    logger.info(
      { status: paystackData?.status, reference: paystackData?.data?.reference },
      "Paystack verify response received",
    );

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

    // Award loyalty points (₦1 spent = 0.01 points, minimum 1 point)
    const pointsEarned = Math.max(1, Math.floor(order.totalPrice * 0.01));

    await addToQueue(pointsQueue, "purchase-points", {
      userId: order.user.toString(),
      points: pointsEarned,
      reason: `Purchase #${order._id.toString().slice(-8).toUpperCase()}`,
    });

    logger.info({ orderId: updatedOrder._id }, "Order marked as paid");

    res.json(updatedOrder);
  } catch (error) {
    logger.error({ err: error }, "verifyPayment error");

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

    if (phone) {
      if (status === "shipped") {
        await addToQueue(whatsappQueue, "order-shipped", {
          phone,
          message: messages.orderShipped(name, orderId),
          type: "order-shipped",
        });

        const template = emailTemplates.orderShipped(name, orderId);

        await addToQueue(emailQueue, "order-shipped", {
          to: orderUserEmail,
          subject: template.subject,
          html: template.html,
          type: "order-shipped",
        });
      }

      if (status === "delivered") {
        await addToQueue(whatsappQueue, "order-delivered", {
          phone,
          message: messages.orderDelivered(name),
          type: "order-delivered",
        });

        const template = emailTemplates.orderDelivered(name);

        await addToQueue(emailQueue, "order-delivered", {
          to: orderUserEmail,
          subject: template.subject,
          html: template.html,
          type: "order-delivered",
        });
      }
    }

    logger.info({ orderId: order._id, status }, "Order status updated");
    res.json(order);
  } catch (error) {
    // This catches invalid transitions too
    res.status(400).json({ message: error.message });
  }
};
