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
    const [spendings, setSpendings] = useState([]); // local placeholder spendings
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ amount: '', name: '', date: '' });
    const [errors, setErrors] = useState({ name: '', amount: '', date: '' });

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

    // --- Spending form handlers
    function toggleAddForm(){
        setShowAdd(!showAdd);
    }

    function handleFormChange(e){
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // validate on change
        validateField(name, value);
    }

    function validateField(name, value){
        let msg = '';
        if (name === 'name'){
            if (!value || value.trim().length === 0) msg = 'Name is required';
        }
        if (name === 'amount'){
            const n = parseFloat(value);
            if (value === '') msg = 'Amount is required';
            else if (Number.isNaN(n) || n <= 0) msg = 'Enter a positive number';
        }
        if (name === 'date'){
            if (value){
                const D = new Date(value);
                if (Number.isNaN(D.getTime())) msg = 'Invalid date';
            }
        }
        setErrors(prev => ({ ...prev, [name]: msg }));
        return msg === '';
    }

    function addSpending(e){
        e.preventDefault();
        // validate all fields before submitting
        const validName = validateField('name', form.name);
        const validAmount = validateField('amount', form.amount);
        const validDate = validateField('date', form.date);
        if (!validName || !validAmount || !validDate) return;

        const amt = parseFloat(form.amount) || 0;
        const item = { id: Date.now(), amount: amt, name: form.name.trim() || 'Unnamed', date: form.date || new Date().toISOString().slice(0,10) };
        setSpendings(prev => [item, ...prev]);
        // reset form
        setForm({ amount: '', name: '', date: '' });
        setErrors({ name: '', amount: '', date: '' });
        setShowAdd(false);
    }

    function deleteSpending(id){
        setSpendings(prev => prev.filter(s => s.id !== id));
    }

    function calcTotal(){
        // compute total based on currently selected range
        const range = ranges[rangeIndex] ? ranges[rangeIndex].toLowerCase() : 'monthly';
        const today = new Date();

        function toDateOnly(d){
            const D = new Date(d);
            if (Number.isNaN(D.getTime())) return null;
            return new Date(D.getFullYear(), D.getMonth(), D.getDate());
        }

        // build inclusive start/end datetimes for the chosen range
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        let start;
        let end;

        if (range === 'weekly'){
            // last 7 calendar days (including today)
            start = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), startOfToday.getDate() - 6, 0,0,0,0);
            end = endOfToday;
        } else if (range === 'monthly'){
            // from the 1st of this month to the end of this month
            start = new Date(today.getFullYear(), today.getMonth(), 1, 0,0,0,0);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23,59,59,999); // last day of month
        } else if (range === 'yearly'){
            start = new Date(today.getFullYear(), 0, 1, 0,0,0,0);
            end = new Date(today.getFullYear(), 11, 31, 23,59,59,999);
        } else {
            // include everything
            start = new Date(0);
            end = endOfToday;
        }

        return spendings.reduce((sum, it) => {
            let D;
            // If date looks like YYYY-MM-DD, parse as local date to avoid timezone offset issues
            if (typeof it.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(it.date)){
                const [y, m, d] = it.date.split('-').map(Number);
                D = new Date(y, m - 1, d, 12, 0, 0, 0); // noon to be safe across timezones
            } else {
                D = new Date(it.date);
            }
            if (Number.isNaN(D.getTime())) return sum;
            if (D >= start && D <= end) return sum + Number(it.amount || 0);
            return sum;
        }, 0);
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
                    <div className={`big-value ${animate ? 'pop' : ''}`}>${calcTotal().toFixed(2)}</div>
                    <div className={`small-note ${animate ? 'pop' : ''}`}>Showing {ranges[rangeIndex].toLowerCase()} spending</div>

                    <div className="add-item">
                        <button className="bank-btn" onClick={toggleAddForm}>{showAdd ? 'Cancel' : 'Add Item'}</button>
                    </div>

                    {showAdd && (
                        <form className="add-form" onSubmit={addSpending} noValidate>
                            <label className={errors.name ? 'has-error' : ''}>
                                Item
                                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Coffee, Groceries, ..." />
                                {errors.name && <div className="field-error">{errors.name}</div>}
                            </label>
                            <label className={errors.amount ? 'has-error' : ''}>
                                Amount
                                <input name="amount" value={form.amount} onChange={handleFormChange} placeholder="0.00" />
                                {errors.amount && <div className="field-error">{errors.amount}</div>}
                            </label>
                            <label className={errors.date ? 'has-error' : ''}>
                                Date
                                <input type="date" name="date" value={form.date} onChange={handleFormChange} />
                                {errors.date && <div className="field-error">{errors.date}</div>}
                            </label>
                            <div style={{marginTop:8}}>
                                <button className="bank-btn" type="submit" disabled={!!(errors.name || errors.amount || errors.date)}>Save</button>
                            </div>
                        </form>
                    )}
                    
                    {spendings.length > 0 && (
                        <div className="recent-list">
                            <h4>Recent</h4>
                            <ul>
                                {spendings.slice(0,5).map(s => (
                                    <li key={s.id} className="recent-item">
                                        <div className="recent-left">{s.name} — ${Number(s.amount).toFixed(2)}</div>
                                        <div className="recent-right">
                                            <span className="date">{s.date}</span>
                                            <button className="delete-btn" onClick={() => deleteSpending(s.id)} aria-label={`Delete ${s.name}`}>Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
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