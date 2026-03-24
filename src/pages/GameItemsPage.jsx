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
import { gameItemService } from '../api/services';

const GameItemsPage = () => {
    const [items, setItems] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        type: ''
    });

    const itemTypes = {
        1: 'Character',
        2: 'Skin Shard',
        3: 'Gem'
    };

    const columns = [
        { id: 'itemId', label: 'ID', minWidth: 50 },
        { id: 'name', label: 'Name', minWidth: 100 },
        { id: 'price', label: 'Price', minWidth: 100 },
        { id: 'description', label: 'Description', minWidth: 200 },
        { 
            id: 'type', 
            label: 'Type', 
            minWidth: 50,
            format: (value) => itemTypes[value] || value
        },
    ];

    const fetchItems = async () => {
        try {
            const response = await gameItemService.getAll();
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch items', error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreate = () => {
        setCurrentItem(null);
        setFormData({ name: '', price: '', description: '', type: '' });
        setOpenModal(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setFormData({
            name: item.name,
            price: item.price,
            description: item.description,
            type: item.type
        });
        setOpenModal(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await gameItemService.delete(item.itemId);
                fetchItems();
            } catch (error) {
                console.error('Failed to delete item', error);
            }
        }
    };

    const handleSave = async () => {
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                type: parseInt(formData.type)
            };
            if (currentItem) {
                await gameItemService.update(currentItem.itemId, data);
            } else {
                await gameItemService.create(data);
            }
            setOpenModal(false);
            fetchItems();
        } catch (error) {
            console.error('Failed to save item', error);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Game Items</Typography>
                <Button variant="contained" onClick={handleCreate}>Create Item</Button>
            </Box>
            <DataTable
                columns={columns}
                data={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Search game items..."
            />

            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>{currentItem ? 'Edit Item' : 'Create Item'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Price"
                        type="number"
                        fullWidth
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Type"
                        type="number"
                        fullWidth
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GameItemsPage;
