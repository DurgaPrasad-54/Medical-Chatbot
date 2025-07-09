const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const { User, History } = require('./Models/Model');
const sendMail = require('./Mail/Mail');
const verify = require('./Verification/verify');
const  {getChatResponse}  = require('./Chat/chat');
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
app.post('/chat',verify, async(req,res)=>{
    const userId = req.user.userId;
    const { query} = req.body
    try{
        const response = await getChatResponse(query);
        if(response){
            const chatHistory = await History.create({userId: userId, query:query, response: response});
            if(chatHistory){
                return res.status(200).json({ message: "Chat response generated successfully", response: response });
            } else {
                return res.status(500).json({ message: "Error saving chat history" });
            }   
        }
    }
    catch (error) {
        console.error("Error in chat:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})
//History End Point
app.get('/history', verify, async (req, res) => {
    const userId = req.user.userId;
    try {
        const history = await History.find({ userId: userId }).sort({ createdAt: -1 });
        if (history) {
            return res.status(200).json({ message: "History retrieved successfully", history: history });
        } else {
            return res.status(404).json({ message: "No history found" });
        }
    } catch (error) {
        console.error("Error retrieving history:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}); 
//Delete History End Point
app.delete('/history', verify, async (req, res) => {
    const userId = req.user.userId;
    try {
        const deletedHistory = await History.deleteMany({userId: userId });
        if (deletedHistory) {
            return res.status(200).json({ message: "History deleted successfully" });
        } else {
            return res.status(404).json({ message: "History not found" });
        }
    } catch (error) {
        console.error("Error deleting history:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

//Delete Specific History End Point
app.delete('/history/:id', verify, async (req, res) => {
    const userId = req.user.userId;
    const historyId = req.params.id;
    try {
        const deletedHistory = await History.findOneAndDelete({ _id: historyId, userId: userId });
        if (deletedHistory) {
            return res.status(200).json({ message: "History item deleted successfully" });
        } else {
            return res.status(404).json({ message: "History item not found" });
        }
    } catch (error) {
        console.error("Error deleting history item:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});

