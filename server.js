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

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Upload + edit image
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

    res.json({
      image: response.data[0].url,
    });

    fs.unlinkSync(imagePath); // clean up file
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating image");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
