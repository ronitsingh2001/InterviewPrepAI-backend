// @desc    Add aditional question to existing session
// @route   POST /api/question/add

const Question = require("../models/Question");
const Session = require("../models/Session");

// @access  Private
const addQuestionsToSession = async (req, res) => {
  try {
    const { sessionId, questions } = req.body;

    if (!sessionId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // create new questions
    const createdQuestions = await Question.insertMany(
      questions.map((q) => ({
        session: session._id,
        question: q.question,
        answer: q.answer,
      }))
    );

    //update session to include new question ids
    session.questions.push(...createdQuestions.map((q) => q._id));
    await session.save();
    return res.status(201).json(createdQuestions);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Pin or Unpin a question
// @route   POST /api/question/:id/pin
// @access  Private
const updateQuestionNote = async (req, res) => {
  try {
    const { note } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.note = note || "";
    await question.save();
    return res.status(200).json({ success: true, question });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update a note for question
// @route   POST /api/question/:id/note
// @access  Private
const togglePinQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.isPinned = !question.isPinned;
    await question.save();
    return res.status(200).json({ success: true, question });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addQuestionsToSession,
  updateQuestionNote,
  togglePinQuestion,
};
