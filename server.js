import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Home page (upload form)
app.get("/", (req, res) => {
  res.send(`
    <h1>AI Room Designer</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="image" required />
      <button type="submit">Upload & Redesign</button>
    </form>
  `);
});

// Handle image upload
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    const result = await openai.images.edit({
      model: "gpt-image-1",
      prompt: "Redesign this room to look modern, aesthetic, and well-lit",
      image: fs.createReadStream(imagePath),
    });

    const image_base64 = result.data[0].b64_json;

    res.send(`
      <h2>Redesigned Room</h2>
      <img src="data:image/png;base64,${image_base64}" />
      <br><br>
      <a href="/">Try another</a>
    `);
  } catch (error) {
    console.error(error);
    res.send("Error generating image: " + error.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
