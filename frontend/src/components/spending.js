import React, { useEffect, useState } from "react";
import "./spending.css"

// ---------------------------
// Spending component
// ---------------------------
function Spending(){
    // --- State & constants
    const ranges = ["Monthly", "Yearly", "Weekly"];
    const [rangeIndex, setRangeIndex] = useState(0);
    const [animate, setAnimate] = useState(false);
    const [banks, setBanks] = useState([]); // placeholder for linked banks
    const [mounted, setMounted] = useState(false); // for mount animation

    // --- Handlers
    function nextRange(){
        setRangeIndex((rangeIndex + 1) % ranges.length);
        // small pop animation for numbers
        setAnimate(true);
        setTimeout(() => setAnimate(false), 350);
    }

    function toggleBank(){
        // temporary behaviour: add a dummy bank if empty, otherwise remove last
        if(banks.length === 0){
            setBanks(["Demo Bank"]);
        } else {
            setBanks([]);
        }
    }

    // --- Effects
    // trigger mount animation once when the component appears
    useEffect(()=>{
        // small timeout to allow CSS to pick up initial state
        const t = setTimeout(()=> setMounted(true), 20);
        return ()=> clearTimeout(t);
    },[]);

    // --- Render
    return(
        <div className={`spending-container ${mounted ? 'is-mounted' : ''}`}>
            <div className="spending-left card accent-spending">
                <div className="card-header">
                    <h2>Spending</h2>
                    <button className="toggle-btn" onClick={nextRange} aria-label="Change range">{ranges[rangeIndex]}</button>
                </div>
                <div className="card-body">
                    <div className={`big-value ${animate ? 'pop' : ''}`}>$0.00</div>
                    <div className={`small-note ${animate ? 'pop' : ''}`}>Showing {ranges[rangeIndex].toLowerCase()} spending (sample data)</div>
                </div>
            </div>

            <div className="spending-right card accent-banks">
                <div className="card-header">
                    <h3>Banks</h3>
                </div>
                <div className="card-body">
                    {banks.length === 0 ? (
                        <div className="placeholder">No banks linked yet. Add a bank to get started.</div>
                    ) : (
                        <ul className="bank-list">
                            {banks.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                    )}
                </div>
                <div className="card-footer">
                    <button className="bank-btn" onClick={toggleBank}>{banks.length === 0 ? 'Add Bank' : 'Remove Bank'}</button>
                </div>
            </div>
        </div>
    );
}

export default Spending