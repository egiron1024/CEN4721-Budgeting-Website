const express = require('express');
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