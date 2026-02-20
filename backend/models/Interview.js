const mongoose = require('mongoose');
const JsonModel = require('../utils/jsonStorage');

const InterviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profileData: { type: Object, required: true },
    questions: [{ questionText: String, order: Number }],
    answers: [{ 
      questionIndex: Number, 
      answerText: String, 
      score: Number,
      strengths: [String],
      improvements: [String],
      summary: String
    }],
    score: { type: Number, default: 0 },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

const MongoInterview = mongoose.model('Interview', InterviewSchema);
const JsonInterview = new JsonModel('Interview');

module.exports = {
    find: (q) => mongoose.connection.readyState === 1 ? MongoInterview.find(q).populate('userId', 'name email') : JsonInterview.find(q),
    findOne: (q) => mongoose.connection.readyState === 1 ? MongoInterview.findOne(q) : JsonInterview.findOne(q),
    findById: (id) => mongoose.connection.readyState === 1 ? MongoInterview.findById(id) : JsonInterview.findById(id),
    create: (obj) => mongoose.connection.readyState === 1 ? MongoInterview.create(obj) : JsonInterview.create(obj),
    findByIdAndUpdate: (id, u, o) => mongoose.connection.readyState === 1 ? MongoInterview.findByIdAndUpdate(id, u, o) : JsonInterview.findByIdAndUpdate(id, u, o),
    countDocuments: (q) => mongoose.connection.readyState === 1 ? MongoInterview.countDocuments(q) : JsonInterview.countDocuments(q),
};

