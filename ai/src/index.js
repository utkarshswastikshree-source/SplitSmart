
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const receiptRoutes = require("./routes/receipt");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "SplitSmart AI Service is running!"
    });
});

app.use("/api", receiptRoutes);

const PORT = process.env.PORT || 5001;

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from .env");
}

app.listen(PORT, () => {
    console.log(`SplitSmart AI running on port ${PORT}`);
});
