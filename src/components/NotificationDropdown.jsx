import React, { useState, useEffect } from 'react';
import {
    Box,
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Button,
    Tooltip
} from '@mui/material';
import { Notifications as NotificationsIcon, DoneAll as DoneAllIcon } from '@mui/icons-material';
import { feedbackService } from '../api/services';

const NotificationDropdown = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        fetchNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await feedbackService.getNotifications();
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await feedbackService.markRead(id);
            setNotifications(prev => 
                prev.map(n => n.notificationId === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.notificationId);
        try {
            await Promise.all(unreadIds.map(id => feedbackService.markRead(id)));
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    useEffect(() => {
        // Optional: Initial fetch or setup polling/websocket
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Box>
            <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={handleClick}>
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 480,
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Button 
                            size="small" 
                            startIcon={<DoneAllIcon />} 
                            onClick={handleMarkAllAsRead}
                            sx={{ textTransform: 'none' }}
                        >
                            Mark all read
                        </Button>
                    )}
                </Box>
                <Divider />
                
                {loading && notifications.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No notifications yet
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {notifications.map((notification) => (
                            <ListItem 
                                key={notification.notificationId}
                                onClick={() => !notification.read && handleMarkAsRead(notification.notificationId)}
                                sx={{ 
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'action.selected'
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={notification.notificationMessage}
                                    secondary={notification.read ? 'Read' : 'Unread'}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        fontWeight: notification.read ? 400 : 600,
                                        color: 'text.primary'
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'caption',
                                        color: notification.read ? 'text.secondary' : 'primary.main'
                                    }}
                                />
                                {!notification.read && (
                                    <Box 
                                        sx={{ 
                                            width: 8, 
                                            height: 8, 
                                            borderRadius: '50%', 
                                            bgcolor: 'primary.main',
                                            ml: 1
                                        }} 
                                    />
                                )}
                            </ListItem>
                        ))}
                    </List>
                )}
                
                {notifications.length > 0 && (
                    <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Button size="small" onClick={fetchNotifications} sx={{ textTransform: 'none' }}>
                            Refresh
                        </Button>
                    </Box>
                )}
            </Menu>
        </Box>
    );
};

export default NotificationDropdown;
