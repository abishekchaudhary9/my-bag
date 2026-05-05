const express = require("express");
const contactController = require("../controllers/contactController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", asyncHandler(contactController.createContactMessage));

module.exports = router;
