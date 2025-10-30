import React, { useState, useEffect } from "react";
import "./planner.css";
import { getUser, addCategory, updateCategory, deleteCategory, addGoal, updateGoal, updateGoalCompleted, deleteGoal } from '../services/api';

function Planner(){
    const [categories, setCategories] = useState([]);
    const [goals, setGoals] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', limit: '' });
    const [newGoal, setNewGoal] = useState({ text: '', amount: '', deadline: '' });
    const [editingGoal, setEditingGoal] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Load data from backend when component mounts
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const userData = await getUser();
            
            // Transform backend data to match your frontend format
            const transformedCategories = userData.categories.map(cat => ({
                id: cat._id || Date.now(),
                name: cat.name,
                limit: cat.limit
            }));
            
            const transformedGoals = userData.goals.map(goal => ({
                id: goal.id,
                text: goal.description,
                amount: goal.amount,
                deadline: goal.due_date ? new Date(goal.due_date).toISOString().split('T')[0] : '',
                completed: goal.completed
            }));
            
            setCategories(transformedCategories);
            setGoals(transformedGoals);
        } catch (error) {
            console.error('Error loading user data:', error);
            alert('Failed to load data. Make sure the backend is running!');
        } finally {
            setLoading(false);
        }
    };

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

    const saveCategory = async () => {
        if (newCategory.name.trim()) {
            try {
                if (isEditingCategory && editingCategory) {
                    // Update existing category
                    await updateCategory(editingCategory.name, newCategory.name, parseFloat(newCategory.limit) || 0);
                    setCategories(categories.map(cat => 
                        cat.id === editingCategory.id 
                            ? { ...cat, name: newCategory.name, limit: parseFloat(newCategory.limit) || 0 }
                            : cat
                    ));
                } else {
                    // Add new category
                    await addCategory(newCategory.name, parseFloat(newCategory.limit) || 0);
                    const category = {
                        id: Date.now(),
                        name: newCategory.name,
                        limit: parseFloat(newCategory.limit) || 0
                    };
                    setCategories([...categories, category]);
                }
                setNewCategory({ name: '', limit: '' });
                setShowCategoryModal(false);
            } catch (error) {
                console.error('Error saving category:', error);
                alert('Failed to save category!');
            }
        }
    };

     const removeCategory = async (id) => {
        try{
            const category = categories.find(cat => cat.id === id);
            if (!category)return;

            await deleteCategory(category.name);
            setCategories(categories.filter(cat => cat.id !== category.id));
        }
        catch (error){
            console.error('Error deleting category:', error);
            alert('Failed to delete category!');
        }
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

    const saveGoal = async () => {
        if (newGoal.text.trim()) {
            try {
                const goalData = {
                    id: editingGoal ? editingGoal.id : Date.now(),
                    description: newGoal.text,
                    amount: parseFloat(newGoal.amount) || 0,
                    due_date: newGoal.deadline ? new Date(newGoal.deadline) : null
                };

                if (editingGoal) {
                    // Update existing goal
                    await updateGoal(editingGoal.id, goalData.description, goalData.amount, goalData.due_date);
                    setGoals(goals.map(goal => 
                        goal.id === editingGoal.id 
                            ? { ...goal, text: newGoal.text, amount: parseFloat(newGoal.amount) || 0, deadline: newGoal.deadline }
                            : goal
                    ));
                } else {
                    // Add new goal
                    await addGoal(goalData.id, goalData.description, goalData.amount, goalData.due_date);
                    const goal = {
                        id: goalData.id,
                        text: newGoal.text,
                        amount: parseFloat(newGoal.amount) || 0,
                        deadline: newGoal.deadline,
                        completed: false
                    };
                    setGoals([...goals, goal]);
                }
                setNewGoal({ text: '', amount: '', deadline: '' });
                setShowGoalModal(false);
            } catch (error) {
                console.error('Error saving goal:', error);
                alert('Failed to save goal!');
            }
        }
    };

    const removeGoal = async (id) => {
        try {
            await deleteGoal(id);
            setGoals(goals.filter(goal => goal.id !== id));
        } catch (error) {
            console.error('Error deleting goal:', error);
            alert('Failed to delete goal!');
        }
    };

    const closeGoalModal = () => {
        setShowGoalModal(false);
        setNewGoal({ text: '', amount: '', deadline: '' });
        setEditingGoal(null);
    };

    const toggleGoalComplete = async (id) => {
        try {
            const goal = goals.find(g => g.id === id);
            await updateGoalCompleted(id, !goal.completed);
            setGoals(goals.map(goal => 
                goal.id === id ? { ...goal, completed: !goal.completed } : goal
            ));
        } catch (error) {
            console.error('Error toggling goal:', error);
            alert('Failed to update goal status!');
        }
    };

    if (loading) {
        return <div className="planner"><p>Loading...</p></div>;
    }

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
