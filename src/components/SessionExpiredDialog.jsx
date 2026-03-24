import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SessionExpiredDialog = () => {
    const [open, setOpen] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleSessionExpired = () => {
            if (!open) {
                setOpen(true);
                setCountdown(5);
            }
        };

        window.addEventListener('sessionExpired', handleSessionExpired);
        return () => window.removeEventListener('sessionExpired', handleSessionExpired);
    }, [open]);

    useEffect(() => {
        let timer;
        if (open && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (open && countdown === 0) {
            handleLogout();
        }
        return () => clearInterval(timer);
    }, [open, countdown]);

    const handleLogout = () => {
        setOpen(false);
        logout();
        navigate('/login');
    };

    return (
        <Dialog
            open={open}
            onClose={() => {}} // Prevent closing by clicking outside
            aria-labelledby="session-expired-dialog-title"
            aria-describedby="session-expired-dialog-description"
        >
            <DialogTitle id="session-expired-dialog-title">
                Session Expired
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="session-expired-dialog-description">
                    Your session has expired. Returning to login page in {countdown}.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleLogout} variant="contained" color="primary" autoFocus>
                    Okay
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionExpiredDialog;
