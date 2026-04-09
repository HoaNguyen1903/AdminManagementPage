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
    Tab
} from '@mui/material';
import DataTable from '../components/DataTable';
import { userService, itemService } from '../api/services';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openInventory, setOpenInventory] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userItems, setUserItems] = useState([]);
    const [userBundles, setUserBundles] = useState([]);
    const [itemMap, setItemMap] = useState({});
    const [inventoryTab, setInventoryTab] = useState(0);

    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
        banned: ''
    });

    const columns = [
        { id: 'userId', label: 'ID', minWidth: 50 },
        { id: 'email', label: 'Email', minWidth: 150 },
        { id: 'fullName', label: 'Full Name', minWidth: 150 },
        { id: 'banned', label: 'Banned Until', minWidth: 150 },
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
        setFormData({ email: '', fullName: '', password: '', banned: '' });
        setOpenModal(true);
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setFormData({
            email: user.email,
            fullName: user.fullName,
            password: '',
            banned: user.banned || ''
        });
        setOpenModal(true);
    };

    const handleDelete = async (user) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // userService.delete(user.userId) - Assuming delete is still available
                await userService.delete(user.userId);
                fetchUsers();
            } catch (error) {
                console.error('Failed to delete user', error);
            }
        }
    };

    const handleViewInventory = async (user) => {
        setCurrentUser(user);
        try {
            const [itemsRes, bundlesRes] = await Promise.all([
                userService.getUserItems(user.userId),
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
        try {
            if (currentUser) {
                await userService.update(currentUser.userId, formData);
            } else {
                await userService.create(formData);
            }
            setOpenModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to save user', error);
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
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email"
                        fullWidth
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Full Name"
                        fullWidth
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                    <TextField
                        margin="dense"
                        label="Banned Until"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.banned}
                        onChange={(e) => setFormData({ ...formData, banned: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openInventory} onClose={() => setOpenInventory(false)} maxWidth="md" fullWidth>
                <DialogTitle>Inventory: {currentUser?.fullName}</DialogTitle>
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
