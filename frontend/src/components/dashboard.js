import React, { useState, useEffect } from "react";
import "./dashboard.css"
import { Link } from "react-router-dom";

function Dashboard(){
    const [categories, setCategories] = useState([]);
    const [goals, setGoals] = useState([]);
    const [spending, setSpending] = useState([]);

    useEffect(() => {
        async function fetchData() {
        try {
            const [catRes, goalRes, spendRes] = await Promise.all([
            fetch("http://localhost:4000/api/categories"),
            fetch("http://localhost:4000/api/goals"),
            fetch("http://localhost:4000/api/spending")
            ]);
            const catData = await catRes.json();
            const goalData = await goalRes.json();
            const spendData = await spendRes.json();

            setCategories(catData);
            setGoals(goalData);
            setSpending(spendData);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
        }

    fetchData();
  }, []); 

    return(
        <div className="dashboard">
            <h1 className="dashboard-welcome">Dashboard</h1>

            <div className="dashboard-layout">
                <article className="card card-tall card-goals">
                    <h2>Goals</h2>
                    <div className="card-body">
                        {/* <p className="placeholder">List of Goals</p>*/}
                        {goals.length > 0 ? (
                            <ul>
                                {goals.map((goal) => (
                                    <li key={goal._id}>{goal.text}</li>
                                ))}
                            </ul>
                            ) : (
                            <p className="placeholder">No goals yet</p>
                         )}
                    </div>
                    <div className="card-footer">
                        <Link to="/planner" className="link-button">View Planner</Link>
                    </div>
                </article>

                <article className="card card-tall card-spending">
                     <h2>Spending</h2>
                    <div className="card-body">
                        {/*<p className="placeholder">Spending History</p>*/}
                        {spending.length > 0 ? (
                            <ul>
                                {spending.map((item) => (
                                <li key={item._id}>
                                    {item.category}: ${item.amount} — {item.date}
                                </li>
                                ))}
                            </ul>
                            ) : (
                            <p className="placeholder">No spending history yet</p>
                            )}
                    </div>
                    <div className="card-footer">
                        <Link to="/spending" className="link-button">View Spending</Link>
                    </div>
                </article>

                <div className="right-column">
                    <article className="card card-large card-categories">
                        <h2>Categories</h2>
                        <div className="card-body">
                            {/* <p className="placeholder">Sections of categories user makes and limit for each</p>*/}
                            {categories.length > 0 ? (
                                <ul>
                                {categories.map((cat) => (
                                    <li key={cat._id}>
                                    {cat.name} — ${cat.limit ?? 0}
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className="placeholder">No categories yet</p>
                            )}
                        </div>
                        <div className="card-footer">
                            <Link to="/planner" className="link-button">View Planner</Link>
                        </div>
                    </article>

                    <article className="card card-small card-promote">
                        <div className="card-body center">
                            <h3>Click "View Report" to get a visual on your spending!</h3>
                        </div>
                        <div className="card-footer">
                            <Link to="/report" className="link-button">View Report</Link>
                        </div>
                    </article>
                </div>
            </div>
        </div>


    );
}

export default Dashboard