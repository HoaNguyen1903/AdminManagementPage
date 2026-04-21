import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Button,
    Typography,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    MenuItem
} from '@mui/material';
import DataTable from '../components/DataTable';
import { shopService, itemService } from '../api/services';

const ShopPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [currentEntity, setCurrentEntity] = useState(null);
    const [items, setItems] = useState([]);

    const itemMap = useMemo(() => {
        const map = {};
        items.forEach(item => {
            map[item.itemId] = item.itemName;
        });
        return map;
    }, [items]);
    
    const [formData, setFormData] = useState({
        bundleName: '',
        bundlePrice: 0,
        skinAndCharacterBundleId: '',
        itemId: '',
        quantity: 1
    });

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const columnsMap = {
        0: [
            { id: 'gemBundleId', label: 'ID', minWidth: 50 },
            { id: 'bundleName', label: 'Bundle Name', minWidth: 200 },
            { id: 'bundlePrice', label: 'Price', minWidth: 100 },
            { 
                id: 'itemId', 
                label: 'Item', 
                minWidth: 150,
                render: (row) => itemMap[row.itemId] || `Item #${row.itemId}`
            },
            { id: 'quantity', label: 'Quantity', minWidth: 80 },
        ],
        1: [
            { id: 'skinAndCharacterBundleId', label: 'ID', minWidth: 50 },
            { id: 'bundleName', label: 'Bundle Name', minWidth: 200 },
            { id: 'bundlePrice', label: 'Price', minWidth: 100 },
            { 
                id: 'itemId', 
                label: 'Item', 
                minWidth: 150,
                render: (row) => itemMap[row.itemId] || `Item #${row.itemId}`
            },
            { id: 'quantity', label: 'Quantity', minWidth: 80 },
        ]
    };

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            let res;
            if (tab === 0) res = await shopService.getGemBundles();
            else res = await shopService.getSkinBundles();
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch shop data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async () => {
        try {
            const res = await itemService.getAll();
            setItems(res.data);
        } catch (error) {
            console.error('Failed to fetch items', error);
        }
    };

    useEffect(() => {
        fetchData(tabValue);
        fetchItems();
    }, [tabValue]);

    const handleCreate = () => {
        setCurrentEntity(null);
        setFormData({
            bundleName: '',
            bundlePrice: 0,
            skinAndCharacterBundleId: '',
            itemId: '',
            quantity: 1
        });
        setOpenModal(true);
    };

    const handleEdit = (entity) => {
        setCurrentEntity(entity);
        setFormData({
            bundleName: entity.bundleName,
            bundlePrice: entity.bundlePrice,
            itemId: entity.itemId || '',
            quantity: entity.quantity || 1
        });
        setOpenModal(true);
    };

    const handleDelete = async (entity) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                if (tabValue === 0) await shopService.deleteGemBundle(entity.gemBundleId);
                else await shopService.deleteSkinBundle(entity.skinAndCharacterBundleId);
                fetchData(tabValue);
            } catch (error) {
                console.error('Failed to delete', error);
            }
        }
    };

    const handleSave = async () => {
        try {
            if (tabValue === 0) {
                if (currentEntity) await shopService.updateGemBundle(currentEntity.gemBundleId, formData);
                else await shopService.createGemBundle(formData);
            } else {
                if (currentEntity) await shopService.updateSkinBundle(currentEntity.skinAndCharacterBundleId, formData);
                else await shopService.createSkinBundle(formData);
            }
            setOpenModal(false);
            fetchData(tabValue);
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Shop</Typography>
                <Button variant="contained" onClick={handleCreate}>Create Entry</Button>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="shop tabs">
                    <Tab label="Gem Bundles" />
                    <Tab label="Skin/Character Bundles" />
                </Tabs>
            </Box>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <DataTable
                    columns={columnsMap[tabValue]}
                    data={data}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchPlaceholder="Search shop data..."
                />
            )}

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentEntity ? 'Edit' : 'Create'} {tabValue === 0 ? 'Gem Bundle' : 'Skin Bundle'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Bundle Name"
                        fullWidth
                        value={formData.bundleName}
                        onChange={(e) => setFormData({ ...formData, bundleName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Price"
                        type="number"
                        fullWidth
                        value={formData.bundlePrice}
                        onChange={(e) => setFormData({ ...formData, bundlePrice: parseFloat(e.target.value) })}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Item"
                        fullWidth
                        value={formData.itemId}
                        onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                    >
                        {items.map(item => (
                            <MenuItem key={item.itemId} value={item.itemId}>
                                {item.itemName}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Quantity"
                        type="number"
                        fullWidth
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
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

export default ShopPage;
