import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert, Paper } from '@mui/material';
import ThemeToggle from '../components/ThemeToggle';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user, loading, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (user || token)) {
            navigate('/');
        }
    }, [loading, user, token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/Auth/login', { email, password });
            login(response.data);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <Box className="authentication-wrapper authentication-basic container-p-y">
            <div className="theme-toggle">
                <ThemeToggle />
            </div>
            
            <Box className="authentication-inner">
                <Paper className="card" elevation={3}>
                    <div className="card-body">
                        <h4 className="mb-2 auth-title">Admin Login</h4>
                        {error && <Alert className="auth-error" severity="error">{error}</Alert>}
                        <Box component="form" onSubmit={handleSubmit} className="mb-3">
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                className="btn btn-primary d-grid w-100 sneat-btn"
                            >
                                Sign In
                            </Button>
                        </Box>
                    </div>
                </Paper>
            </Box>
        </Box>
    );
};

export default LoginPage;