import Question from "../db/models/Question";
import Exam from "../db/models/Exam";
import connectDB from "../db/connection";

export const questionService = {
  async createQuestion(data) {
    await connectDB();

    const question = await Question.create(data);

    // Update exam question count
    const exam = await Exam.findById(data.examType);
    if (exam) {
      await exam.incrementQuestionCount();
    }

    return question;
  },

  async getQuestionById(questionId, includeAnswers = false) {
    await connectDB();

    const query = Question.findById(questionId);

    if (includeAnswers) {
      query.select("+englishCorrectAnswer +hindiCorrectAnswer +aICorrect");
    }

    return await query.populate("examType", "fullName");
  },

  async getQuestions(filters = {}, page = 1, limit = 20) {
    await connectDB();

    const skip = (page - 1) * limit;
    const query = { isActive: true, ...filters };

    const questions = await Question.find(query)
      .select("-englishCorrectAnswer -hindiCorrectAnswer -aICorrect")
      .populate("examType", "fullName")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(query);

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async updateQuestion(questionId, updateData) {
    await connectDB();

    return await Question.findByIdAndUpdate(questionId, updateData, {
      new: true,
      runValidators: true,
    });
  },

  async deleteQuestion(questionId) {
    await connectDB();

    const question = await Question.findByIdAndUpdate(
      questionId,
      { isActive: false },
      { new: true }
    );

    // Update exam question count
    if (question) {
      const exam = await Exam.findById(question.examType);
      if (exam) {
        await exam.decrementQuestionCount();
      }
    }

    return question;
  },

  async searchQuestions(searchQuery, examType, page = 1, limit = 20) {
    await connectDB();

    return await Question.search(searchQuery, examType, page, limit);
  },

  async getRandomQuestion(examType, excludeIds = []) {
    await connectDB();

    return await Question.getRandomQuestion(examType, excludeIds);
  },
};
