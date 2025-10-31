import React, { useState, useEffect } from "react";
import "./dashboard.css"
import { Link } from "react-router-dom";
import{ getUser } from '../services/api';

function Dashboard(){
    const [categories, setCategories] = useState([]);
    const [goals, setGoals] = useState([]);
    const [spending, setSpending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const userData = await getUser();
                
                // Get only the first 5
                const limitedCategories = userData.categories.slice(0, 5);
                
                const limitedGoals = userData.goals.slice(0, 5);
                
                const limitedSpending = userData.spending.slice(0, 5);

                setCategories(limitedCategories);
                setGoals(limitedGoals);
                setSpending(limitedSpending);
            } catch (err) {
                console.error("Error fetching data:", err);
                alert('Failed to load dashboard data. Make sure the backend is running!');
            } finally {
                setLoading(false);
            }

        }

    fetchData();
  }, []);
  
  if (loading) {
    return <div className="dashboard"><p>Loading...</p></div>;
}

    return(
        <div className="dashboard">
            <h1 className="dashboard-welcome">Dashboard</h1>

            <div className="dashboard-layout">
                <article className="card card-tall card-goals">
                    <h2>Goals</h2>
                    <div className="card-body">
                        {goals.length > 0 ? (
                            <ul>
                                {goals.map((goal) => (
                                    <li key={goal.id || goal._id}>
                                        <strong>{goal.description}</strong> — ${goal.amount.toFixed(2)}
                                        {goal.due_date && (
                                            <span className="deadline"> (Due: {new Date(goal.due_date).toLocaleDateString()})</span>
                                        )}
                                        {goal.completed && <span className="completed-badge"> ✓</span>}
                                    </li>
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
                        {spending.length > 0 ? (
                            <ul>
                                {spending.map((item) => (
                                    <li key={item.id || item._id}>
                                        {item.item}: ${item.amount.toFixed(2)}
                                        {item.transaction_date && (
                                            <span> — {new Date(item.transaction_date).toLocaleDateString()}</span>
                                        )}
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
                            {categories.length > 0 ? (
                                <ul>
                                    {categories.map((cat) => (
                                        <li key={cat._id || cat.name}>
                                            {cat.name} — ${cat.limit.toFixed(2)}/month
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