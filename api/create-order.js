export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const RazorpayModule = await import("razorpay");
    const Razorpay = RazorpayModule.default;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        error: "Missing Razorpay environment variables"
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 8700,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    return res.status(200).json(order);

  } catch (err) {
    console.error("ORDER ERROR:", err);
    return res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
}