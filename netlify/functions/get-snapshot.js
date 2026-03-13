exports.handler = async (event) => {
  try {
    const { searchTerm = "", selectedSites = [] } = JSON.parse(event.body || "{}");

  const mockPriceMap = {
  Amazon: { price: "$24.99", type: "active" },
  Walmart: { price: "$21.88", type: "active" },
  eBay: { price: "$19.50", type: "active" },
  "eBay Sold": { price: "$22.40", type: "sold" },
};

const rows = selectedSites.map((siteName) => {
  const entry = mockPriceMap[siteName];

  if (!entry) {
    return {
      site: siteName,
      price: "No result",
      type: "unknown",
      source: "mock",
      searchTerm,
    };
  }

  return {
    site: siteName,
    price: entry.price,
    type: entry.type,
    source: "mock",
    searchTerm,
  };
});

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
      body: JSON.stringify({
        error: "Snapshot function failed",
        details: error.message,
      }),
    };
  }
};
