import QuestionOfTheDay from "../db/models/QuestionOfTheDay";
import Question from "../db/models/Question";
import connectDB from "../db/connection";

export const qotdService = {
  async getTodaysQuestion(examType) {
    await connectDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await QuestionOfTheDay.findOne({
      examType,
      date: { $gte: today, $lt: tomorrow },
      isActive: true,
    }).populate("question");
  },

  async assignQuestion(questionId, examType, date, assignedBy) {
    await connectDB();

    const exists = await QuestionOfTheDay.existsForToday(examType);
    if (exists) {
      throw new Error("Question already assigned for today");
    }

    return await QuestionOfTheDay.create({
      question: questionId,
      examType,
      date: new Date(date),
      assignedBy,
    });
  },

  async getHistory(examType, startDate, endDate) {
    await connectDB();

    return await QuestionOfTheDay.find({
      examType,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("question")
      .sort({ date: -1 });
  },

  async autoAssignForTomorrow(examType, assignedBy) {
    await connectDB();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const exists = await QuestionOfTheDay.findOne({
      examType,
      date: tomorrow,
    });

    if (exists) {
      return { success: false, message: "Already assigned" };
    }

    const usedQuestionIds = await QuestionOfTheDay.find({
      examType,
    }).distinct("question");

    const randomQuestion = await Question.getRandomQuestion(
      examType,
      usedQuestionIds
    );

    if (!randomQuestion) {
      throw new Error("No questions available");
    }

    const qotd = await QuestionOfTheDay.create({
      question: randomQuestion._id,
      examType,
      date: tomorrow,
      assignedBy,
    });

    return { success: true, data: qotd };
  },
};
