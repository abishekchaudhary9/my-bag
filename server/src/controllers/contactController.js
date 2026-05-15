const contactService = require("../services/contactService");
const { success } = require("../utils/responseHandler");

async function createContactMessage(req, res) {
  const result = await contactService.sendMessage(req.body);
  res.status(201).json(success(result, "Message sent successfully", 201));
}

module.exports = { createContactMessage };
