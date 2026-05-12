import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tabs,
    Tab,
    Alert,
    Avatar,
    Chip,
    Divider,
    alpha,
    useTheme
} from '@mui/material';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { userService, itemService, userItemService, shopService } from '../api/services';
import { useNavigate } from 'react-router-dom';

const UsersPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [users, setUsers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openInventory, setOpenInventory] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userItems, setUserItems] = useState([]);
    const [userBundles, setUserBundles] = useState([]);
    const [gemBundles, setGemBundles] = useState([]);
    const [skinBundles, setSkinBundles] = useState([]);
    const [itemMap, setItemMap] = useState({});
    const [inventoryTab, setInventoryTab] = useState(0);
    const [error, setError] = useState('');

    const [banData, setBanData] = useState({
        reason: 'Violation of terms',
        until: ''
    });

    const gemBundleMap = useMemo(() => {
        const map = {};
        gemBundles.forEach(b => {
            map[b.gemBundleId] = b.bundleName;
        });
        return map;
    }, [gemBundles]);

    const skinBundleMap = useMemo(() => {
        const map = {};
        skinBundles.forEach(b => {
            map[b.skinAndCharacterBundleId] = b.bundleName;
        });
        return map;
    }, [skinBundles]);

    const [formData, setFormData] = useState({
        email: '',
        userName: '',
        firstName: '',
        lastName: '',
        password: '',
        banned: '',
        avatarUrl: ''
    });

    const columns = [
        { id: 'userId', label: 'ID', minWidth: 50 },
        { 
            id: 'avatarUrl', 
            label: 'Avatar', 
            minWidth: 70,
            render: (row) => (
                <Avatar 
                    src={row.avatarUrl} 
                    alt={row.firstName}
                    sx={{ width: 32, height: 32 }}
                >
                    {row.firstName?.charAt(0).toUpperCase()}
                </Avatar>
            )
        },
        { id: 'userName', label: 'Username', minWidth: 120 },
        { id: 'email', label: 'Email', minWidth: 150 },
        { id: 'firstName', label: 'First Name', minWidth: 100 },
        { id: 'lastName', label: 'Last Name', minWidth: 100 },
        { 
            id: 'lastOnline', 
            label: 'Status', 
            minWidth: 120,
            render: (row) => {
                const isOnline = row.lastOnline && (new Date() - new Date(row.lastOnline)) < 60000;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                            sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: isOnline ? 'success.main' : 'text.disabled',
                                mr: 1
                            }} 
                        />
                        <Typography variant="body2">
                            {isOnline ? 'Online' : (row.lastOnline ? new Date(row.lastOnline).toLocaleDateString() : 'Never')}
                        </Typography>
                    </Box>
                );
            }
        },
        { id: 'bannedUntil', label: 'Banned Until', minWidth: 150, format: (value) => value ? new Date(value).toLocaleString() : 'Not Banned' },
    ];

    const itemColumns = [
        { id: 'itemId', label: 'Item ID', minWidth: 50 },
        { id: 'itemName', label: 'Name', minWidth: 150 },
        { id: 'quantity', label: 'Quantity', minWidth: 100 },
        { id: 'obtainedDate', label: 'Obtained Date', minWidth: 150 },
    ];

    const bundleColumns = [
        { 
            id: 'bundleName', 
            label: 'Bundle', 
            minWidth: 200,
            render: (row) => {
                const name = row.gemBundleId ? gemBundleMap[row.gemBundleId] : skinBundleMap[row.skinAndCharacterBundleId];
                return (
                    <Chip 
                        label={name || 'Unknown Bundle'} 
                        size="small" 
                        variant="outlined"
                        color={row.gemBundleId ? "primary" : "secondary"}
                    />
                );
            }
        },
        { id: 'quantity', label: 'Quantity (Stock)', minWidth: 100 },
    ];

    const fetchUsers = async () => {
        try {
            const response = await userService.getAll();
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await itemService.getAll();
            const map = {};
            response.data.forEach(item => {
                map[item.itemId] = item.itemName;
            });
            setItemMap(map);
        } catch (error) {
            console.error('Failed to fetch items', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchItems();
        // Fetch bundles for mapping
        shopService.getGemBundles().then(res => setGemBundles(res.data || []));
        shopService.getSkinBundles().then(res => setSkinBundles(res.data || []));
    }, []);

    const handleCreate = () => {
        setCurrentUser(null);
        setFormData({ 
            email: '', 
            userName: '', 
            firstName: '', 
            lastName: '', 
            password: '', 
            banned: '',
            avatarUrl: ''
        });
        setError('');
        setOpenModal(true);
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setError('');
        // Format date for datetime-local input (yyyy-MM-ddThh:mm)
        let bannedValue = '';
        if (user.bannedUntil && typeof user.bannedUntil === 'string') {
            try {
                bannedValue = new Date(user.bannedUntil).toISOString().slice(0, 16);
            } catch (e) {
                console.error('Failed to parse ban date', e);
            }
        }
        
        setFormData({
            email: user.email,
            userName: user.userName || '',
            firstName: user.firstName,
            lastName: user.lastName,
            password: '',
            banned: bannedValue,
            avatarUrl: user.avatarUrl || ''
        });
        setOpenModal(true);
    };

    const handleDelete = (user) => {
        setCurrentUser(user);
        setFormData({
            email: user.email,
            userName: user.userName || '',
            firstName: user.firstName,
            lastName: user.lastName,
            password: '',
            banned: user.bannedUntil ? new Date(user.bannedUntil).toISOString().slice(0, 16) : '',
            avatarUrl: user.avatarUrl || ''
        });
        setBanData({
            reason: 'Violation of terms',
            until: ''
        });
        setOpenDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!banData.reason) {
            setError('Ban reason is required');
            return;
        }
        try {
            await userService.ban(currentUser.userId, {
                banReason: banData.reason,
                bannedUntil: banData.until ? new Date(banData.until).toISOString() : null
            });
            setOpenDeleteModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to ban user', error);
        }
    };

    const handleViewInventory = async (user) => {
        setCurrentUser(user);
        try {
            const [itemsRes, bundlesRes] = await Promise.all([
                userItemService.getUserItemsWithNames(user.userId),
                userService.getUserBundles(user.userId)
            ]);
            setUserItems(itemsRes.data);
            setUserBundles(bundlesRes.data);
            setOpenInventory(true);
        } catch (error) {
            console.error('Failed to fetch user inventory', error);
        }
    };

    const handleSave = async () => {
        setError('');
        console.log('Form Data to Save:', formData);
        try {
            if (currentUser) {
                // Update: includes all fields according to working request body
                const bannedUntilValue = formData.banned ? new Date(formData.banned).toISOString() : null;
                const dataToSave = {
                    email: formData.email,
                    userName: formData.userName,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    password: formData.password || "", // Keep empty if not changed
                    banned: bannedUntilValue ? 1 : 0, // Using 1/0 for boolean as per request body
                    bannedUntil: bannedUntilValue,
                    lastOnline: currentUser.lastOnline || null,
                    isOnline: currentUser.isOnline ? 1 : 0,
                    avatarUrl: formData.avatarUrl || ""
                };
                await userService.update(currentUser.userId, dataToSave);
            } else {
                // Create: only base fields, banned fields removed from CreateUserDto
                const dataToSave = {
                    email: formData.email,
                    userName: formData.userName,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    password: formData.password
                };
                await userService.create(dataToSave);
            }
            setOpenModal(false);
            fetchUsers();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setError('Email already exists in the database.');
            } else {
                console.error('Failed to save user', error);
                setError('Failed to save user. Please try again.');
            }
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <PageHeader 
                title="Users" 
                subtitle="Manage user accounts, monitor activity, and handle bans"
                actionLabel="Create User"
                onAction={handleCreate}
                breadcrumbs={[{ label: 'Users' }]}
            />
            <DataTable
                columns={columns}
                data={users}
                onView={(row) => navigate(`/users/${row.userId}`)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Search users..."
            />

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{currentUser ? 'Edit User' : 'Create User'}</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email"
                        fullWidth
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={error.includes('Email')}
                    />
                    <TextField
                        margin="dense"
                        label="Username"
                        fullWidth
                        value={formData.userName}
                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="First Name"
                        fullWidth
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Last Name"
                        fullWidth
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Avatar URL"
                        fullWidth
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                        helperText="Link to image"
                    />
                    {!currentUser && (
                        <TextField
                            margin="dense"
                            label="Password"
                            type="password"
                            fullWidth
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            helperText="Required"
                        />
                    )}
                    {currentUser && (
                        <TextField
                            margin="dense"
                            label="Banned Until"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.banned}
                            onChange={(e) => setFormData({ ...formData, banned: e.target.value })}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* BAN CONFIRMATION (DELETE ACTION) */}
            <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'error.main' }}>Ban User (Delete Action)</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to ban this user? This is the action performed when deleting a user.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                        <Avatar src={formData.avatarUrl} sx={{ width: 56, height: 56 }}>
                            {formData.firstName?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {formData.firstName} {formData.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {formData.email}
                            </Typography>
                        </Box>
                    </Box>

                    <TextField
                        margin="dense"
                        label="Username"
                        fullWidth
                        value={formData.userName}
                        InputProps={{ readOnly: true }}
                    />

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Ban Details</Typography>

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Ban Reason"
                        fullWidth
                        required
                        value={banData.reason}
                        onChange={(e) => setBanData({ ...banData, reason: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Ban Until"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={banData.until}
                        onChange={(e) => setBanData({ ...banData, until: e.target.value })}
                        helperText="Leave blank for indefinite ban"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Ban User</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openInventory} onClose={() => setOpenInventory(false)} maxWidth="md" fullWidth>
                <DialogTitle>Inventory: {currentUser?.firstName} {currentUser?.lastName}</DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={inventoryTab} onChange={(e, v) => setInventoryTab(v)}>
                            <Tab label="Items" />
                            <Tab label="Bundles Stock" />
                        </Tabs>
                    </Box>
                    {inventoryTab === 0 ? (
                        <DataTable
                            columns={itemColumns}
                            data={userItems}
                            disableActions
                            searchPlaceholder="Search items..."
                        />
                    ) : (
                        <DataTable
                            columns={bundleColumns}
                            data={userBundles}
                            disableActions
                            searchPlaceholder="Search bundles..."
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenInventory(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersPage;
