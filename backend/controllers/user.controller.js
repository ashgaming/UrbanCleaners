const userModel = require('../models/user.model');
const userService = require('../services/user.service')
const { validationResult } = require('express-validator')
const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.registerUser = async (req, res, next) => {

    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() })
    }

    const { firstname, email, password, lastname } = req.body;


    const isUserExist = await userModel.findOne({ email });

    if (isUserExist) {
        return res.status(400).json({ errors: "User Already exist" });
    }

    const hashedPassword = await userModel.hashedPassword(password);

    const user = await userService.createUser({
        firstname: firstname,
        lastname: lastname,
        email,
        password: hashedPassword
    });

    const token = user.generateAuthToken();

    res.status(201).json({ token })
}

module.exports.loginUser = async (req, res, next) => {

    try {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            return res.status(400).json({ errors: error.array() })
        }

        const { email, password } = req.body

        const hashedPassword = await userModel.hashedPassword(password);

        const user = await userModel.findOne({ email }).select('+password')

        if (!user) {
            return res.status(401).json({ message: 'Invalid email and password' })
        }

        const isMatch = await user.comparePassword(password);


        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email and password' })
        }

        const token = user.generateAuthToken();

        res.cookie('token', token);

        res.status(201).json({ token })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' })
    }
}


module.exports.getUserProfile = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(200).json( {token, user: req.user} );
}

module.exports.logoutUser = async (req, res) => {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    await blacklistTokenModel.create({ token });

    res.status(200).json({ message: 'Logout out' });
}