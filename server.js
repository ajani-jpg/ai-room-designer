import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const app = express();
const upload = multer({ dest: "uploads/" });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Serve homepage
app.get("/", (req, res) => {
  res.send(`
    <h1>AI Room Designer</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="image" required />
      <select name="style">
        <option value="modern">Modern</option>
        <option value="luxury">Luxury</option>
        <option value="minimalist">Minimalist</option>
      </select>
      <button type="submit">Generate Design</button>
    </form>
  `);
});

// Handle upload
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const style = req.body.style || "modern";
    const imagePath = req.file.path;

    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const prompt = `Redesign this room in ${style} interior design style`;

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024",
      image: base64Image,
    });

    const imageBase64 = result.data[0].b64_json;
    const outputPath = path.join("uploads", "output.png");

    fs.writeFileSync(outputPath, Buffer.from(imageBase64, "base64"));

    res.send(`
      <h2>Generated Design</h2>
      <img src="data:image/png;base64,${imageBase64}" width="500"/>
      <br/><br/>
      <a href="/">Go Back</a>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating image: " + err.message);
  }
});

// ✅ IMPORTANT: Render-compatible port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});