const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const { plan } = JSON.parse(event.body || "{}");

    let priceId = "";

    if (plan === "monthly") {
  priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
} else if (plan === "annual") {
  priceId = process.env.STRIPE_PRICE_ANNUAL;
}else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid plan selected" }),
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url:
        "https://justifiedshop.netlify.app/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://justifiedshop.netlify.app/cancel",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Something went wrong",
      }),
    };
  }
};