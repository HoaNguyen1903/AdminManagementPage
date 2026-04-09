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
    MenuItem
} from '@mui/material';
import DataTable from '../components/DataTable';
import { itemService } from '../api/services';

const ItemsPage = () => {
    const [items, setItems] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        itemName: '',
        itemDescription: '',
        itemType: 'Character'
    });

    const columns = [
        { id: 'itemId', label: 'ID', minWidth: 50 },
        { id: 'itemName', label: 'Name', minWidth: 150 },
        { id: 'itemType', label: 'Type', minWidth: 100 },
        { id: 'itemDescription', label: 'Description', minWidth: 250 },
    ];

    const fetchItems = async () => {
        try {
            const response = await itemService.getAll();
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
        setFormData({ itemName: '', itemDescription: '', itemType: 'Character' });
        setOpenModal(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setFormData({
            itemName: item.itemName,
            itemDescription: item.itemDescription,
            itemType: item.itemType
        });
        setOpenModal(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await itemService.delete(item.itemId);
                fetchItems();
            } catch (error) {
                console.error('Failed to delete item', error);
            }
        }
    };

    const handleSave = async () => {
        try {
            if (currentItem) {
                await itemService.update(currentItem.itemId, formData);
            } else {
                await itemService.create(formData);
            }
            setOpenModal(false);
            fetchItems();
        } catch (error) {
            console.error('Failed to save item', error);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Items</Typography>
                <Button variant="contained" onClick={handleCreate}>Create Item</Button>
            </Box>
            <DataTable
                columns={columns}
                data={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Search items..."
            />

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{currentItem ? 'Edit Item' : 'Create Item'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={formData.itemName}
                        onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.itemDescription}
                        onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Type"
                        fullWidth
                        value={formData.itemType}
                        onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                    >
                        <MenuItem value="Character">Character</MenuItem>
                        <MenuItem value="Skin Shard">Skin Shard</MenuItem>
                        <MenuItem value="Gem">Gem</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ItemsPage;
