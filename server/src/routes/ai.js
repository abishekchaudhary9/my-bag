const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/summarize", authenticate, aiController.summarize);
router.post("/generate-description", authenticate, requireAdmin, aiController.generateDescription);
router.post("/draft-reply", authenticate, requireAdmin, aiController.draftReply);
router.post("/analyze-sentiment", authenticate, aiController.analyzeSentiment);
router.post("/concierge", aiController.chatAssistant);
router.post("/visual-search", upload.single("image"), aiController.visualSearch);

module.exports = router;
