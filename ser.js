const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "YOUR_API_KEY"; // حطي مفتاحك هنا

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "أنت مساعد لموقع Sign It متخصص في مساعدة الصم وذوي الاحتياجات الخاصة بطريقة بسيطة وواضحة"
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            })
        });

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.json({ reply: "حصل خطأ في السيرفر 😢" });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});