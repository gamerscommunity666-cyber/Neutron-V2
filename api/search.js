export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { query } = req.body || {};

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Search query is required"
      });
    }

    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "TAVILY_API_KEY is not configured"
      });
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query.trim(),
        search_depth: "basic",
        topic: "general",
        max_results: 5,
        include_answer: false,
        include_raw_content: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.detail || data?.message || "Web search failed"
      });
    }

    const results = (data.results || []).map((item) => ({
      title: item.title || "",
      url: item.url || "",
      content: item.content || ""
    }));

    return res.status(200).json({
      query: query.trim(),
      results
    });

  } catch (error) {
    console.error("Search error:", error);

    return res.status(500).json({
      error: "Something went wrong while searching the web"
    });
  }
}
