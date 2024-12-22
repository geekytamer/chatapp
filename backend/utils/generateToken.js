import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId: userId}, process.env.JWT_SECRET, { expiresIn: "15d" });
  console.log(token)
    res.cookie("jwt", token, {
      maxAge: 1296000000, // 15 days
      httpOnly: true, // prevent client-side script from accessing the cookie
      sameSite: "strict", // prevent cross-site request forgery attacks
      secure: process.env.NODE_ENV === "production", // only set cookie over HTTPS in production environment
    });
}
 
export default generateTokenAndSetCookie;