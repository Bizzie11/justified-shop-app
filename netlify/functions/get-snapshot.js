exports.handler = async (event) => {
  try {
    const searchTerm = event.queryStringParameters?.search || "";

    const rows = [
      {
        site: "Example",
        price: "$10.00",
        type: "sample",
        source: "mock",
        searchTerm,
      },
    ];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rows }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};