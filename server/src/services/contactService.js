const ContactMessage = require("../models/contactModel");

async function sendMessage(data) {
  const message = new ContactMessage({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message
  });
  await message.save();
  return { message: "Message sent successfully" };
}

module.exports = {
  sendMessage
};
