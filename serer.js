const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

// API لتوليد الصورة
app.post("/generate", (req, res) => {
  const prompt = req.body.prompt;

  exec(`python generate.py "${prompt}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      message: "Image generated successfully",
      output: stdout
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});