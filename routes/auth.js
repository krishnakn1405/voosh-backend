const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Posts = require('../models/Posts');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "Krishanisagoodboy";

// Register: Create a user using: POST "/api/auth/createuser", Does not require auth
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be minimum of 5 characters').isLength({ min: 5 }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        // Check wheather the user with this email exists already 
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry a user with this email already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
            visibility: 0,
            admin: 0,
        })

        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ authtoken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }

});

// Login: Authenticate a user using: POST "/api/auth/login", Does not require auth
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

// Logout - For logout we need to implement below code at frontend. Below function should be called whenever the Logout button is pressed
/*

function logout(){
    localStorage.removeItem('auth-user'); // Remove auth-user token from localstorage
}

*/

// User Profile: Get logged in user details: POST "/api/auth/getuser. Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {

        let userId= req.user.id;
        const user1 = await User.findById(req.user.id).select("admin");

        let user;
        if(user1.admin == 1){
            user = await User.find().select("-password"); // Fetch all users for admin
        }else{
            user = await User.find({visibility: 1}).select("-password"); // Fetch public users for user
        }

        res.send(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

// User Profile Edit: Update an existing user using: PUT "/api/auth/updateuser. Login required
router.put('/updateuser', fetchuser, async (req, res) => {

    try {
        const { photo, name, bio, email, password, visibility } = req.body;

        // Create a new user object
        const newUser = {};
        if (photo) { newUser.photo = photo }
        if (bio) { newUser.bio = bio }
        if (email) { newUser.email = email }
        if (visibility) { newUser.name = visibility }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            secPass = await bcrypt.hash(password, salt);
            newUser.password = secPass;
        }

        // Find the user to be updated and update it
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send("Not found");
        }

        if (user._id.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        user = await User.findByIdAndUpdate(req.user.id, { $set: newUser }, { new: true });

        res.json({ user });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// Upload Image: Create a user using: POST "/api/auth/createpost",  Login required
router.post('/createpost', fetchuser, [
    body('post_img', 'Enter a valid image url').isLength({ min: 3 }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        // Create a new post
        posts = await Posts.create({
            post_img: req.body.post_img
        })

        res.json("Uploaded");

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }

});


// User Profile Public or Private: Update an existing user using: PUT "/api/auth/updateprofile. Login required
router.put('/updateprofile', fetchuser, async (req, res) => {

    try {
        const { visibility } = req.body;

        // Create a new user object
        const newUser = {};
        if (visibility) { newUser.name = visibility }

        // Find the user to be updated and update it
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send("Not found");
        }

        if (user._id.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        user = await User.findByIdAndUpdate(req.user.id, { $set: newUser }, { new: true });

        res.json({ user });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;