const SignupModel = require('../models/login');

module.exports.signupUser = async (userData)=>{
    const { userName } = userData;
    const user = await SignupModel.findOne({ userName });
    if(user)throw 'User already existed';

    const newUser = new SignupModel(userData);
    const data = await newUser.save();
    const token = newUser.generateAuthToken();
    return { data };
}

module.exports.loginUser = async (userData)=>{
    const { userName } = userData;
    const user = await SignupModel.findOne({ userName });
    if(!user)throw 'User does not exist';
    if(user.password !== userData.password)throw 'Incorrect Password';
    
    const token = user.generateAuthToken();
    return { token };
}