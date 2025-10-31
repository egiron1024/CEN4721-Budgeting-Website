import express, { Request, Response } from 'express';
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

import User from "./database";

const app = express();

app.use(cors());
app.use(express.json());

const DB_URI = `mongodb://localhost:27017/${process.env.DB_NAME}`;
const PORT = process.env.PORT || 5000;

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err: any) => console.error('MongoDB connection error:', err));

// Root route
app.get("/", async (req: Request, res: Response) => {
    console.log("Root route hit!");
    res.send("Hello, world!");
});

// Temp route to create test user
app.get("/api/create-test-user", async (req: Request, res: Response) => {
    try {
        console.log("Creating test user...");
        const existingUser = await User.findOne({ username: "testuser" });
        
        if (existingUser) {
            console.log("User already exists!");
            return res.status(200).json({ message: "Test user already exists!", user: existingUser });
        }
        
        const user = new User({
            username: "testuser",
            goals: [],
            categories: [],
            spending: []
        });
        
        const savedUser = await user.save();
        console.log("User created:", savedUser);
        res.status(201).json({ message: "Test user created successfully!", user: savedUser });
    } catch(error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user!", error: error });
    }
});

// Create user endpoint
app.post("/api/create/:username", (req: Request, res: Response) => {
    // change to accept auth things later
});

// Get user
app.get("/api/user/:username", async (req: Request, res: Response) => {
    try {
        console.log("Getting user:", req.params.username);
        const username = req.params.username;
        const user = await User.findOne({ "username": username });

        if(!user) {
            console.log("User not found!");
            return res.status(404).json({ message: "User not found!" });
        }

        console.log("User found:", user);
        res.json(user);
    }
    catch(error) {
        console.error("Error finding user:", error);
        res.status(500).json({ message: "Error finding user data!" });
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
            return res.status(404).json({ message: "User not found!" });

        res.json({ message: "Transaction added successfully!"});
    } catch(error) {
        res.status(500).json({ message: "Error updating spending!" });
    }
});

// add new category
app.post("/api/user/categories/:username", async (req: Request, res: Response) => {
    try {
        console.log("Adding category for:", req.params.username, req.body);
        const username = req.params.username;
        const { name, limit } = req.body;

        const ret = await User.updateOne({ "username": username }, { $push: {
            categories: {
                "name": name,
                "limit": limit
            }
        }});

        if(ret.modifiedCount === 0)
            return res.status(404).json({ message: "User not found!" });

        res.json({ message: "Category added successfully!" });
    } catch(error) {
        console.error("Error adding category:", error);
        res.status(500).json({ message: "Error updating categories!" });
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
            return res.status(404).json({ message: "User not found!" });

        res.json({ message: "Category updated successfully!" });
    } catch(error) {
        res.status(500).json({ message: "Error updating categories!" });
    }
});

// add new goal
app.post("/api/user/goals/:username", async (req: Request, res: Response) => {
    try {
        console.log("Adding goal for:", req.params.username, req.body);
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
            return res.status(404).json({ message: "User not found!" });

        res.json({ message: "Goal added successfully!" });
    } catch(error) {
        console.error("Error adding goal:", error);
        res.status(500).json({ message: "Error updating goals!" });
    }
});

// edit goal
app.patch("/api/user/goals/:username/:id", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const id = req.params.id;
        const { description, amount, due_date, completed } = req.body;

        // Build the update object dynamically
        const updateFields: any = {};
        if (description !== undefined) updateFields["goals.$.description"] = description;
        if (amount !== undefined) updateFields["goals.$.amount"] = amount;
        if (due_date !== undefined) updateFields["goals.$.due_date"] = due_date;
        if (completed !== undefined) updateFields["goals.$.completed"] = completed;

        const ret = await User.updateOne(
            { "username": username, "goals.id": parseInt(id) }, 
            { $set: updateFields }
        );

        if(ret.modifiedCount === 0)
            return res.status(404).json({ message: "User or goal not found!" });

        res.json({ message: "Goal updated successfully!" });
    } catch(error) {
        console.error("Error updating goal:", error);
        res.status(500).json({ message: "Error updating goals!" });
    }
});

// delete goal
app.delete("/api/user/goals/:username/:id", async (req: Request, res: Response) => {
    try {
        console.log("Deleting goal for:", req.params.username, "goal id:", req.params.id);
        const username = req.params.username;
        const id = req.params.id;

        const ret = await User.updateOne(
            { "username": username },
            { $pull: { goals: { id: parseInt(id) } } }
        );

        if(ret.modifiedCount === 0)
            return res.status(404).json({ message: "User not found!" });

        res.json({ message: "Goal deleted successfully!" });
    } catch(error) {
        console.error("Error deleting goal:", error);
        res.status(500).json({ message: "Error deleting goal!" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
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

