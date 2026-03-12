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

    if (plan === "pro-monthly") {
      priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
    } else if (plan === "annual") {
      priceId = process.env.STRIPE_PRICE_ANNUAL;
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid plan selected" }),
      };
    }

    const baseUrl = process.env.URL || "https://justifiedshop.netlify.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      allow_promotion_codes: true,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to create checkout session",
      }),
    };
  }
};
