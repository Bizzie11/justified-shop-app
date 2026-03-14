async function getEbaySoldPrice(searchTerm) {
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
    searchTerm
  )}&LH_Sold=1&LH_Complete=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`eBay request failed: ${response.status}`);
  }

  const html = await response.text();

  const matches = [...html.matchAll(/\$([0-9]+(?:\.[0-9]{2})?)/g)]
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!matches.length) {
    throw new Error("No eBay sold prices found");
  }

  const topPrices = matches.slice(0, 10);
  const average =
    topPrices.reduce((sum, value) => sum + value, 0) / topPrices.length;
  return `$${average.toFixed(2)}`;
}



exports.handler = async (event) => {






















exports.handler = async (event) => {
  try {
    const { searchTerm = "", selectedSites = [] } = JSON.parse(event.body || "{}");

  const mockPriceMap = {
  Amazon: { price: "$24.99", type: "active" },
  Walmart: { price: "$21.88", type: "active" },
  eBay: { price: "$19.50", type: "active" },
  "eBay Sold": { price: "$22.40", type: "sold" },
};

const rows = await Promise.all(
  selectedSites.map(async (siteName) => {
    if (siteName === "eBay Sold") {
      try {
        const realPrice = await getEbaySoldPrice(searchTerm);
        return {
          site: siteName,
          price: realPrice,
          type: "sold",
          source: "live",
          searchTerm,
        };
      } catch {
        return {
          site: siteName,
          price: "$22.40",
          type: "sold",
          source: "mock",
          searchTerm,
        };
      }
    }

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
  })
);

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
