const mongoose = require("mongoose");
const { Schema } = mongoose;

var PostsSchema= mongoose.model('PostsSchema', {
    post_img: { type: String },
    created_at: { type: Date, default: Date.now }, 
});

module.exports= { PostsSchema };