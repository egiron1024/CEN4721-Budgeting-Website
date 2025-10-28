import React, { useState } from "react";
import "./planner.css"

function Planner(){
    const [categories, setCategories] = useState([]);
    const [goals, setGoals] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', limit: '' });
    const [newGoal, setNewGoal] = useState({ text: '', amount: '', deadline: '' });
    const [editingGoal, setEditingGoal] = useState(null);
    
    // Modal states
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Category functions
    const openCategoryModal = () => {
        setNewCategory({ name: '', limit: '' });
        setIsEditingCategory(false);
        setEditingCategory(null);
        setShowCategoryModal(true);
    };

    const openEditCategoryModal = (category) => {
        setNewCategory({ name: category.name, limit: category.limit.toString() });
        setIsEditingCategory(true);
        setEditingCategory(category);
        setShowCategoryModal(true);
    };

    const saveCategory = () => {
        if (newCategory.name.trim()) {
            if (isEditingCategory && editingCategory) {
                // Update existing category
                setCategories(categories.map(cat => 
                    cat.id === editingCategory.id 
                        ? { ...cat, name: newCategory.name, limit: parseFloat(newCategory.limit) || 0 }
                        : cat
                ));
            } else {
                // Add new category
                const category = {
                    id: Date.now(),
                    name: newCategory.name,
                    limit: parseFloat(newCategory.limit) || 0
                };
                setCategories([...categories, category]);
            }
            setNewCategory({ name: '', limit: '' });
            setShowCategoryModal(false);
        }
    };

    const removeCategory = (id) => {
        setCategories(categories.filter(cat => cat.id !== id));
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setNewCategory({ name: '', limit: '' });
        setIsEditingCategory(false);
        setEditingCategory(null);
    };

    // Goal functions
    const openGoalModal = () => {
        setNewGoal({ text: '', amount: '', deadline: '' });
        setEditingGoal(null);
        setShowGoalModal(true);
    };

    const openEditGoalModal = (goal) => {
        setNewGoal({ text: goal.text, amount: goal.amount.toString(), deadline: goal.deadline });
        setEditingGoal(goal);
        setShowGoalModal(true);
    };

    const saveGoal = () => {
        if (newGoal.text.trim()) {
            if (editingGoal) {
                // Update existing goal
                setGoals(goals.map(goal => 
                    goal.id === editingGoal.id 
                        ? { ...goal, text: newGoal.text, amount: parseFloat(newGoal.amount) || 0, deadline: newGoal.deadline }
                        : goal
                ));
            } else {
                // Add new goal
                const goal = {
                    id: Date.now(),
                    text: newGoal.text,
                    amount: parseFloat(newGoal.amount) || 0,
                    deadline: newGoal.deadline,
                    completed: false
                };
                setGoals([...goals, goal]);
            }
            setNewGoal({ text: '', amount: '', deadline: '' });
            setShowGoalModal(false);
        }
    };

    const removeGoal = (id) => {
        setGoals(goals.filter(goal => goal.id !== id));
    };

    const closeGoalModal = () => {
        setShowGoalModal(false);
        setNewGoal({ text: '', amount: '', deadline: '' });
        setEditingGoal(null);
    };

    const toggleGoalComplete = (id) => {
        setGoals(goals.map(goal => 
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
        ));
    };

    return(
        <div className="planner">
            <h1 className="planner-title">Budget Planner</h1>
            <div className="planner-layout">
                {/* Categories Section - 2/3 width */}
                <div className="categories-section">
                    <div className="section-header">
                        <h2>Categories</h2>
                        <p>Manage your spending categories and limits</p>
                        <button onClick={openCategoryModal} className="add-btn">+ Add Category</button>
                    </div>

                    <div className="categories-list">
                        {categories.length === 0 ? (
                            <p className="empty-state">No categories yet. Click "Add Category" to get started!</p>
                        ) : (
                            categories.map(category => (
                                <div key={category.id} className="category-item">
                                    <div className="category-info">
                                        <h3>{category.name}</h3>
                                        <span className="limit">${category.limit.toFixed(2)}/month</span>
                                    </div>
                                    <div className="category-actions">
                                        <button 
                                            onClick={() => openEditCategoryModal(category)}
                                            className="edit-btn"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => removeCategory(category.id)}
                                            className="remove-btn"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Goals Section - 1/3 width */}
                <div className="goals-section">
                    <div className="section-header">
                        <h2>Goals</h2>
                        <p>Set and track your financial goals</p>
                        <button onClick={openGoalModal} className="add-btn">+ Add Goal</button>
                    </div>

                    <div className="goals-list">
                        {goals.length === 0 ? (
                            <p className="empty-state">No goals yet. Click "Add Goal" to get started!</p>
                        ) : (
                            goals.map(goal => (
                                <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                                    <div className="goal-info">
                                        <h3>{goal.text}</h3>
                                        <div className="goal-details">
                                            <span className="amount">${goal.amount.toFixed(2)}</span>
                                            {goal.deadline && (
                                                <span className="deadline">Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="goal-actions">
                                        <button 
                                            onClick={() => toggleGoalComplete(goal.id)}
                                            className={`toggle-btn ${goal.completed ? 'completed' : ''}`}
                                        >
                                            {goal.completed ? '✓' : '○'}
                                        </button>
                                        <button 
                                            onClick={() => openEditGoalModal(goal)}
                                            className="edit-btn"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => removeGoal(goal.id)}
                                            className="remove-btn"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="modal-overlay" onClick={closeCategoryModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{isEditingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                            <button className="close-btn" onClick={closeCategoryModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                placeholder="Category name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                            />
                            <input
                                type="number"
                                placeholder="Monthly limit ($)"
                                value={newCategory.limit}
                                onChange={(e) => setNewCategory({...newCategory, limit: e.target.value})}
                            />
                        </div>
                        <div className="modal-footer">
                            <button onClick={closeCategoryModal} className="cancel-btn">Cancel</button>
                            <button onClick={saveCategory} className="save-btn">
                                {isEditingCategory ? 'Update Category' : 'Add Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Goal Modal */}
            {showGoalModal && (
                <div className="modal-overlay" onClick={closeGoalModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h3>
                            <button className="close-btn" onClick={closeGoalModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                placeholder="Goal description"
                                value={newGoal.text}
                                onChange={(e) => setNewGoal({...newGoal, text: e.target.value})}
                            />
                            <input
                                type="number"
                                placeholder="Target amount ($)"
                                value={newGoal.amount}
                                onChange={(e) => setNewGoal({...newGoal, amount: e.target.value})}
                            />
                            <input
                                type="date"
                                value={newGoal.deadline}
                                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                            />
                        </div>
                        <div className="modal-footer">
                            <button onClick={closeGoalModal} className="cancel-btn">Cancel</button>
                            <button onClick={saveGoal} className="save-btn">
                                {editingGoal ? 'Update Goal' : 'Add Goal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Planner;
