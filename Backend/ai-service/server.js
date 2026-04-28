const express = require("express"); // import libraries
const cors = require("cors");
const axios = require("axios"); 
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const safeParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

app.post("/query", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `
Extract:
- ocean (atlantic, pacific, indian, arctic, southern)
- chartType (line or bar)

Return ONLY JSON:
{
  "ocean": "",
  "chartType": ""
}
`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const raw = response.data.choices[0].message.content;

    const parsed = safeParse(raw);

    if (!parsed) {
      return res.status(400).json({
        error: "Invalid AI response",
        raw: raw
      });
    }

    return res.json(parsed);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message
    });
  }
});

app.listen(5002, () => {
  console.log("AI Service running on port 5002");
});
// 