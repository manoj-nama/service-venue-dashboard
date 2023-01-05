const adminModel = require('../models/admin');

module.exports.signupUser = async (userData) => {
    const { userName } = userData;
    const user = await adminModel.findOne({ userName });
    if (user) throw 'User already existed';
    const newUser = new adminModel(userData);
    const data = await newUser.save();
    return { data };
}

module.exports.loginUser = async (userData) => {
    const { userName } = userData;
    const user = await adminModel.findOne({ userName });
    if (!user) throw 'User does not exist';
    if (user.password !== userData.password) throw 'Incorrect Password';
    const token = user.generateAuthToken();
    return { token };
}