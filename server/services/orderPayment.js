import Order from "../models/Order.js";
import Product from "../models/Product.js";
import logger from "../utils/logger.js";

// Marks an unpaid order as paid and commits its stock, exactly once.
//
// Stock is reserved here — at payment — rather than at order creation, so
// abandoned or never-paid orders can't drain inventory. The paid flag is
// flipped with a conditional update ({ isPaid: false }), so if the checkout
// verify call and the Paystack webhook race on the same order, only one of
// them wins and stock is decremented once.
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

  return order;
}
