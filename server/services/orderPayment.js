import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { pointsQueue, addToQueue } from "../queues/index.js";
import { queryTransaction } from "./monnify.js";
import logger from "../utils/logger.js";

// Monnify statuses that mean the customer paid at least the full amount.
const PAID_STATUSES = new Set(["PAID", "OVERPAID"]);

// Asks Monnify whether the order's payment went through and, if so, marks the
// order paid. This is the single path for confirming a payment — the checkout
// verify endpoint and the webhook both call it — so neither ever trusts what
// the browser or the webhook payload claims.
//
// Returns { ok: true, order } or { ok: false, status, message }.
export async function confirmOrderPayment(order, { expectedEmail } = {}) {
  if (order.isPaid) {
    return { ok: false, status: 400, message: "Order already paid" };
  }
  if (!order.paymentReference) {
    return {
      ok: false,
      status: 400,
      message: "No payment has been started for this order",
    };
  }

  const txn = await queryTransaction(order.paymentReference);

  logger.info(
    { orderId: order._id, paymentStatus: txn.paymentStatus },
    "Monnify transaction status received",
  );

  if (!PAID_STATUSES.has(txn.paymentStatus)) {
    return {
      ok: false,
      status: 400,
      message: `Payment not successful (${txn.paymentStatus})`,
    };
  }

  const amountPaid = Number(txn.amountPaid);
  if (!(amountPaid >= order.totalPrice)) {
    return { ok: false, status: 400, message: "Payment amount mismatch" };
  }

  const payerEmail = txn.customer?.email;
  if (
    expectedEmail &&
    payerEmail &&
    payerEmail.toLowerCase() !== expectedEmail.toLowerCase()
  ) {
    return { ok: false, status: 400, message: "Payment email mismatch" };
  }

  const updated = await markOrderPaid(
    { _id: order._id },
    {
      reference: txn.paymentReference,
      transactionReference: txn.transactionReference,
      status: txn.paymentStatus,
      amount: amountPaid,
      channel: txn.paymentMethod,
      paidAt: txn.paidOn,
    },
  );

  // Lost a race with the other confirmation path — it's paid either way.
  if (!updated) {
    return { ok: false, status: 400, message: "Order already paid" };
  }
  return { ok: true, order: updated };
}

// Marks an unpaid order as paid, commits its stock and awards loyalty points,
// exactly once.
//
// Stock is reserved here — at payment — rather than at order creation, so
// abandoned or never-paid orders can't drain inventory. The paid flag is
// flipped with a conditional update ({ isPaid: false }), so if the checkout
// verify call and the webhook race on the same order, only one of them wins
// and stock/points are applied once.
//
// Returns the updated order, or null if the order was already paid (or
// doesn't match `filter`).
export async function markOrderPaid(filter, paymentResult) {
  const order = await Order.findOneAndUpdate(
    { ...filter, isPaid: false },
    {
      $set: {
        isPaid: true,
        paidAt: new Date(),
        status: "processing",
        paymentResult,
      },
    },
    { new: true },
  );

  if (!order) return null;

  const shortfalls = [];

  for (const item of order.orderItems) {
    // Conditional decrement: never takes stock below zero.
    const product = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true },
    );

    if (!product) {
      // Someone else bought the last units while this customer was paying.
      // The money is already taken, so the order stays paid — record the
      // shortfall where the admin will see it instead of failing silently.
      shortfalls.push(`${item.name} (×${item.quantity})`);
      continue;
    }

    if (product.stock <= 0 && product.isInStock) {
      product.isInStock = false;
      await product.save();
    }
  }

  if (shortfalls.length > 0) {
    order.statusHistory.push({
      status: order.status,
      note: `Paid but out of stock at payment time: ${shortfalls.join(", ")}. Restock or refund.`,
    });
    await order.save();
    logger.warn(
      { orderId: order._id, shortfalls },
      "Order paid but stock was insufficient for some items",
    );
  }

  // Loyalty points (₦1 spent = 0.01 points, minimum 1 point).
  await addToQueue(pointsQueue, "purchase-points", {
    userId: order.user.toString(),
    points: Math.max(1, Math.floor(order.totalPrice * 0.01)),
    reason: `Purchase #${order._id.toString().slice(-8).toUpperCase()}`,
  });

  return order;
}
