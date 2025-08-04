const Session = require("../models/Session");
const Question = require("../models/Question");

// @desc    Create a new session and linked question
// @route   POST /api/session/create
// @access  Private
const createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description, questions } =
      req.body;
    const userId = req.user._id;

    const session = await Session.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description,
    });

    const questionDocs = await Promise.all(
      questions.map(async (q) => {
        const question = await Question.create({
          session: session._id,
          question: q.question,
          answer: q.answer,
        });
        return question._id;
      })
    );
    session.questions = questionDocs;
    await session.save();
    return res.status(200).json({ success: true, session });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get a sessions by Id with populated questions
// @route   Get /api/session/:id
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate({
        path: "questions",
        options: { sort: { isPinned: -1, createdAt: 1 } },
      })
      .exec();

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    return res.status(200).json({ success: true, session });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all sessions for logged in user
// @route   Get /api/session/my-sessions
// @access  Private
const getMySession = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("questions");
    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete a session and its questions
// @route   Delete /api/session/:id
// @access  Private
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    // check if users owns session
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized to delete this session",
      });
    }

    // delete all questions
    await Question.deleteMany({ session: session._id });

    // delete session
    await session.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Session deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error });
  }
};

module.exports = { createSession, getMySession, getSessionById, deleteSession };
