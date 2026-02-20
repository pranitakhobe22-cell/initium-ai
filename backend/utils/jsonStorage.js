const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JsonModel {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name.toLowerCase()}s.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  async _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  async _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    let data = await this._read();
    let filtered = data.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    // Mock chaining methods
    const chain = {
      populate: () => chain,
      sort: () => chain,
      exec: () => Promise.resolve(filtered),
      then: (cb) => Promise.resolve(filtered).then(cb)
    };
    return chain;
  }

  async findOne(query = {}) {
    const data = await this._read();
    const item = data.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
    
    if (item) {
      item.select = () => item;
    }
    return item;
  }

  async findById(id) {
    const data = await this._read();
    return data.find(item => item._id === id || item.id === id) || null;
  }

  async create(obj) {
    const data = await this._read();
    const newObj = {
      _id: crypto.randomBytes(12).toString('hex'),
      ...obj,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newObj);
    await this._write(data);
    return newObj;
  }

  async findByIdAndUpdate(id, updates) {
    const data = await this._read();
    const index = data.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    
    data[index] = { 
        ...data[index], 
        ...(updates.$set || updates), 
        updatedAt: new Date().toISOString() 
    };
    await this._write(data);
    return data[index];
  }

  async countDocuments(query = {}) {
    const chain = await this.find(query);
    const data = await chain.exec();
    return data.length;
  }

  // Simple mock for aggregate (specifically for average score)
  async aggregate(pipeline) {
    const data = await this._read();
    if (pipeline.length > 1 && pipeline[1].$group) {
        const scores = data.map(i => i.score).filter(s => s > 0);
        const avg = scores.length > 0 ? scores.reduce((a,b) => a+b, 0) / scores.length : 0;
        return [{ avgScore: avg }];
    }
    return [];
  }
}

module.exports = JsonModel;
