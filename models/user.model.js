const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: String,
    email:{
        type: String,
        unique: true
    },
    provider: String,
    photo: String
})

const User  = mongoose.model('User',userSchema);
module.exports = User;