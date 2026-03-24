async function readJsonBody(req) {
  if (req?.body && typeof req.body === "object") return req.body;

  return await new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const { message } = body || {};
    const userMessage = typeof message === "string" ? message.trim() : "";

    if (!userMessage) {
      res.status(400).json({ error: "Missing message" });
      return;
    }

    const systemPrompt =
      "You are AskMe, an AI assistant for a personal portfolio website. Answer questions only about the candidate using the portfolio info provided below. If something is not in the info, say you don't have that detail and suggest contacting via email/LinkedIn. Keep responses concise, recruiter-friendly, and structured with short bullet points when helpful.\n\n" +
      "Portfolio info:\n" +
      "Name: Ritesh Kumar Paswan\n" +
      "Role: Aspiring Data Scientist | Data Analyst\n" +
      "Location: Punjab, India\n" +
      "Email: riteshkumarpaswan538@gmail.com\n" +
      "LinkedIn: https://www.linkedin.com/in/ritesh232\n" +
      "GitHub: https://github.com/Ritesh2332\n" +
      "Skills/Tools: Python (Pandas, NumPy, Scikit-learn), SQL/MySQL, Power BI, Matplotlib, Seaborn, Git/GitHub, Hadoop\n" +
      "Focus: Data-driven problem solving, dashboards, ML models\n" +
      "Availability: Open to Data Science / Data Analytics internships\n" +
      "Projects include: Prison Analytics Dashboard (Power BI KPIs), HR Analytics Employee Performance, Iris Flower Classification (Scikit-learn + Streamlit), AI News Sentiment Analyzer, Mortgage Calculator ChatBot\n" +
      "Certificates include: Oracle Cloud Infrastructure Data Science Professional, Oracle Cloud Infrastructure AI Associate, Deloitte Data Analytics Job Simulation, Data Science 101 (IBM SkillsBuild), DSA certificate\n";

    const url =
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt + "\nUser question: " + userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 400,
      },
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("Gemini request failed", txt);
      res.status(500).json({ error: "Gemini request failed", details: txt });
      return;
    }

    const data = await r.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("\n") ||
      "";

    res.status(200).json({ reply: text || "Sorry, I couldn't generate a response." });
  } catch (e) {
    console.error("/api/chat error", e);
    res.status(500).json({ error: "Server error" });
  }
};
