import express, { Request, Response } from 'express';
const mongoose = require('mongoose');
require('dotenv').config();

import User from "./database";

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

app.get("/", async (req: Request, res: Response) => {
    res.send("Hello, world!");
});

app.post("/api/create/:username", (req: Request, res: Response) => {
    // change to accept auth things later
    

});

app.get("/api/user/:username", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ "username": username });

        if(!user)
            return res.status(404).send({ message: "User not found!" });

        res.send(user);
    }
    catch(error) {
        res.status(500).send({ message: "Error finding user data!" });
    }
});

// add new transaction
app.post("/api/user/spending/:username", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const { id, item, amount, transaction_date } = req.body;

        const ret = await User.updateOne({ "username": username }, { $push: {
            spending: {
                "id": id,
                "item": item,
                "amount": amount,
                "transaction_date": transaction_date
            }
        }});

        if(ret.modifiedCount === 0)
            return res.status(404).send({ message: "User not found!" });

        res.send({ message: "Transaction added successfully!"});
    } catch(error) {
        res.status(500).send({ message: "Error updating spending!" });
    }
});

// delete transaction
app.delete("/api/user/spending/:username", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const { id, item, amount, transaction_date } = req.body;

        const ret = await User.deleteOne({ "username": username }, { $pull: { "spending.$.id": id } });

        if(ret.deletedCount === 0)
            return res.status(404).send({ message: "User or transaction not found!" });

        res.send({ message: "Transaction deleted successfully!"});
    } catch(error) {
        res.status(500).send({ message: "Error updating spending!" });
    }
});

// add new category
app.post("/api/user/categories/:username", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const { name, limit } = req.body;

        const ret = await User.updateOne({ "username": username }, { $push: {
            categories: {
                "name": name,
                "limit": limit
            }
        }});

        if(ret.modifiedCount === 0)
            return res.status(404).send({ message: "User not found!" });

        res.send({ message: "Category added successfully!" });
    } catch(error) {
        res.status(500).send({ message: "Error updating categories!" });
    }
});

// edit category
app.patch("/api/user/categories/:username/:oldName", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const oldName = req.params.oldName;
        const { name, limit } = req.body;

        const ret = await User.updateOne({ "username": username, "categories.name": oldName }, { $set: {
            "categories.$.name": name,
            "categories.$.limit": limit
        }});

        if(ret.modifiedCount === 0)
            return res.status(404).send({ message: "User not found!" });

        res.send({ message: "Category updated successfully!" });
    } catch(error) {
        res.status(500).send({ message: "Error updating categories!" });
    }
});

// remove category
app.delete("/api/user/categories/:username/", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const { id } = req.body;

        const ret = await User.deleteOne({ "username": username}, { $pull: { "categories.$.id": id }});

        if(ret.deletedCount === 0)
            return res.status(404).send({ message: "User or category not found!" });

        res.send({ message: "Category updated successfully!" });
    } catch(error) {
        res.status(500).send({ message: "Error updating categories!" });
    }
});

// add new goal
app.post("/api/user/goals/:username", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const { id, description, amount, due_date } = req.body;

        const ret = await User.updateOne({ "username": username }, { $push: {
            goals: {
                "id": id,
                "description": description,
                "amount": amount,
                "due_date": due_date,
                "completed": false
            }
        }});

        if(ret.modifiedCount === 0)
            return res.status(404).send({ message: "User not found!" });

        res.send({ message: "Goal added successfully!" });
    } catch(error) {
        res.status(500).send({ message: "Error updating goals!" });
    }
});

// edit goal
app.patch("/api/user/goals/:username/:id", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const id = req.params.oldName;
        const { description, amount, due_date } = req.body;

        const ret = await User.updateOne({ "username": username, "goals.id": id }, { $set: {
            "goals.$.description": description,
            "goals.$.amount": amount,
            "goals.$.due_date": due_date
        }});

        if(ret.modifiedCount === 0)
            return res.status(404).send({ message: "User not found!" });

        res.send({ message: "Goal updated successfully!" });
    } catch(error) {
        res.status(500).send({ message: "Error updating goals!" });
    }
});

// Set goal completed successfully
app.patch("/api/user/goals/:username/", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const id = req.params.oldName;
        const { completed } = req.body;

        const ret = await User.updateOne({ "username": username, "goals.id": id }, { $set: {
            "goals.$.completed": completed
        }});

        if(ret.modifiedCount === 0)
            return res.status(404).send({ message: "User not found!" });

        res.send({ message: "Goal updated successfully!" });
    } catch(error) {
        res.status(500).send({ message: "Error updating goals!" });
    }
});

// remove goal
app.delete("/api/user/goals/:username", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const { id } = req.body;

        const ret = await User.updateOne({ "username": username }, { $pull: { "goals.$.id": id }});

        if(ret.modifiedCount === 0)
            return res.status(404).send({ message: "User not found!" });

        res.send({ message: "Goal updated successfully!" });
    } catch(error) {
        res.status(500).send({ message: "Error updating goals!" });
    }
});