const express = require("express");
const questionController = require("../controllers/questionController");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/:productId", asyncHandler(questionController.listQuestions));
router.post("/:productId", authenticate, asyncHandler(questionController.createQuestion));
router.put("/:questionId/answer", authenticate, asyncHandler(questionController.answerQuestion));
router.put("/:questionId", authenticate, asyncHandler(questionController.updateQuestion));
router.delete("/:questionId", authenticate, asyncHandler(questionController.deleteQuestion));

module.exports = router;
