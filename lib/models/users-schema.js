'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const schema = mongoose.Schema({
  username: { type: 'String', required: true, unique: true },
  password: { type: 'String', required: true },
  email: { type: 'String' },
  role: {type: 'String', required: true, default: 'user', enum: ['admin', 'editor', 'user']},
});

//pre-middleware
schema.pre('save', async function() {
  console.log(this);
  this.password =await bcrypt.hash(this.password, saltRounds);
});
schema.methods.generateToken = function () {
  let timeout = Date.now() + 50000;

  return jwt.sign(
    { exp: timeout, data: { _id: this._id } },
    process.env.SECRET,
  );
};

schema.methods.comparePasswords = async function (plainTextPass) {
  return await bcrypt.compare(plainTextPass, this.password);
};

schema.statics.verifyToken = function (token) {
  let tokenContents = jwt.verify(token, process.env.SECRET);
  return tokenContents.data;
};

module.exports = mongoose.model('users', schema);