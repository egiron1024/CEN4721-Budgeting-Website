import axios from 'axios';

// Match the backend server port (server.ts uses PORT || 5000)
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

// Spending API
export const addSpending = async (id, item, amount, transaction_date) => {
    const username = getCurrentUsername();
    const response = await axios.post(`${API_URL}/user/spending/${username}`, {
        id,
        item,
        amount,
        transaction_date
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

// Spending API - delete transaction
export const deleteSpending = async (id) => {
    const username = getCurrentUsername();
    // axios.delete accepts a request body via the `data` option
    const response = await axios.delete(`${API_URL}/user/spending/${username}`, { data: { id } });
    return response.data;
};
