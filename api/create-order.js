import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {

  // only allow POST requests (important for Vercel)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    console.log("Creating order...");

    const order = await razorpay.orders.create({
      amount: 8700, // ₹87
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    console.log("Order created:", order.id);

    return res.status(200).json(order);

  } catch (err) {
    console.error("ORDER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}