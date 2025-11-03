# CEN4721-Budgeting-Website

This is our team's budgeting website, designed to help users manage their spending, set financial goals, and track progress.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Folder Structure](#folder-structure)
- [License](#license)

---

## Features
- **Dashboard**: Overview of goals, spending, and categories.
- **Planner**: Manage spending categories and financial goals.
- **Spending**: Add and track spending transactions.
- **Reports**: Visualize spending trends over time.

---

## Prerequisites
Before setting up the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) (for the backend database)

---

## Setup Instructions

### 1. Clone the Repository
`bash'
git clone https://github.com/your-repo-url/CEN4721-Budgeting-Website.git
cd CEN4721-Budgeting-Website'

### 2. Install Dependencies
'cd ../backend'
'npm install'

'cd ../frontend.
'npm install'

### 3. Configure the Backend
1. Install MongoDB locally on your machine.
2. Use the MongoDB shell or GUI to create a database for this project.
3. Copy the contents of 'env_template.txt' into a new '.env file' in the backend folder:
4. Replace YOUR DATABASE NAME in the '.env' file with the name of your MongoDB database.

### Running the Applicaiton
1. Start the backend from the backend folder, run:
    'npm run dev'
2. Start the Frontend from fronend folder, run:
    'npm start'