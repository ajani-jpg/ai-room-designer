import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/upload", (req, res) => {
  res.send(`
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
  `);
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const prompt = "Modern interior room design";

    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024"
    });

    res.send(`
      <h2>Generated Image:</h2>
      <img src="${result.data[0].url}" />
    `);
  } catch (error) {
    console.error(error);
    res.send("Error generating image: " + error.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
