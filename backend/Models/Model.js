const { response } = require('express');
const mongoose = require('mongoose');

UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    otp:{
        type:Number
    },
    otpExpires: {
        type: Date
    }
},{timestamps: true})
historySchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    query:{
        type: String,
        required: true
    },
    response:{
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{timestamps: true})

const User = mongoose.model('users', UserSchema);
const History = mongoose.model('history', historySchema);

module.exports = {User,History};
