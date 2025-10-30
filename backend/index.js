const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const { User, History } = require('./Models/Model');
const sendMail = require('./Mail/Mail');
const verify = require('./Auth/Auth');
const { getChatResponse } = require('./Chat/chat');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGOURL)
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Error connecting to MongoDB:", err));


// Login Endpoint - Send OTP
app.post('/login', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    try {
        const user = await User.findOne({ email });

        if (user) {
            const updatedUser = await User.findOneAndUpdate(
                { email },
                { otp, otpExpires },
                { new: true }
            );

            if (updatedUser) {
                const token = jwt.sign(
                    { userId: updatedUser._id, email: updatedUser.email },
                    process.env.TOKEN,
                    { expiresIn: '15m' }
                );

                sendMail(email, "Your OTP for MedChat login", `Your OTP is ${otp}. It is valid for 15 minutes.`);
                console.log("OTP sent to existing user");
                return res.status(200).json({ message: "OTP sent successfully", token });
                
            }

            return res.status(500).json({ message: "Error updating user" });
        } else {
            const newUser = await User.create({ email, otp, otpExpires });

            const token = jwt.sign(
                { userId: newUser._id, email: newUser.email },
                process.env.TOKEN,
                { expiresIn: '15m' }
            );

            sendMail(email, "Your OTP for MedChat login", `Your OTP is ${otp}. It is valid for 15 minutes.`);
            console.log("OTP sent to new user");
            return res.status(200).json({ message: "OTP sent successfully", token });
        }
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Verify OTP Endpoint
app.post('/verify', verify, async (req, res) => {
    const { otp } = req.body;
    const email = req.user.email;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "error sending otp" });
        }
        if(user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const currentTime = new Date();

        if (user.otpExpires < currentTime) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // OTP is valid, clear it
        await User.updateOne({ email }, { $unset: { otp: "", otpExpires: "" } });

        const newToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.TOKEN,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ message: "OTP verified successfully", token: newToken });
    } catch (error) {
        console.error("Error in OTP verification:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Chat Endpoint
app.post('/chat', verify, async (req, res) => {
    const userId = req.user.userId;
    const { query } = req.body;

    try {
        const response = await getChatResponse(query);

        const chatHistory = await History.create({
            userId,
            query,
            response
        });

        return res.status(200).json({ message: "Chat response generated successfully", response });
    } catch (error) {
        console.error("Error in chat:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Get History Endpoint
app.get('/history', verify, async (req, res) => {
    const userId = req.user.userId;

    try {
        const history = await History.find({ userId }).sort({ createdAt: -1 });

        if (history.length === 0) {
            return res.status(404).json({ message: "No history found" });
        }

        return res.status(200).json({ message: "History retrieved successfully", history });
    } catch (error) {
        console.error("Error retrieving history:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Delete All History Endpoint
app.delete('/history', verify, async (req, res) => {
    const userId = req.user.userId;

    try {
        const deleted = await History.deleteMany({ userId });

        if (deleted.deletedCount === 0) {
            return res.status(404).json({ message: "History not found" });
        }

        return res.status(200).json({ message: "History deleted successfully" });
    } catch (error) {
        console.error("Error deleting history:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Delete Specific History by ID Endpoint
app.delete('/history/:id', verify, async (req, res) => {
    const userId = req.user.userId;
    const historyId = req.params.id;

    try {
        const deleted = await History.findOneAndDelete({ _id: historyId, userId });

        if (!deleted) {
            return res.status(404).json({ message: "History item not found" });
        }

        return res.status(200).json({ message: "History item deleted successfully" });
    } catch (error) {
        console.error("Error deleting history item:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Start Server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
