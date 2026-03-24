import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import DataTable from '../components/DataTable';
import { userService, userItemService, gameItemService } from '../api/services';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openInventory, setOpenInventory] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userItems, setUserItems] = useState([]);
    const [itemMap, setItemMap] = useState({});

    const itemTypes = {
        1: 'Character',
        2: 'Skin Shard',
        3: 'Gem'
    };

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

    const inventoryColumns = [
        { id: 'itemId', label: 'Item ID', minWidth: 50 },
        { id: 'itemName', label: 'Name', minWidth: 150 },
        { id: 'type', label: 'Type', minWidth: 100 },
        { id: 'quantity', label: 'Quantity', minWidth: 100 },
        { id: 'obtainedDate', label: 'Obtained Date', minWidth: 150 },
    ];

    const fetchUsers = async () => {
        try {
            const response = await userService.getAll();
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const fetchGameItems = async () => {
        try {
            const response = await gameItemService.getAll();
            const map = {};
            response.data.forEach(item => {
                map[item.itemId] = item;
            });
            setItemMap(map);
        } catch (error) {
            console.error('Failed to fetch game items', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchGameItems();
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
            const response = await userItemService.getByUserId(user.userId);
            const items = response.data.map(item => {
                const itemDetails = itemMap[item.itemId] || {};
                return {
                    ...item,
                    itemName: itemDetails.name || 'Unknown',
                    type: itemTypes[itemDetails.type] || itemDetails.type || 'Unknown'
                };
            });
            setUserItems(items);
            setOpenInventory(true);
        } catch (error) {
            console.error('Failed to fetch user inventory', error);
        }
    };

    const handleSave = async () => {
        try {
            const data = { ...formData };
            // Handle optional date field for banned
            if (!data.banned) data.banned = null;

            if (currentUser) {
                await userService.update(currentUser.userId, data);
            } else {
                await userService.create(data);
            }
            setOpenModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to save user', error);
        }
    };

    return (
        <Box>
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

            {/* Create/Edit Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
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
                        helperText={currentUser ? "Leave blank to keep current password" : "Required for new users"}
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

            {/* Inventory Modal */}
            <Dialog open={openInventory} onClose={() => setOpenInventory(false)} maxWidth="md" fullWidth>
                <DialogTitle>User Inventory: {currentUser?.fullName}</DialogTitle>
                <DialogContent>
                    <DataTable
                        columns={inventoryColumns}
                        data={userItems}
                        disableActions
                        searchPlaceholder="Search inventory..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenInventory(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersPage;
