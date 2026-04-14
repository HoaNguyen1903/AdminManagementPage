import React, { useState, useRef } from 'react';
import { 
    Box, AppBar, Toolbar, Typography, IconButton, CssBaseline, Avatar, 
    Menu, MenuItem, Tooltip, Divider, Button, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, CircularProgress, Alert 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ThemeToggle from './ThemeToggle';
import Sidebar from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { staffService } from '../api/services';

const drawerWidth = 240;
const miniDrawerWidth = 65;

const CustomAppBar = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: miniDrawerWidth,
    width: `calc(100% - ${miniDrawerWidth}px)`,
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Layout = ({ children }) => {
    const [open, setOpen] = useState(true);
    const { user, logout, updateUserData } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const fileInputRef = useRef(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileOpen = () => {
        setFormData({
            email: user?.email || '',
            password: ''
        });
        setIsEditing(false);
        setError('');
        setProfileDialogOpen(true);
        handleMenuClose();
    };

    const handleProfileClose = () => {
        if (!loading) {
            setProfileDialogOpen(false);
            setIsEditing(false);
        }
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate('/login');
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setError('');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await staffService.updateProfile(formData);
            updateUserData(response.data);
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataObj = new FormData();
        formDataObj.append('file', file);

        setLoading(true);
        setError('');
        try {
            const response = await staffService.uploadAvatar(formDataObj);
            updateUserData({ avatarUrl: response.data.avatarUrl });
        } catch (err) {
            setError(err.response?.data || 'Failed to upload avatar');
        } finally {
            setLoading(false);
        }
    };

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const staffName = user?.email ? user.email.split('@')[0] : 'Admin';

    return (
        <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
            <CssBaseline />
            <CustomAppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Admin Dashboard
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ThemeToggle />
                        
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            Hi, {staffName}
                        </Typography>


                        <Tooltip title="Staff Profile">
                            <IconButton onClick={handleProfileOpen} size="small" sx={{ ml: 1 }}>
                                <Avatar 
                                    src={user?.avatarUrl} 
                                    alt={staffName}
                                    sx={{ width: 32, height: 32 }}
                                >
                                    {staffName.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Tooltip>

                        <Button 
                            color="inherit" 
                            startIcon={<LogoutIcon />} 
                            onClick={handleLogout}
                            sx={{ display: { xs: 'none', md: 'flex' } }}
                        >
                            Logout
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            onClick={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleProfileOpen}>
                                <Avatar src={user?.avatarUrl} sx={{ width: 24, height: 24, mr: 1 }}>
                                    {staffName.charAt(0).toUpperCase()}
                                </Avatar>
                                My Profile
                            </MenuItem>
                            <Divider />
                            <MenuItem disabled>
                                <Typography variant="body2">{user?.email}</Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ display: { md: 'none' } }}>
                                <IconButton size="small" sx={{ mr: 1 }}>
                                    <LogoutIcon fontSize="small" />
                                </IconButton>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </CustomAppBar>
            <Sidebar open={open} toggleDrawer={toggleDrawer} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar /> {/* Spacer for AppBar */}
                {children ? children : <Outlet />}
            </Box>

            {/* Profile Dialog */}
            <Dialog 
                open={profileDialogOpen} 
                onClose={handleProfileClose}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center' }}>
                    Staff Profile
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 3 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={user?.avatarUrl}
                                sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    cursor: isEditing ? 'pointer' : 'default',
                                    '&:hover': isEditing ? { opacity: 0.8 } : {}
                                }}
                                onClick={handleAvatarClick}
                            >
                                {staffName.charAt(0).toUpperCase()}
                            </Avatar>
                            {isEditing && (
                                <Box sx={{ 
                                    position: 'absolute', 
                                    bottom: 0, 
                                    right: 0, 
                                    backgroundColor: 'primary.main', 
                                    borderRadius: '50%', 
                                    p: 0.5,
                                    display: 'flex',
                                    color: 'white'
                                }}>
                                    <PhotoCameraIcon fontSize="small" />
                                </Box>
                            )}
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </Box>
                        
                        {!isEditing ? (
                            <>
                                <Typography variant="h5" sx={{ mt: 2 }}>
                                    {staffName}
                                </Typography>
                                <Typography variant="subtitle1" color="textSecondary">
                                    {user?.role}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {user?.email}
                                </Typography>
                            </>
                        ) : (
                            <Box component="form" sx={{ width: '100%', mt: 3 }}>
                                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="New Password (optional)"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    placeholder="Leave blank to keep current"
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    {loading ? (
                        <CircularProgress size={24} sx={{ mx: 'auto' }} />
                    ) : !isEditing ? (
                        <>
                            <Button onClick={handleProfileClose}>Close</Button>
                            <Button 
                                variant="contained" 
                                startIcon={<EditIcon />}
                                onClick={handleEditToggle}
                            >
                                Edit Profile
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleEditToggle}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                onClick={handleUpdateProfile}
                            >
                                Save Changes
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Layout;
