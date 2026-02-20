const User = require('../models/User');

// @desc   Update candidate profile
// @route  PUT /api/profile
// @access Private (candidate)
const updateProfile = async (req, res, next) => {
  try {
    const { jobTitle, skills, experience, linkedIn } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profile: { jobTitle, skills, experience, linkedIn },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc   Get candidate profile
// @route  GET /api/profile
// @access Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateProfile, getProfile };
