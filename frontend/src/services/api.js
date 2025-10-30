import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// For now, hardcode username - you'll replace this with auth later
const getCurrentUsername = () => {
    return 'testuser'; // Replace with actual auth later
};

// Categories API
export const getUser = async () => {
    const username = getCurrentUsername();
    const response = await axios.get(`${API_URL}/user/${username}`);
    return response.data;
};

export const addCategory = async (name, limit) => {
    const username = getCurrentUsername();
    const response = await axios.post(`${API_URL}/user/categories/${username}`, {
        name,
        limit
    });
    return response.data;
};

export const updateCategory = async (oldName, name, limit) => {
    const username = getCurrentUsername();
    const response = await axios.patch(`${API_URL}/user/categories/${username}/${oldName}`, {
        name,
        limit
    });
    return response.data;
};

export const deleteCategory = async (oldName) => {
    const username = getCurrentUsername();
    const response = await axios.delete(`${API_URL}/user/categories/${username}/${oldName}`);
    return response.data;
};

// Goals API
export const addGoal = async (id, description, amount, due_date) => {
    const username = getCurrentUsername();
    const response = await axios.post(`${API_URL}/user/goals/${username}`, {
        id,
        description,
        amount,
        due_date
    });
    return response.data;
};

export const updateGoal = async (id, description, amount, due_date) => {
    const username = getCurrentUsername();
    const response = await axios.patch(`${API_URL}/user/goals/${username}/${id}`, {
        description,
        amount,
        due_date
    });
    return response.data;
};

export const updateGoalCompleted = async (id, completed) => {
    const username = getCurrentUsername();
    const response = await axios.patch(`${API_URL}/user/goals/${username}/${id}`, {
        completed
    });
    return response.data;
};

export const deleteGoal = async (id) => {
    const username = getCurrentUsername();
    const response = await axios.delete(`${API_URL}/user/goals/${username}/${id}`);
    return response.data;
};
