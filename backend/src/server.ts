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

// delete transaction
app.delete("/api/user/spending/:username", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const { id, item, amount, transaction_date } = req.body;
        // Remove the spending item with matching id from the user's spending array
        // Use $pull to remove the array element. id is stored as a Number in the schema.
        const parsedId = typeof id === 'string' ? Number(id) : id;
        const ret = await User.updateOne({ username }, { $pull: { spending: { id: parsedId } } });

        // Mongoose updateOne returns an object with modifiedCount
        if (!ret || ret.modifiedCount === 0) {
            return res.status(404).send({ message: "User or transaction not found!" });
        }

        res.send({ message: "Transaction deleted successfully!" });
    } catch(error) {
        res.status(500).send({ message: "Error updating spending!" });
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

// delete category
app.delete("/api/user/categories/:username/:oldName", async (req: Request, res: Response) => {
    try {
        console.log("Deleting category for:", req.params.username, "category oldName:", req.params.oldName);
        const username = req.params.username;
        const oldName = req.params.oldName;

        const ret = await User.updateOne(
            { "username": username },
            { $pull: { categories: { name: oldName } } }
        );

        if(ret.modifiedCount === 0)
            return res.status(404).json({ message: "User not found!" });

        res.json({ message: "Goal deleted successfully!" });
    } catch(error) {
        console.error("Error deleting goal:", error);
        res.status(500).json({ message: "Error deleting goal!" });
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

// add bank info
app.post("/api/user/banks/:username", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const { id, name } = req.body;
        const added_date = Date.now();

        // Add the bank
        await User.updateOne({ "username": username }, { $push: {
            banks: {
                "id": id,
                "name": name,
                "added_date": added_date
            }
        }});

        // Generate dummy spending data for the past 30 days
        const dummySpending = generateDummySpending(id);
        
        // Add all dummy transactions
        await User.updateOne({ "username": username }, { $push: {
            spending: { $each: dummySpending }
        }});

        res.json({ 
            message: "Bank added successfully!",
            bank: { id, name, added_date },
            transactionsAdded: dummySpending.length
        });
    } catch(error) {
        console.error("Error adding bank:", error);
        res.status(500).json({ message: "Error adding bank!" });
    }
});

// Delete bank and all associated transactions
app.delete("/api/user/banks/:username/:id", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const bankId = parseInt(req.params.id);

        // Remove the bank
        const bankResult = await User.updateOne(
            { "username": username },
            { $pull: { banks: { id: bankId } } }
        );

        if(bankResult.modifiedCount === 0)
            return res.status(404).json({ message: "User or bank not found!" });

        // Remove all spending transactions associated with this bank
        const spendingResult = await User.updateOne(
            { "username": username },
            { $pull: { spending: { bank_id: bankId } } }
        );

        res.json({ 
            message: "Bank and associated transactions removed successfully!",
            transactionsRemoved: spendingResult.modifiedCount
        });
    } catch(error) {
        console.error("Error removing bank:", error);
        res.status(500).json({ message: "Error removing bank!" });
    }
});

// Helper function to generate dummy spending data with specific item names
function generateDummySpending(bankId: number) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const categories = [
        { 
            category: "Groceries", 
            items: ["Whole Foods", "Trader Joe's", "Walmart", "Target", "Kroger", "Safeway"],
            minAmount: 20, 
            maxAmount: 150 
        },
        { 
            category: "Coffee", 
            items: ["Starbucks", "Dunkin'", "Local Café", "Peet's Coffee", "Dutch Bros"],
            minAmount: 3, 
            maxAmount: 8 
        },
        { 
            category: "Gas", 
            items: ["Shell", "Chevron", "BP", "Exxon", "Mobil", "Arco"],
            minAmount: 30, 
            maxAmount: 60 
        },
        { 
            category: "Restaurant", 
            items: ["Chipotle", "McDonald's", "Subway", "Panera", "Olive Garden", "Chick-fil-A", "Taco Bell"],
            minAmount: 15, 
            maxAmount: 80 
        },
        { 
            category: "Shopping", 
            items: ["Amazon", "Mall", "Best Buy", "Target", "Macy's", "Nike Store", "H&M"],
            minAmount: 25, 
            maxAmount: 200 
        },
        { 
            category: "Entertainment", 
            items: ["Netflix", "Spotify", "Movie Theater", "Concert", "Game Store", "Bowling"],
            minAmount: 10, 
            maxAmount: 50 
        },
        { 
            category: "Utilities", 
            items: ["Electric Bill", "Water Bill", "Internet", "Phone Bill", "Gas Bill"],
            minAmount: 50, 
            maxAmount: 150 
        },
        { 
            category: "Transportation", 
            items: ["Uber", "Lyft", "Bus Fare", "Parking", "Toll", "Car Wash"],
            minAmount: 5, 
            maxAmount: 30 
        },
    ];

    const transactions = [];
    
    // Generate 2-4 transactions per day for the past 30 days
    for (let day = 0; day < 30; day++) {
        const numTransactions = Math.floor(Math.random() * 3) + 2; // 2-4 transactions
        
        for (let i = 0; i < numTransactions; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const itemName = category.items[Math.floor(Math.random() * category.items.length)];
            const amount = Math.round((Math.random() * (category.maxAmount - category.minAmount) + category.minAmount) * 100) / 100;
            const transactionDate = now - (day * oneDay) - (Math.random() * oneDay);
            
            transactions.push({
                id: Date.now() + Math.floor(Math.random() * 1000000),
                item: itemName,
                amount: amount,
                transaction_date: Math.floor(transactionDate),
                bank_id: bankId  // Track which bank this transaction came from
            });
        }
    }
    
    return transactions;
}

// Update spending category
app.patch("/api/user/spending/:username/:id", async (req: Request, res: Response) => {
    try {
        const username = req.params.username;
        const id = parseInt(req.params.id);
        const { category } = req.body;

        const ret = await User.updateOne(
            { "username": username, "spending.id": id },
            { $set: { "spending.$.category": category } }
        );

        if(ret.modifiedCount === 0)
            return res.status(404).json({ message: "User or spending not found!" });

        res.json({ message: "Spending category updated successfully!" });
    } catch(error) {
        console.error("Error updating spending category:", error);
        res.status(500).json({ message: "Error updating spending category!" });
    }
});