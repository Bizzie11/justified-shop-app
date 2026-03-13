exports.handler = async (event) => {
  try {
    const { searchTerm = "", selectedSites = [] } = JSON.parse(event.body || "{}");

    const mockPriceMap = {
      Amazon: "$24.99",
      Walmart: "$21.88",
      eBay: "$19.50",
      "eBay Sold": "$22.40",
      Google: "Search only",
      Target: "No result",
    };

    const rows = selectedSites.map((siteName) => ({
      site: siteName,
      price: mockPriceMap[siteName] || "No result",
      source: "mock",
      status: mockPriceMap[siteName] ? "Preview" : "No result",
      searchTerm,
    }));

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
