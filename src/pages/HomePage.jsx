import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Typography, Container, Box } from '@mui/material';

const HomePage = () => {
    const { user, logout } = useAuth();

    return (
        <Container>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome to Admin Dashboard
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Logged in as: {user?.email}
                </Typography>
                <Button variant="contained" color="secondary" onClick={logout}>
                    Logout
                </Button>
            </Box>
        </Container>
    );
};

export default HomePage;