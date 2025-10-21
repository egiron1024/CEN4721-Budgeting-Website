import React from "react";
import "./dashboard.css"

function Dashboard(){
    return(
        <div className="dashboard">
            <h2 className="dashboard-title">Dashboard</h2>

            <div className="dashboard-grid">
                <section className="card card-goals">
                    <h3>My Goals</h3>
                    <p>Progress bars and goal items go here.</p>
                </section>

                <section className="card card-spending">
                    <h3>Spending history</h3>
                    <p>Recent transactions / chart placeholder.</p>
                </section>

                <section className="card card-budget">
                    <h3>Budget</h3>
                    <p>Monthly budget overview / remaining amount.</p>
                </section>

                <section className="card card-cats">
                    <h3>Top categories</h3>
                    <p>Categories breakdown (pie chart / list).</p>
                </section>
            </div>
        </div>
    );
}

export default Dashboard