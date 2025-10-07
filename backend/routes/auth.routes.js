import express from 'express';
import { signup, loginUser, logoutUser } from '../controllers/auth.controller.js';
const router = express.Router();

router.post("/login", loginUser)

router.post("/logout", logoutUser)
 
router.post("/signup", signup)
 
export default router;