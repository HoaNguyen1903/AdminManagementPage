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
    useTheme
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Campaign as AnnouncementsIcon,
    Person as CharactersIcon,
    Feedback as FeedbackIcon,
    Inventory as ItemsIcon,
    Storefront as ShopIcon,
    ShoppingCart as OrdersIcon,
    People as UsersIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Announcements', icon: <AnnouncementsIcon />, path: '/announcements' },
    { text: 'Characters', icon: <CharactersIcon />, path: '/characters' },
    { text: 'Feedback', icon: <FeedbackIcon />, path: '/feedback' },
    { text: 'Items', icon: <ItemsIcon />, path: '/items' },
    { text: 'Shop', icon: <ShopIcon />, path: '/shop' },
    { text: 'Orders', icon: <OrdersIcon />, path: '/orders' },
    { text: 'Users', icon: <UsersIcon />, path: '/users' },
];

const Sidebar = ({ open, toggleDrawer }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <Drawer
            variant="permanent"
            open={open}
            sx={{
                width: open ? drawerWidth : 65,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                '& .MuiDrawer-paper': {
                    width: open ? drawerWidth : 65,
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: theme.spacing(0, 1),
                    // necessary for content to be below app bar
                    ...theme.mixins.toolbar,
                }}
            >
                <IconButton onClick={toggleDrawer}>
                    {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                            }}
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                        }}
                        onClick={logout}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 3 : 'auto',
                                justifyContent: 'center',
                            }}
                        >
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;
