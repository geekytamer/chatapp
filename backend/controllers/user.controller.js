import User from '../models/user.model.js';

export const getUsersForSideBar = async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        
        const users = await User.find({ _id: { $ne: loggedInUser } });

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error in get users for side bar function" });
    }
 }