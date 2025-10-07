import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import generateTokenAndSetCookie from '../utils/generateToken.js';
export const signup = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }
        
        const user = await User.findOne({ username });

        if (user) {
            return res.status(400).json({ error: "Username already taken" });
        }

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const salt = await bcrypt.genSalt(10);        
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            fullname: fullName,
            password: hashedPassword,
            profilePic: gender === "male"? boyProfilePic : girlProfilePic,
        });

        

        await newUser.save();
        if (newUser) {
            generateTokenAndSetCookie(newUser.id, res);
            res.status(201).json({ 
            _id: newUser._id,
            username: newUser.username,
            profilePic: newUser.profilePic,
            fullName: newUser.fullname,
            });
        } else {
            res.status(400).json({ error: "Failed to create user" });
        }
        

    } catch (error) {
        console.error("error in signup route: ", error);
        res.status(500).json({ error: "Server Error" });
     }
}
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("login request", username, password);
        const user = await User.findOne({ username });

        const isMatch = await bcrypt.compare(password, user.password || "");

        if (!user || !isMatch) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        generateTokenAndSetCookie(user.id, res);
        res.status(200).json({
            _id: user._id,
            username: user.username,
            profilePic: user.profilePic,
            fullName: user.fullname,
        });
    } catch (error) {
        console.error("error in login route: ", error);
        res.status(500).json({ error: "Server Error" });
     }
}
 
export const logoutUser = (req, res) => { 
    try {
        res.clearCookie("jwt");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("error in logout route: ", error);
        res.status(500).json({ error: "Server Error" });
     }

}
