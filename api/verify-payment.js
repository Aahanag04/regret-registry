import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      regretData
    } = req.body;

    // create signature string
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // verify using payment secret (NOT webhook secret here)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("SIGNATURE MISMATCH");
      return res.status(400).json({ success: false });
    }

    // connect supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // save regret
    const { error } = await supabase.from("regrets").insert([
      {
        text: regretData.text,
        display_name: regretData.display_name || null,
        category: regretData.category,
        payment_id: razorpay_payment_id,
        approved: true
      }
    ]);

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return res.status(500).json({ success: false });
    }

    return res.json({ success: true });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ success: false });
  }
}