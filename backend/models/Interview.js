const db = require('../config/sqlite');
const crypto = require('crypto');

class Interview {
  static create(data) {
    const id = crypto.randomBytes(12).toString('hex');
    const stmt = db.prepare(`
      INSERT INTO interviews (id, user_id, profile_data, questions, answers, score, strengths, improvements, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.userId,
      JSON.stringify(data.profileData),
      JSON.stringify(data.questions || []),
      JSON.stringify(data.answers || []),
      data.score || 0,
      JSON.stringify(data.strengths || []),
      JSON.stringify(data.improvements || []),
      data.summary || ''
    );
    return { id, _id: id, ...data };
  }

  static findById(id) {
    const interview = db.prepare('SELECT * FROM interviews WHERE id = ?').get(id);
    if (interview) {
      interview._id = interview.id;
      interview.profileData = JSON.parse(interview.profile_data);
      interview.questions = JSON.parse(interview.questions);
      interview.answers = JSON.parse(interview.answers);
      interview.strengths = JSON.parse(interview.strengths);
      interview.improvements = JSON.parse(interview.improvements);
    }
    return interview;
  }

  static find(query = {}) {
    const rows = db.prepare(`
      SELECT interviews.*, users.name as user_name, users.email as user_email 
      FROM interviews 
      JOIN users ON interviews.user_id = users.id 
      ORDER BY interviews.created_at DESC
    `).all();
    
    const data = rows.map(r => ({
      ...r,
      _id: r.id,
      userId: { name: r.user_name, email: r.user_email }, // Mock populate
      profileData: JSON.parse(r.profile_data),
      questions: JSON.parse(r.questions),
      answers: JSON.parse(r.answers),
      strengths: JSON.parse(r.strengths),
      improvements: JSON.parse(r.improvements)
    }));

    const chain = {
      populate: () => chain,
      sort: () => chain,
      then: (cb) => Promise.resolve(data).then(cb),
      exec: () => Promise.resolve(data)
    };
    return chain;
  }


  static findByIdAndUpdate(id, updates) {
    const current = this.findById(id);
    if (!current) return null;

    const data = { ...current, ...updates };
    const stmt = db.prepare(`
      UPDATE interviews SET answers = ?, score = ?, strengths = ?, improvements = ?, summary = ?
      WHERE id = ?
    `);
    stmt.run(
      JSON.stringify(data.answers),
      data.score,
      JSON.stringify(data.strengths),
      JSON.stringify(data.improvements),
      data.summary,
      id
    );
    return data;
  }

  static countDocuments() {
    return db.prepare('SELECT COUNT(*) as count FROM interviews').get().count;
  }

  static aggregate() {
    const row = db.prepare('SELECT AVG(score) as avgScore FROM interviews WHERE score > 0').get();
    return [{ avgScore: row.avgScore || 0 }];
  }
}

module.exports = Interview;
