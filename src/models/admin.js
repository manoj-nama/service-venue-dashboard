const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
        unique: true
    },
    password: {
        type:String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    isAdmin: {
        type:Boolean,
        default:false
    }
})

adminSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({ _id:this._id,isAdmin:this.isAdmin },'jwtPrivateKey');
    return token;
}

module.exports = mongoose.model('admin',adminSchema);

