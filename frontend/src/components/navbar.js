import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css"

function Navbar(){
    return(
        <nav className="navbar">
            <div className="nav-logo"><Link to= "/">Brokenomics</Link></div>
            <ul className="nav-links">
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/spending">Spending</Link></li>
                <li><Link to="/planner">Planner</Link></li>
                <li><Link to="/report">Report</Link></li>
            </ul>
            <ul className="navbar-right">
            <li><Link to="/account">Account</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            </ul>
        </nav>
    );
}
export default Navbar;