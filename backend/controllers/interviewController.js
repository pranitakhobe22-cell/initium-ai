const Interview = require('../models/Interview');
const { generateQuestions, evaluateAnswer, finalEvaluation } = require('../utils/aiHelper');

// @desc   Start a new interview
// @route  POST /api/interview/start
// @access Private
exports.startInterview = async (req, res, next) => {
  try {
    const { profileData } = req.body; // e.g., { jobRole: 'Frontend' }
    
    // Generate questions via AI
    const questionTexts = await generateQuestions(profileData, profileData.jobRole);
    const questions = questionTexts.map((text, i) => ({ questionText: text, order: i }));

    const interview = await Interview.create({
      userId: req.user._id,
      profileData,
      questions,
      answers: [],
    });

    res.status(201).json({
      success: true,
      interviewId: interview._id,
      questions: interview.questions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Submit an answer for a question
// @route  POST /api/interview/answer
// @access Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { interviewId, questionIndex, answerText } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Evaluate single answer
    const questionText = interview.questions[questionIndex].questionText;
    const evaluation = await evaluateAnswer(questionText, answerText, interview.profileData.jobRole);

    // Add to answers array
    interview.answers.push({
      questionIndex,
      answerText,
      score: evaluation.score,
    });

    await interview.save();

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   End interview and get final report
// @route  POST /api/interview/end
// @access Private
exports.endInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Generate final evaluation based on all answers
    const report = await finalEvaluation(interview.questions, interview.answers, interview.profileData.jobRole);

    // Update interview with results
    interview.score = report.score;
    interview.strengths = report.strengths;
    interview.improvements = report.improvements;
    interview.summary = report.summary;

    await interview.save();

    res.status(200).json({
      success: true,
      report,
    });
  } catch (err) {
    next(err);
  }
};
