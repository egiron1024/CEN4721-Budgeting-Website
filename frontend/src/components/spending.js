import React, { useEffect, useState } from "react";
import "./spending.css"
import { addSpending as apiAddSpending, getUser, deleteSpending as apiDeleteSpending, addBank as apiAddBank, deleteBank as apiDeleteBank, updateSpendingCategory as apiUpdateSpendingCategory } from '../services/api';

// ---------------------------
// Spending component
// ---------------------------
function Spending(){
    // --- State & constants
    const ranges = ["Monthly", "Yearly", "Weekly"];
    const [rangeIndex, setRangeIndex] = useState(0);
    const [animate, setAnimate] = useState(false);
    const [banks, setBanks] = useState([]);
    const [mounted, setMounted] = useState(false);
    const [spendings, setSpendings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ amount: '', name: '', date: '' });
    const [errors, setErrors] = useState({ name: '', amount: '', date: '' });
    const [isAddingBank, setIsAddingBank] = useState(false);
    const [showAllSpending, setShowAllSpending] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    // --- Handlers
    function nextRange(){
        setRangeIndex((rangeIndex + 1) % ranges.length);
        setAnimate(true);
        setTimeout(() => setAnimate(false), 350);
    }

    async function addBank(){
        if (isAddingBank) return;
        
        setIsAddingBank(true);
        try {
            const bankId = Date.now();
            const bankName = "Chase Bank";
            
            const result = await apiAddBank(bankId, bankName);
            
            await loadUserData();
            
            console.log(`Added ${result.transactionsAdded} transactions from ${bankName}`);
        } catch(err) {
            console.error('Failed to add bank', err);
        } finally {
            setIsAddingBank(false);
        }
    }

    async function removeBank(bankId){
        try {
            await apiDeleteBank(bankId);
            await loadUserData();
        } catch(err) {
            console.error('Failed to remove bank', err);
        }
    }

    // --- Category handlers
    function toggleDropdown(spendingId){
        setOpenDropdownId(openDropdownId === spendingId ? null : spendingId);
    }

    async function assignCategory(spendingId, categoryName){
        try {
            await apiUpdateSpendingCategory(spendingId, categoryName);
            // Update local state
            setSpendings(prev => prev.map(s => 
                s.id === spendingId ? { ...s, category: categoryName } : s
            ));
            setOpenDropdownId(null);
        } catch(err) {
            console.error('Failed to update category', err);
        }
    }

    // --- Spending form handlers
    function toggleAddForm(){
        setShowAdd(!showAdd);
    }

    function handleFormChange(e){
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
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
        const validName = validateField('name', form.name);
        const validAmount = validateField('amount', form.amount);
        const validDate = validateField('date', form.date);
        if (!validName || !validAmount || !validDate) return;

        const amt = parseFloat(form.amount) || 0;
        const newId = Date.now();
        const txDate = form.date ? new Date(form.date).getTime() : Date.now();

        apiAddSpending(newId, form.name.trim() || 'Unnamed', amt, txDate)
            .then(() => {
                loadSpendings();
                setForm({ amount: '', name: '', date: '' });
                setErrors({ name: '', amount: '', date: '' });
                setShowAdd(false);
            })
            .catch(err => {
                console.error('Failed to save spending to server', err);
                const item = { id: newId, amount: amt, name: form.name.trim() || 'Unnamed', date: form.date || new Date().toISOString().slice(0,10), ts: txDate };
                setSpendings(prev => [item, ...prev]);
                setForm({ amount: '', name: '', date: '' });
                setErrors({ name: '', amount: '', date: '' });
                setShowAdd(false);
            });
    }

    function deleteSpending(id){
        apiDeleteSpending(id)
            .then(() => {
                loadSpendings();
            })
            .catch(err => {
                console.error('Failed to delete spending on server', err);
                setSpendings(prev => prev.filter(s => s.id !== id));
            });
    }

    function calcTotal(){
        const range = ranges[rangeIndex] ? ranges[rangeIndex].toLowerCase() : 'monthly';
        const today = new Date();

        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        let start;
        let end;

        if (range === 'weekly'){
            start = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), startOfToday.getDate() - 6, 0,0,0,0);
            end = endOfToday;
        } else if (range === 'monthly'){
            start = new Date(today.getFullYear(), today.getMonth(), 1, 0,0,0,0);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23,59,59,999);
        } else if (range === 'yearly'){
            start = new Date(today.getFullYear(), 0, 1, 0,0,0,0);
            end = new Date(today.getFullYear(), 11, 31, 23,59,59,999);
        } else {
            start = new Date(0);
            end = endOfToday;
        }

        const startTs = start.getTime();
        const endTs = end.getTime();

        return spendings.reduce((sum, it) => {
            let D;
            if (it && typeof it.ts === 'number'){
                D = new Date(it.ts);
            } else if (typeof it.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(it.date)){
                const [y, m, d] = it.date.split('-').map(Number);
                D = new Date(y, m - 1, d, 12, 0, 0, 0);
            } else {
                D = new Date(it.date);
            }
            const dt = D.getTime();
            if (Number.isNaN(dt)) return sum;
            if (dt >= startTs && dt <= endTs) return sum + Number(it.amount || 0);
            return sum;
        }, 0);
    }

    // --- Effects
    useEffect(()=>{
        const t = setTimeout(()=> setMounted(true), 20);
        return ()=> clearTimeout(t);
    },[]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (openDropdownId && !event.target.closest('.category-dropdown-container')) {
                setOpenDropdownId(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    const loadSpendings = async () => {
        try {
            const user = await getUser();
            if (user && Array.isArray(user.spending)){
                const mapped = user.spending.map(s => ({
                    id: s.id,
                    name: s.item,
                    amount: s.amount,
                    date: s.transaction_date ? new Date(s.transaction_date).toISOString().slice(0,10) : '',
                    ts: typeof s.transaction_date === 'number' ? s.transaction_date : (s.transaction_date ? Number(s.transaction_date) : undefined),
                    bankId: s.bank_id,
                    category: s.category || null
                }));
                mapped.sort((a,b) => {
                    const da = new Date(a.date).getTime() || 0;
                    const db = new Date(b.date).getTime() || 0;
                    return db - da;
                });
                setSpendings(mapped);
            }
        } catch(err){
            console.error('Failed to load spendings from server', err);
        }
    }

    const loadUserData = async () => {
        try {
            const user = await getUser();
            
            if (user && Array.isArray(user.banks)){
                setBanks(user.banks);
            }

            if (user && Array.isArray(user.categories)){
                setCategories(user.categories.map(cat => ({
                    name: cat.name,
                    limit: cat.limit
                })));
            }
            
            if (user && Array.isArray(user.spending)){
                const mapped = user.spending.map(s => ({
                    id: s.id,
                    name: s.item,
                    amount: s.amount,
                    date: s.transaction_date ? new Date(s.transaction_date).toISOString().slice(0,10) : '',
                    ts: typeof s.transaction_date === 'number' ? s.transaction_date : (s.transaction_date ? Number(s.transaction_date) : undefined),
                    bankId: s.bank_id,
                    category: s.category || null
                }));
                mapped.sort((a,b) => {
                    const da = new Date(a.date).getTime() || 0;
                    const db = new Date(b.date).getTime() || 0;
                    return db - da;
                });
                setSpendings(mapped);
            }
        } catch(err){
            console.error('Failed to load user data from server', err);
        }
    }

    useEffect(()=>{
        loadUserData();
    },[]);

    // Determine how many spendings to show
    const displayedSpendings = showAllSpending ? spendings : spendings.slice(0, 5);

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
                                {displayedSpendings.map(s => (
                                    <li key={s.id} className="recent-item">
                                        <div className="recent-left">
                                            <div className="item-header">
                                                <span className="item-name">{s.name}</span>
                                                <span className="item-amount">${Number(s.amount).toFixed(2)}</span>
                                            </div>
                                            <span className="date">{s.date}</span>
                                        </div>
                                        <div className="recent-right">
                                            {/* Category Dropdown */}
                                            <div className="category-dropdown-container">
                                                <button 
                                                    className="category-btn" 
                                                    onClick={() => toggleDropdown(s.id)}
                                                    aria-label="Assign category"
                                                >
                                                    {s.category || 'Category'}
                                                </button>
                                                
                                                {openDropdownId === s.id && (
                                                    <div className="category-dropdown">
                                                        {categories.length === 0 ? (
                                                            <div className="dropdown-item no-categories">
                                                                Create a category first in Planner
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div 
                                                                    className="dropdown-item"
                                                                    onClick={() => assignCategory(s.id, null)}
                                                                >
                                                                    None
                                                                </div>
                                                                {categories.map(cat => (
                                                                    <div 
                                                                        key={cat.name}
                                                                        className={`dropdown-item ${s.category === cat.name ? 'selected' : ''}`}
                                                                        onClick={() => assignCategory(s.id, cat.name)}
                                                                    >
                                                                        {cat.name}
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <button className="delete-btn" onClick={() => deleteSpending(s.id)} aria-label={`Delete ${s.name}`}>Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {spendings.length > 5 && (
                                <button 
                                    className="bank-btn" 
                                    onClick={() => setShowAllSpending(!showAllSpending)}
                                    style={{marginTop: '10px'}}
                                >
                                    {showAllSpending ? 'Show Less' : `Show All (${spendings.length} items)`}
                                </button>
                            )}
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
                            {banks.map((b) => (
                                <li key={b.id} className="bank-item">
                                    <span>{b.name}</span>
                                    <button className="delete-btn" onClick={() => removeBank(b.id)} aria-label={`Remove ${b.name}`}>Remove</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="card-footer">
                    <button className="bank-btn" onClick={addBank} disabled={isAddingBank}>
                        {isAddingBank ? 'Adding...' : 'Add Bank'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Spending