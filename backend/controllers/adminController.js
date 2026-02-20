const User = require('../models/User');
const Interview = require('../models/Interview');

// @desc   Get all interview results
// @route  GET /api/admin/interviews
// @access Private (admin)
const getAllInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: interviews.length, interviews });
  } catch (err) {
    next(err);
  }
};

// @desc   Get dashboard stats (Simple)
// @route  GET /api/admin/stats
// @access Private (admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalInterviews = await Interview.countDocuments();
    
    // Simple average score
    const scoreAgg = await Interview.aggregate([
      { $match: { score: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } },
    ]);
    const avgScore = scoreAgg.length > 0 ? Math.round(scoreAgg[0].avgScore) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCandidates,
        totalInterviews,
        avgScore,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllInterviews, getDashboardStats };
