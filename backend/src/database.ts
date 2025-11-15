import { Schema, model } from "mongoose";

const userSchema = new Schema({
    username: String,
    goals: [{
        id: Number,
        description: String,
        amount: Number,
        due_date: Date,
        completed: Boolean
    }],
    categories: [{
        name: String,
        limit: Number
    }],
    spending: [{
        id: Number,
        item: String,
        amount: Number,
        transaction_date: Number,
        bank_id: Number,
        category: String  // NEW: category name (defaults to empty/null)
    }],
    banks: [{
        id: Number,
        name: String,
        added_date: Number
    }]
});

const User = model("User", userSchema);
export default User;