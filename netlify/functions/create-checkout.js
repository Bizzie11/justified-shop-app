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

<<<<<<< HEAD
    if (plan === "monthly") {
  priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
} else if (plan === "annual") {
  priceId = process.env.STRIPE_PRICE_ANNUAL;
}else {
=======
    if (plan === "pro-monthly") {
      priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
    } else if (plan === "annual") {
      priceId = process.env.STRIPE_PRICE_ANNUAL;
    } else {
>>>>>>> 08b940da27fd93490575905771df0175d5cdb675
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid plan selected" }),
      };
    }

<<<<<<< HEAD
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
=======
    const baseUrl = process.env.URL || "https://justifiedshop.netlify.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
>>>>>>> 08b940da27fd93490575905771df0175d5cdb675
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
<<<<<<< HEAD
      success_url:
        "https://justifiedshop.netlify.app/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://justifiedshop.netlify.app/cancel",
=======
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      allow_promotion_codes: true,
>>>>>>> 08b940da27fd93490575905771df0175d5cdb675
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
<<<<<<< HEAD
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Something went wrong",
      }),
    };
  }
};
=======
    console.error("Stripe checkout error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to create checkout session",
      }),
    };
  }
};
>>>>>>> 08b940da27fd93490575905771df0175d5cdb675
