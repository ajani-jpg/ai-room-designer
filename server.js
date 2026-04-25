import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Home page (simple upload form)
app.get("/", (req, res) => {
  res.send(`
    <h2>Upload a room image</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="image" />
      <button type="submit">Upload</button>
    </form>
  `);
});

// Upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No image uploaded");
    }

    const imagePath = req.file.path;

    const response = await openai.images.edit({
      model: "dall-e-2",
      image: fs.createReadStream(imagePath),
      prompt: "Make this room look modern and aesthetic",
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    res.send(`
      <h2>Result:</h2>
      <img src="${imageUrl}" style="max-width:500px;" />
      <br/><br/>
      <a href="/">Try another</a>
    `);

    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating image");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
