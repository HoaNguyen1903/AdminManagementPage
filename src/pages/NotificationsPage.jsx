import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import DataTable from '../components/DataTable';
import { notificationService } from '../api/services';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);

    const columns = [
        { id: 'notificationId', label: 'ID', minWidth: 50 },
        { id: 'notificationMessage', label: 'Message', minWidth: 200 },
        { id: 'receiverId', label: 'Receiver ID', minWidth: 100 },
    ];

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getAll();
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>Notifications</Typography>
            <DataTable
                columns={columns}
                data={notifications}
                disableActions
                searchPlaceholder="Search notifications..."
            />
        </Box>
    );
};

export default NotificationsPage;
