
const express = require("express");
const multer = require("multer");
const { scanReceipt } = require("../services/gemini");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error("Only JPG, PNG and WEBP images are allowed.")
            );
        }

        callback(null, true);
    }
});

router.post("/scan-receipt", upload.single("receipt"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "Please upload a receipt image."
            });
        }

        const receiptData = await scanReceipt(
            req.file.buffer,
            req.file.mimetype
        );

        return res.status(200).json({
            success: true,
            data: receiptData
        });

    } catch (error) {
        console.error("Receipt scanning error:", error.message);

        return res.status(422).json({
            success: false,
            error: "Unable to read this receipt. Please upload a clearer image."
        });
    }
});

module.exports = router;
