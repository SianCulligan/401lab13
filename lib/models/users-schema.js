'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const schema = mongoose.Schema({
  username: { type: 'String', unique: true, required: true },
  password: { type: 'String', required: true },
  fname: { type: 'String' },
  lname: { type: 'String' },
});

//pre-middleware
schema.pre('save', async function() {
  console.log(this);
  this.password =await bcrypt.hash(this.password, saltRounds);
});
schema.methods.generateToken = function () {
  let timeout = Date.now() + 5000000;

  //return jwt.sign({ _id: this._id }, process.env.SECRET);

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