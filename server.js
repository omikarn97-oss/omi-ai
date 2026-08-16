const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(process.cwd()));

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash"
});

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/index.html");
});

app.post("/ask", async (req, res) => {
    try {
        const message = req.body.message;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const result = await model.generateContent(message);
        const reply = result.response.text();

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
