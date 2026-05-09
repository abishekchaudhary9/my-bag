const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { authenticate } = require("../middleware/auth");

router.post("/summarize", authenticate, aiController.summarize);
router.post("/search-assistant", aiController.searchAssistant);

module.exports = router;
