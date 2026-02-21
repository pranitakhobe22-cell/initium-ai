const db = require('../config/sqlite');
const crypto = require('crypto');

class User {
  static findOne(query) {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(query.email);
    if (user) user._id = user.id;

    const chain = {
      select: () => chain,
      then: (cb) => Promise.resolve(user).then(cb)
    };
    Object.setPrototypeOf(chain, user || {});
    return chain;
  }

  static findById(id) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (user) user._id = user.id;

    const chain = {
      select: () => chain,
      then: (cb) => Promise.resolve(user).then(cb)
    };
    Object.setPrototypeOf(chain, user || {});
    return chain;
  }

  static create(data) {
    const id = crypto.randomBytes(12).toString('hex');
    const role = data.role || 'candidate';
    const stmt = db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, data.name, data.email, data.password, role);
    return { id, _id: id, ...data, role };
  }

  static findByIdAndUpdate(id, updates) {
    // Basic implementation for profile updates
    if (updates.profile) {
      db.prepare('UPDATE users SET profile_data = ? WHERE id = ?').run(JSON.stringify(updates.profile), id);
    }
    return this.findById(id);
  }

  static countDocuments(query) {
    const row = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get(query.role || 'candidate');
    return row.count;
  }
}

module.exports = User;
