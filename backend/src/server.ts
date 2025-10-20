import express, { Request, Response } from 'express';
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
// const DB_URI = process.env.ATLAS_URI // for prod if necessary
const DB_URI = `mongodb://localhost:27017/${process.env.DB_NAME}` // local dev

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

 mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB connected successfully'))
        .catch((err: any) => console.error('MongoDB connection error:', err));
const db = mongoose.connection.Db;

// Begin API Requests

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, world!");
});

app.post("/api/create", (req: Request, res: Response) => {
    // change to accept auth things later


});

app.get("/api/user", (req: Request, res: Response) => {
    const username = req.query.username;
    const user = db.users.find({ "username": username });
    res.send(user);
});

// app.get("/api/goals", (req: Request, res: Response) => {
//     const username = req.query.username;
//     const goals = db.users.find({ "username": username }, { "goals": 1, "_id": 0 });
//     res.send(goals);
// });

// app.get("/api/budget", (req: Request, res: Response) => {
//     const username = req.query.username;
//     const budget = db.users.find({ "username": username }, { "budget": 1, "_id": 0 });
//     res.send(budget);
// });

// app.get("/api/categories", (req: Request, res: Response) => {
//     const username = req.query.username;
//     const budget = db.users.find({ "username": username }, { "categories": ""})
// })