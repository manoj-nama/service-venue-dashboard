const jwt = require('jsonwebtoken');
const SignupModel = require('../models/admin');

module.exports.auth = async (req, res, next) => {
    const token = req.header('x-auth-token'); 
    if (!token) return res.send(401, { message: 'Access denied.No token provided' });

    try {
        const decoded = await jwt.verify(token, 'jwtPrivateKey');
        if (!decoded) throw {status:401,message:'Error'};

        const user = await SignupModel.findOne({ _id: decoded._id });
        if (!user) throw {message:'Invalid Token'};
        if (!user.isAdmin) throw {message:'You are not admin'};
        next();
    }
    catch (error) {
        res.send(400, { message: error.message });
    }
}
    