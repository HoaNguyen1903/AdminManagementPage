import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton,
    Box,
    useTheme,
    Typography
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Campaign as AnnouncementsIcon,
    Person as CharactersIcon,
    Report as ReportsIcon,
    Inventory as ItemsIcon,
    Storefront as ShopIcon,
    ShoppingCart as OrdersIcon,
    People as UsersIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
    // Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Announcements', icon: <AnnouncementsIcon />, path: '/announcements' },
    { text: 'Characters', icon: <CharactersIcon />, path: '/characters' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Items', icon: <ItemsIcon />, path: '/items' },
    { text: 'Shop', icon: <ShopIcon />, path: '/shop' },
    { text: 'Orders', icon: <OrdersIcon />, path: '/orders' },
    { text: 'Users', icon: <UsersIcon />, path: '/users' },
];

const Sidebar = ({ open, toggleDrawer }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            open={open}
            sx={{
                width: open ? drawerWidth : 80,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                '& .MuiDrawer-paper': {
                    width: open ? drawerWidth : 80,
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0 12px',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: open ? 'space-between' : 'center',
                    padding: '20px 8px',
                    minHeight: 80,
                }}
            >
                {open && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box 
                            sx={{ 
                                width: 32, 
                                height: 32, 
                                borderRadius: '8px', 
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}
                        >
                            <DashboardIcon fontSize="small" />
                        </Box>
                        <Typography variant="h6" fontWeight="700" color="primary">
                            Dasher
                        </Typography>
                    </Box>
                )}
                {!open && (
                    <Box 
                        sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '8px', 
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}
                    >
                        <DashboardIcon fontSize="small" />
                    </Box>
                )}
            </Box>

            <List sx={{ mt: 2 }}>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 44,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2,
                                    borderRadius: '8px',
                                    color: active ? 'primary.main' : 'text.secondary',
                                    bgcolor: active ? 'rgba(0, 167, 111, 0.08)' : 'transparent',
                                    '&:hover': {
                                        bgcolor: active ? 'rgba(0, 167, 111, 0.12)' : 'rgba(145, 158, 171, 0.08)',
                                    },
                                }}
                                onClick={() => navigate(item.path)}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 2 : 'auto',
                                        justifyContent: 'center',
                                        color: active ? 'primary.main' : 'inherit',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {open && (
                                    <ListItemText 
                                        primary={item.text} 
                                        primaryTypographyProps={{ 
                                            fontSize: '0.875rem',
                                            fontWeight: active ? 600 : 500
                                        }} 
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
};

export default Sidebar;
