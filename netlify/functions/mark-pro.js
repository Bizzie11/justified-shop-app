const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
  console.log("SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const { session_id } = JSON.parse(event.body || "{}");

    if (!session_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing session_id" }),
      };
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (
      !session ||
      session.mode !== "subscription" ||
      session.payment_status !== "paid" ||
      !session.customer_details?.email
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Checkout not verified" }),
      };
    }

    const email = session.customer_details.email.toLowerCase();

  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Prefer": "resolution=merge-duplicates"
  },
  body: JSON.stringify({
    email,
    is_pro: true
  })
});

if (!res.ok) {
  const text = await res.text();
  throw new Error(`Supabase error: ${text}`);
}

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, email }),
    };
  } catch (error) {
    console.error("mark-pro error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Something went wrong" }),
    };
  }
};