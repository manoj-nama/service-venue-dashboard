const { signupUser,loginUser } = require('../services/signup-service');

module.exports.signupUser = async (req,res) => {
    const { userName,password } = req.body;
    if(!userName||!password)return res.send(400, { message: 'Required data is missing.' });

    try{
        const result = await signupUser(req.body);
        return res.send(201, { message: 'Successful', data: result.data });
    }
    catch(error){
        console.log(' Error : ', error);
        return res.send(400, error);
    }
}

module.exports.loginUser = async (req,res) => {
    const { userName,password } = req.body;
    if(!userName||!password)return res.send(400, { message: 'Required data is missing.' });

    try{
        const result = await loginUser(req.body);
        res.header('x-auth-token',result.token);
        return res.send(200, { message: 'Login Successful', token: result.token });
    }
    catch(error){
        console.log(' Error : ', error);
        return res.send(400, error);
    }

}