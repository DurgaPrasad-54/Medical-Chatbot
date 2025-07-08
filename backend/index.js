const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const { User, History } = require('./Models/Model');
const sendMail = require('./Mail/Mail');
const verify = require('./Verification/verify');
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGOURL)
.then(()=>{
    console.log("Connected to MongoDB");  
})
.catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
});
const app = express();
app.use(express.json());
app.use(cors());

//Login End Point
app.post('/login', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random()*900000)
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    try{
        const user = await User.findOne({email: email});
        if(user){
          const loginUser = await User.findOneAndUpdate({email: email}, {otp: otp, otpExpires: otpExpires}, {new: true});
          if(loginUser){
            const token = jwt.sign({ userId: loginUser._id,email:loginUser.email }, process.env.TOKEN, { expiresIn: '15m' });
            sendMail(email, "Your OTP for MedChat login", `Your OTP is ${otp}. It is valid for 15 minutes.`);
            return res.status(200).json({ message: "OTP sent successfully", token: token });
          } else {
            return res.status(500).json({ message: "Error updating user" });
          }
        }
        else{
          newuser = User.create({email: email, otp: otp, otpExpires: otpExpires});
          if(newuser){
            const token = jwt.sign({ userId: newuser._id,email:newuser.email }, process.env.TOKEN, { expiresIn: '15m' });
            sendMail(email, "Your OTP for MedChat login", `Your OTP is ${otp}. It is valid for 15 minutes.`);
            return res.status(200).json({ message: "OTP sent successfully", token: token });
          }
        }
    }
    catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
    
})
//Verify OTP End Point
app.post('/verify',verify,  async (req, res) => {
    const otp = req.body
    const email= req.user.email;

    try{
        const Verifyotp = await User.findOne({email: email, otp: otp.otp});
        if(Verifyotp){
            const currentTime = new Date();
            if(Verifyotp.otpExpires > currentTime){
                const token = jwt.sign({ userId: Verifyotp._id, email: Verifyotp.email }, process.env.TOKEN, { expiresIn: '1h' });
                return res.status(200).json({ message: "OTP verified successfully", token: token });
            } else {
                return res.status(400).json({ message: "OTP expired" });
            }
        }
        else{
            return res.status(400).json({ message: "Invalid OTP" });
        }
        
    }
    catch (error) {
        console.error("Error in OTP verification:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//Chat End point

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});

