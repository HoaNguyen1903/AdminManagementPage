import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const parseJwt = (t) => {
        try {
            const base64Url = t.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        setToken(storedToken);
        const nowSec = Math.floor(Date.now() / 1000);
        if (storedToken) {
            const payload = parseJwt(storedToken);
            if (!payload || (payload.exp && payload.exp <= nowSec)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setToken(null);
            } else if (userData) {
                setUser(JSON.parse(userData));
            } else {
                const inferredUser = { 
                    email: payload.email || payload.sub || '', 
                    role: payload.role || payload.roles || null,
                    avatarUrl: payload.avatarUrl || null
                };
                setUser(inferredUser);
                localStorage.setItem('user', JSON.stringify(inferredUser));
            }
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        const t = data?.token || data?.accessToken || '';
        setToken(t);
        localStorage.setItem('token', t);
        const u = data?.user || (data?.email ? { 
            email: data.email, 
            role: data.role,
            avatarUrl: data.avatarUrl 
        } : (parseJwt(t) || null));
        if (u) {
            localStorage.setItem('user', JSON.stringify(u));
            setUser(u);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
    };

    const updateUserData = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, updateUserData }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
