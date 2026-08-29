import { z } from "zod";

const orderItemSchema = z.object({
  product: z.string().min(1, "Product id is required"),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  // price is accepted but ignored server-side — createOrder recalculates
  // every price from the database, never trusting the client.
  price: z.number().optional(),
});

export const createOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, "No order items"),
  deliveryAddress: z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    phone: z.string().trim().min(1, "Phone number is required"),
    address: z.string().trim().min(1, "Address is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
  }),
  deliveryPrice: z.number().nonnegative("Delivery price cannot be negative"),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(1, "Payment reference is required"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});
