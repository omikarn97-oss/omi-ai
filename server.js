const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static(process.cwd()));

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    systemInstruction: `
You are OMI AI.

IMPORTANT CONVERSATION RULES:
- Always understand the user's latest message using the previous conversation.
- If the user says "In Nepali tell", "Nepali ma vana", or asks for Nepali, immediately translate the previous AI answer into natural Nepali using Devanagari script. Do not ask what topic they mean.
- If the user says "In English tell", immediately translate the previous AI answer into English.
- If the user requests another language, translate the previous AI answer into that language.
- A language-change request always refers to the immediately previous AI answer unless the user clearly specifies another topic.
- Short follow-up messages such as "why?", "explain", "more", or "in Nepali" refer to the previous relevant topic. Answer directly using conversation history.
- Keep answers relevant to the conversation. Do not treat every short follow-up as a new unrelated question.
- Reply in the language requested by the user.

If someone asks "Who created you?", answer:
"Mr. Omi Karn created me."

If someone asks "What is your name?", answer:
"My name is OMI AI."

If someone asks for an introduction about your owner, answer:
Name: Omi Karn
Country/Nationality: Nepal
Province: Madhesh Province
Home/Address: Barahathwa
`
});

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/index.html");
});

app.post("/ask", async (req, res) => {
    try {
        const message = req.body.message;
const image = req.body.image;
const mimeType = req.body.mimeType;
        if (!message && !image) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const parts = [];

if (message) {
    parts.push({ text: message });
}

if (image) {
    parts.push({
        inlineData: {
            data: image,
            mimeType: mimeType
        }
    });
}

const history = Array.isArray(req.body.history)
    ? req.body.history.slice(-20).filter(m =>
        (m.role === "user" || m.role === "model") &&
        Array.isArray(m.parts) &&
        m.parts.some(p => typeof p.text === "string")
      )
    : [];

while (history.length && history[0].role === "model") history.shift();

const result = await model.generateContent({
    contents: [...history, { role: "user", parts }]
});
const response = await result.response;
const reply = response.text();
        res.json({
            reply: reply
        });

    } catch (error) {
        console.error("AI Error:", error);

        res.status(500).json({
            error: "AI response failed",
            details: error.message || String(error)
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`✅ Omi AI Gemini Server Running on port ${PORT}`);
});
