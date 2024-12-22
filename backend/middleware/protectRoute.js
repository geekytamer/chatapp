import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const protectRoute = async (req, res, next) => {
    try {
        console.log(req.cookies);
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "token is required" });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (!payload) {
            return res.status(401).json({ error: "unable to verify token" });
        }

        const user = await User.findById(payload.userId).select('-password');

        if (!user) {
            return res.status(401).json({ error: "user not found" });
        }

        req.user = user;
        next();  // Continue to the next middleware or route handler
 

    } catch (error) {
        console.error("Error getting token from cookies: ", error);
        return res.status(401).json({ error: "Unauthorized" });
     }
}
 
export default protectRoute;