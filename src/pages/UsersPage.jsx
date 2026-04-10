import React, { useEffect, useState } from 'react';
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
    Alert
} from '@mui/material';
import DataTable from '../components/DataTable';
import { userService, itemService, userItemService } from '../api/services';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openInventory, setOpenInventory] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userItems, setUserItems] = useState([]);
    const [userBundles, setUserBundles] = useState([]);
    const [itemMap, setItemMap] = useState({});
    const [inventoryTab, setInventoryTab] = useState(0);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        banned: ''
    });

    const columns = [
        { id: 'userId', label: 'ID', minWidth: 50 },
        { id: 'email', label: 'Email', minWidth: 150 },
        { id: 'firstName', label: 'First Name', minWidth: 100 },
        { id: 'lastName', label: 'Last Name', minWidth: 100 },
        { id: 'bannedUntil', label: 'Banned Status', minWidth: 150, format: (value) => value ? new Date(value).toLocaleString() : 'Not Banned' },
    ];

    const itemColumns = [
        { id: 'itemId', label: 'Item ID', minWidth: 50 },
        { id: 'itemName', label: 'Name', minWidth: 150 },
        { id: 'quantity', label: 'Quantity', minWidth: 100 },
        { id: 'obtainedDate', label: 'Obtained Date', minWidth: 150 },
    ];

    const bundleColumns = [
        { id: 'skinAndCharacterBundleId', label: 'Skin Bundle ID', minWidth: 100 },
        { id: 'gemBundleId', label: 'Gem Bundle ID', minWidth: 100 },
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
    }, []);

    const handleCreate = () => {
        setCurrentUser(null);
        setFormData({ email: '', firstName: '', lastName: '', password: '', banned: '' });
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
            firstName: user.firstName,
            lastName: user.lastName,
            password: '',
            banned: bannedValue
        });
        setOpenModal(true);
    };

    const handleDelete = async (user) => {
        const reason = window.prompt('Enter ban reason (required):', 'Violation of terms');
        if (!reason) return;
        const until = window.prompt('Ban until (YYYY-MM-DD or leave blank for indefinite):', '');
        try {
            await userService.ban(user.userId, {
                banReason: reason,
                bannedUntil: until ? new Date(until).toISOString() : null
            });
            fetchUsers();
        } catch (error) {
            console.error('Failed to ban user', error);
        }
    };

    const handleViewInventory = async (user) => {
        setCurrentUser(user);
        try {
            const [itemsRes, bundlesRes] = await Promise.all([
                userItemService.getByUserId(user.userId),
                userService.getUserBundles(user.userId)
            ]);
            setUserItems(itemsRes.data.map(i => ({ ...i, itemName: itemMap[i.itemId] || `Item #${i.itemId}` })));
            setUserBundles(bundlesRes.data);
            setOpenInventory(true);
        } catch (error) {
            console.error('Failed to fetch user inventory', error);
        }
    };

    const handleSave = async () => {
        setError('');
        try {
            if (currentUser) {
                // Update: includes all fields
                const bannedUntilValue = formData.banned ? new Date(formData.banned).toISOString() : null;
                const dataToSave = {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    password: formData.password, // Added password to update
                    bannedUntil: bannedUntilValue,
                    banned: bannedUntilValue ? new Date(bannedUntilValue) > new Date() : false
                };
                await userService.update(currentUser.userId, dataToSave);
            } else {
                // Create: only base fields, banned fields removed from CreateUserDto
                const dataToSave = {
                    email: formData.email,
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Users</Typography>
                <Button variant="contained" onClick={handleCreate}>Create User</Button>
            </Box>
            <DataTable
                columns={columns}
                data={users}
                onView={handleViewInventory}
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
                        label="Password"
                        type="password"
                        fullWidth
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        helperText={currentUser ? "Leave blank to keep current" : "Required"}
                    />
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
