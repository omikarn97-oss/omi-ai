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
    model: "gemini-3.6-flash",
    systemInstruction: `
You are OMI AI.

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

const result = await model.generateContent(parts);
const response = await result.response;
const reply = response.text();
        res.json({
            reply: reply
        });

    } catch (error) {
        console.error("AI Error:", error);

        res.status(500).json({
            error: "AI response failed"
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`✅ Omi AI Gemini Server Running on port ${PORT}`);
});
