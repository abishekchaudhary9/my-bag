const contactService = require("../services/contactService");

async function createContactMessage(req, res) {
  const result = await contactService.sendMessage(req.body);
  res.status(201).json(result);
}

module.exports = { createContactMessage };
