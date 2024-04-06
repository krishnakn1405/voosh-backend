const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema= new Schema({
    photo: { type: String },
    name: { type: String,  required: true },
    bio: { type: String },
    email: { type: String,  required: true, unique: true },
    password: { type: String, required: true },
    visibility: { type: Number },
    admin: { type: Number },
    created_at: { type: Date, default: Date.now },
});

const User= mongoose.model('user', UserSchema);
User.createIndexes();
module.exports = User;