const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profileData: {
      type: Object, // Stores flexible profile info (jobRole, etc.)
      required: true,
    },
    questions: [
      {
        questionText: String,
        order: Number,
      }
    ],
    answers: [
      {
        questionIndex: Number,
        answerText: String,
        score: Number,
      }
    ],
    score: {
      type: Number,
      default: 0,
    },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    summary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', InterviewSchema);
