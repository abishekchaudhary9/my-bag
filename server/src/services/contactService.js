const ContactMessage = require("../models/contactModel");
const { emitEvent } = require("../lib/socket");

async function sendMessage(data) {
  const message = new ContactMessage({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message
  });
  await message.save();

  // Real-time: Notify admins of new contact message
  emitEvent("admins", "new_message", {
    name: data.name,
    email: data.email,
    subject: data.subject
  });

  return { message: "Message sent successfully" };
}

module.exports = {
  sendMessage
};