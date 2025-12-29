const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CLOUD CONFIG: Use your MongoDB Atlas string here or via Environment Variables
const mongoURI = process.env.MONGO_URI || 'mongodb://db:27017/attendance';

mongoose.connect(mongoURI)
    .then(() => console.log("Cloud Database Connected"))
    .catch(err => console.error("Database Connection Error:", err));

// Schemas
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
}));

const Attendance = mongoose.model('Attendance', new mongoose.Schema({
    studentName: String,
    status: { type: String, enum: ['Present', 'Absent'] },
    date: { type: Date, default: Date.now }
}));

// Auth
app.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send({ success: true });
    } catch (e) { res.status(400).send({ error: "User exists" }); }
});

app.post('/login', async (req, res) => {
    const user = await User.findOne(req.body);
    if (user) res.send({ success: true });
    else res.status(401).send({ error: "Invalid login" });
});

// Attendance logic
app.get('/records', async (req, res) => {
    const records = await Attendance.find().sort({ date: -1 });
    res.json(records);
});

app.post('/mark', async (req, res) => {
    const record = new Attendance(req.body);
    await record.save();
    res.send({ message: "Success" });
});

app.delete('/record/:id', async (req, res) => {
    await Attendance.findByIdAndDelete(req.params.id);
    res.send({ message: "Deleted" });
});

// CLOUD CONFIG: Listen on port 10000 for Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on port ${PORT}`));
