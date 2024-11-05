import axios from "axios";

const API_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1/auth'
    : 'http://localhost:3000/api/v1/auth';

const AuthService = {
    // Log in and store the user data in localStorage
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            if (response.data.token && response.data.user) {
                const { token, user } = response.data;
                localStorage.setItem("authToken", JSON.stringify(token));
                localStorage.setItem("userId", JSON.stringify(user._id));
                return { token, user };
            }
            throw new Error("Login failed. Please check your credentials.");
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Log out and clear localStorage
    logout: () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
    },

    // Check if user is already authenticated
    isAuthenticated: () => {
        const token = JSON.parse(localStorage.getItem("authToken"));
        const userId = JSON.parse(localStorage.getItem("userId"));
        return !!token && !!userId;
    },

    // Get the logged-in user ID
    getUserId: () => {
        try {
            return JSON.parse(localStorage.getItem("userId"));
        } catch (error) {
            console.error('Get user ID error:', error);
            return null;
        }
    },

    // Get the token
    getAuthToken: () => {
        try {
            return JSON.parse(localStorage.getItem("authToken"));
        } catch (error) {
            console.error('Get auth token error:', error);
            return null;
        }
    }
};

export default AuthService;