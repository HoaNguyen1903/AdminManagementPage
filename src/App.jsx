import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ColorModeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import BannersPage from './pages/BannersPage';
import GameItemsPage from './pages/GameItemsPage';
import NotificationsPage from './pages/NotificationsPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

import Layout from './components/Layout';
import SessionExpiredDialog from './components/SessionExpiredDialog';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
};

const App = () => {
    return (
        <ColorModeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/" element={<HomePage />} />
                            <Route path="/banners" element={<BannersPage />} />
                            <Route path="/game-items" element={<GameItemsPage />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/users" element={<UsersPage />} />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ColorModeProvider>
    );
};

export default App;