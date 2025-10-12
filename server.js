import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";

const app = express();
const __dirname = path.resolve();

app.use(cors()); // ✅ Allow all origins
app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

app.post("/save-leaves", (req, res) => {
  const { html } = req.body;

  // ⚠️ Save the HTML to the correct file path
  const filePath = path.join(__dirname, "index2.html");

  fs.writeFile(filePath, html, (err) => {
    if (err) {
      console.error("❌ Error saving file:", err);
      return res.status(500).send("Error saving file");
    }
    console.log("✅ index2.html updated!");
    res.send("Saved successfully");
  });
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
