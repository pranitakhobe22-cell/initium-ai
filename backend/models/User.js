const mongoose = require('mongoose');
const JsonModel = require('../utils/jsonStorage');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['candidate', 'admin'], default: 'candidate' },
    profile: {
      jobTitle: String,
      experience: Number,
      skills: [String],
      linkedIn: String
    }
  },
  { timestamps: true }
);

const MongoUser = mongoose.model('User', UserSchema);
const JsonUser = new JsonModel('User');

module.exports = {
    findOne: (q) => mongoose.connection.readyState === 1 ? MongoUser.findOne(q) : JsonUser.findOne(q),
    findById: (id) => mongoose.connection.readyState === 1 ? MongoUser.findById(id) : JsonUser.findById(id),
    create: (obj) => mongoose.connection.readyState === 1 ? MongoUser.create(obj) : JsonUser.create(obj),
    findByIdAndUpdate: (id, u, o) => mongoose.connection.readyState === 1 ? MongoUser.findByIdAndUpdate(id, u, o) : JsonUser.findByIdAndUpdate(id, u, o),
    find: (q) => mongoose.connection.readyState === 1 ? MongoUser.find(q) : JsonUser.find(q),
    countDocuments: (q) => mongoose.connection.readyState === 1 ? MongoUser.countDocuments(q) : JsonUser.countDocuments(q),
    schema: UserSchema // Keep for reference
};

