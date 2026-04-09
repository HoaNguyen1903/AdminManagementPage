import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ColorModeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import CharactersPage from './pages/CharactersPage';
import FeedbackPage from './pages/FeedbackPage';
import ItemsPage from './pages/ItemsPage';
import ShopPage from './pages/ShopPage';
import OrdersPage from './pages/OrdersPage';
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
                            <Route path="/announcements" element={<AnnouncementsPage />} />
                            <Route path="/characters" element={<CharactersPage />} />
                            <Route path="/feedback" element={<FeedbackPage />} />
                            <Route path="/items" element={<ItemsPage />} />
                            <Route path="/shop" element={<ShopPage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/users" element={<UsersPage />} />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ColorModeProvider>
    );
};

export default App;