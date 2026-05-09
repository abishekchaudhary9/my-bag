const pool = require("../config/database");
const { emitEvent } = require("../lib/socket");
const createHttpError = require("../utils/httpError");
const { createNotification } = require("./notificationService");

async function listQuestions(productId) {
  const [questions] = await pool.query(
    `SELECT q.id, q.question_text, q.admin_answer, q.created_at, q.user_id,
            u.first_name, u.last_name
     FROM product_questions q
     JOIN users u ON q.user_id = u.id
     WHERE q.product_id = ?
     ORDER BY q.created_at DESC`,
    [productId]
  );

  return {
    questions: questions.map((question) => ({
      id: question.id,
      text: question.question_text,
      answer: question.admin_answer,
      userId: question.user_id,
      name: `${question.first_name} ${question.last_name[0]}.`,
      date: question.created_at,
    })),
    count: questions.length,
  };
}

async function createQuestion(userId, productId, { text }) {
  if (!text) {
    throw createHttpError(400, "Question text is required.");
  }

  const [product] = await pool.query("SELECT id FROM products WHERE id = ?", [productId]);
  if (product.length === 0) {
    throw createHttpError(404, "Product not found.");
  }

  const [result] = await pool.query(
    "INSERT INTO product_questions (product_id, user_id, question_text) VALUES (?, ?, ?)",
    [productId, userId, text]
  );
  const questionId = result.insertId;

  // Notify Admins
  const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
  const [productInfo] = await pool.query("SELECT name, slug FROM products WHERE id = ?", [productId]);

  if (admins.length > 0 && productInfo.length > 0) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "New Product Question",
        `A customer asked a question about the ${productInfo[0].name}.`,
        `/admin?tab=feedback#feedback-question-${questionId}`
      );
    }
  }



  // Real-time: Notify product page and admins
  emitEvent(`product:${productId}`, "new_question", { productId });
  emitEvent("admins", "new_question", { productId, productName: productInfo[0].name });

  return { message: "Question submitted successfully." };
}

async function answerQuestion(user, questionId, { answer }) {
  if (user.role !== "admin") {
    throw createHttpError(403, "Admin only.");
  }

  await pool.query("UPDATE product_questions SET admin_answer = ? WHERE id = ?", [answer, questionId]);

  const [questionData] = await pool.query(
    `SELECT q.user_id, q.product_id, p.slug, p.name
     FROM product_questions q
     JOIN products p ON q.product_id = p.id
     WHERE q.id = ?`,
    [questionId]
  );

  if (questionData.length > 0) {
    await createNotification(
      questionData[0].user_id,
      "Question Answered",
      `Maison has answered your question about the ${questionData[0].name}.`,
      `/product/${questionData[0].slug}#question-${questionId}`
    );
  }



  // Real-time: Notify product page
  emitEvent(`product:${questionData[0].product_id || ""}`, "question_update", { questionId });

  return { message: "Answer added successfully." };
}

async function updateQuestion(user, questionId, { text }) {
  if (!text) {
    throw createHttpError(400, "Question text is required.");
  }

  const [question] = await pool.query(
    "SELECT * FROM product_questions WHERE id = ?",
    [questionId]
  );

  if (question.length === 0) {
    throw createHttpError(404, "Question not found.");
  }

  // Allow admin OR owner
  if (user.role !== "admin" && question[0].user_id !== user.id) {
    throw createHttpError(403, "Unauthorized.");
  }

  await pool.query(
    "UPDATE product_questions SET question_text = ? WHERE id = ?",
    [text, questionId]
  );

  return { message: "Question updated successfully." };
}

async function deleteQuestion(user, questionId) {
  const [question] = await pool.query(
    "SELECT * FROM product_questions WHERE id = ?",
    [questionId]
  );

  if (question.length === 0) {
    throw createHttpError(404, "Question not found.");
  }

  // Allow admin OR owner
  if (user.role !== "admin" && question[0].user_id !== user.id) {
    throw createHttpError(403, "Unauthorized.");
  }

  await pool.query("DELETE FROM product_questions WHERE id = ?", [questionId]);
  return { message: "Question deleted successfully." };
}

module.exports = {
  listQuestions,
  createQuestion,
  answerQuestion,
  updateQuestion,
  deleteQuestion,
};
