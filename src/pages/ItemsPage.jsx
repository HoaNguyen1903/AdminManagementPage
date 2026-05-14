import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Tooltip,
    Avatar,
    Chip,
    LinearProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Upload as UploadIcon
} from '@mui/icons-material';

import DataTable from '../components/DataTable';
import { itemService } from '../api/services';
import api from '../api/axiosConfig';

const ItemsPage = () => {
    const [items, setItems] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [associatedBundles, setAssociatedBundles] = useState({ skinAndCharacterBundles: [], gemBundles: [] });

    const [openDetail, setOpenDetail] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        itemName: '',
        itemDescription: '',
        itemType: 'Character',
        itemImageUrl: '',
        status: 'Available'
    });

    const [filters, setFilters] = useState({
        Search: '',
        ItemType: '',
        Status: 'Available'
    });

    const fetchItems = async () => {
        try {
            const queryParams = {
                Search: filters.Search || undefined,
                ItemType: filters.ItemType || undefined,
                Status: filters.Status || undefined
            };
            const res = await itemService.getAll(queryParams);
            setItems(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [filters]);

    // ===== Upload =====
    const uploadFile = async (file) => {
        setUploading(true);
        setUploadError(null);

        try {
            const fd = new FormData();
            fd.append('file', file);

            const res = await api.post('/Upload/image', fd, {
                headers: {
                    'Content-Type': undefined
                }
            });

            console.log("UPLOAD RESPONSE:", res.data);

            let itemImageUrl = null;

            if (typeof res.data === 'string') {
                itemImageUrl = res.data;
            } else if (res.data?.url) {
                itemImageUrl = res.data.url;
            } else if (res.data?.itemImageUrl) {
                itemImageUrl = res.data.itemImageUrl;
            }

            if (!itemImageUrl) {
                throw new Error('Backend did not return image URL');
            }

            setFormData(prev => ({
                ...prev,
                itemImageUrl: itemImageUrl
            }));

        } catch (err) {
            console.error("UPLOAD ERROR:", err);

            setUploadError(
                err?.response?.data?.message ||
                err?.response?.data ||
                err.message ||
                'Upload failed'
            );
        } finally {
            setUploading(false);
        }
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError('Only image allowed');
            return;
        }

        uploadFile(file);
    };

    // ===== Actions =====
    const handleCreate = () => {
        setCurrentItem(null);
        setFormData({
            itemName: '',
            itemDescription: '',
            itemType: 'Character',
            itemImageUrl: '',
            status: 'Available'
        });
        setOpenModal(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setFormData({
            ...item,
            status: item.status || 'Available'
        });
        setOpenModal(true);
    };

    const handleToggleStatus = async (row) => {
        if (row.status === 'Available') {
            // If making it Unavailable, show warning
            try {
                const res = await itemService.getAssociatedBundles(row.itemId);
                setAssociatedBundles(res.data);
                setCurrentItem(row);
                setOpenStatusModal(true);
            } catch (error) {
                console.error('Failed to fetch associated bundles', error);
            }
        } else {
            // If making it Available, just do it
            try {
                await itemService.updateStatus(row.itemId, 'Available');
                fetchItems();
            } catch (error) {
                console.error('Failed to update status', error);
            }
        }
    };

    const handleConfirmToggleStatus = async () => {
        try {
            await itemService.updateStatus(currentItem.itemId, 'Unavailable');
            setOpenStatusModal(false);
            fetchItems();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDelete = async (item) => {
        try {
            const res = await itemService.getAssociatedBundles(item.itemId);
            setAssociatedBundles(res.data);
            setCurrentItem(item);
            setFormData(item);
            setOpenDeleteModal(true);
        } catch (error) {
            console.error('Failed to fetch associated bundles', error);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await itemService.delete(currentItem.itemId);
            setOpenDeleteModal(false);
            fetchItems();
        } catch (error) {
            console.error('Failed to delete item', error);
        }
    };

    const handleDetail = (item) => {
        setDetailItem(item);
        setOpenDetail(true);
    };

    const handleSave = async () => {
        if (currentItem) {
            await itemService.update(currentItem.itemId, formData);
        } else {
            await itemService.create(formData);
        }
        setOpenModal(false);
        fetchItems();
    };

    // ===== Table =====
    const columns = [
        { id: 'itemId', label: 'ID', minWidth: 50 },
        { id: 'itemName', label: 'Name', minWidth: 150 },

        {
            id: 'itemImageUrl',
            label: 'Image',
            minWidth: 80,
            render: (row) =>
                row.itemImageUrl ? (
                    <Box
                        component="img"
                        src={row.itemImageUrl}
                        sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
                    />
                ) : null
        },

        { id: 'itemType', label: 'Type', minWidth: 100 },
        { id: 'itemDescription', label: 'Description', minWidth: 200 },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            render: (row) => (
                <Chip
                    label={row.status}
                    size="small"
                    color={row.status === 'Available' ? 'success' : 'default'}
                    onClick={() => handleToggleStatus(row)}
                    sx={{ cursor: 'pointer' }}
                />
            )
        }
    ];

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Items</Typography>
                <Button variant="contained" onClick={handleCreate}>
                    Create Item
                </Button>
            </Box>

            {/* Filter UI */}
            <Box sx={{
                mb: 3,
                p: 2,
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <TextField
                    size="small"
                    label="Search"
                    value={filters.Search}
                    onChange={(e) => handleFilterChange('Search', e.target.value)}
                    sx={{ width: 200 }}
                />
                <TextField
                    select
                    size="small"
                    label="Type"
                    value={filters.ItemType}
                    onChange={(e) => handleFilterChange('ItemType', e.target.value)}
                    sx={{ width: 150 }}
                >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="Character">Character</MenuItem>
                    <MenuItem value="Skin Shard">Skin Shard</MenuItem>
                    <MenuItem value="Gem">Gem</MenuItem>
                </TextField>
                <TextField
                    select
                    size="small"
                    label="Status"
                    value={filters.Status}
                    onChange={(e) => handleFilterChange('Status', e.target.value)}
                    sx={{ width: 120 }}
                >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Unavailable">Unavailable</MenuItem>

                </TextField>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setFilters({ Search: '', ItemType: '', Status: 'Available' })}
                >
                    Clear Filters
                </Button>
            </Box>

            <DataTable 
                columns={columns} 
                data={items} 
                onView={handleDetail}
                onEdit={handleEdit}
                onDelete={handleDelete}
                viewLabel="Detail"
                hideSearch 
            />

            {/* CREATE / EDIT */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>{currentItem ? 'Edit' : 'Create'} Item</DialogTitle>
                <DialogContent>

                    <TextField
                        fullWidth margin="dense"
                        label="Name"
                        value={formData.itemName}
                        onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    />

                    <TextField
                        fullWidth margin="dense"
                        label="Description"
                        value={formData.itemDescription}
                        onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                    />

                    <TextField
                        select fullWidth margin="dense"
                        label="Type"
                        value={formData.itemType}
                        onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                    >
                        <MenuItem value="Character">Character</MenuItem>
                        <MenuItem value="Skin Shard">Skin Shard</MenuItem>
                        <MenuItem value="Gem">Gem</MenuItem>
                    </TextField>

                    <TextField
                        select fullWidth margin="dense"
                        label="Status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <MenuItem value="Available">Available</MenuItem>
                        <MenuItem value="Unavailable">Unavailable</MenuItem>
                    </TextField>

                    {/* Upload */}
                    <Box mt={2}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            onChange={onFileChange}
                        />

                        <Button
                            startIcon={<UploadIcon />}
                            onClick={() => fileInputRef.current.click()}
                        >
                            Upload Image
                        </Button>

                        {uploading && <LinearProgress sx={{ mt: 1 }} />}

                        {uploadError && (
                            <Typography color="error">{uploadError}</Typography>
                        )}

                        {formData.itemImageUrl && (
                            <Box mt={2} textAlign="center">
                                <img
                                    src={formData.itemImageUrl}
                                    style={{ width: 120, height: 120, objectFit: 'contain' }}
                                />
                            </Box>
                        )}
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* DELETE CONFIRMATION */}
            <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'error.main' }}>Delete Item</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to delete this item? This action cannot be undone.
                    </Typography>

                    {(associatedBundles.skinAndCharacterBundles.length > 0 || associatedBundles.gemBundles.length > 0) && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1, color: 'error.contrastText' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                WARNING: Deleting this item will also disable the following bundles:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {associatedBundles.skinAndCharacterBundles.map(b => (
                                    <li key={`skin-${b.skinAndCharacterBundleId}`}>{b.bundleName} (Skin/Character)</li>
                                ))}
                                {associatedBundles.gemBundles.map(b => (
                                    <li key={`gem-${b.gemBundleId}`}>{b.bundleName} (Gem)</li>
                                ))}
                            </ul>
                        </Box>
                    )}

                    <TextField
                        fullWidth margin="dense"
                        label="Name"
                        value={formData.itemName}
                        InputProps={{ readOnly: true }}
                    />

                    <TextField
                        fullWidth margin="dense"
                        label="Description"
                        value={formData.itemDescription}
                        InputProps={{ readOnly: true }}
                    />

                    <TextField
                        fullWidth margin="dense"
                        label="Type"
                        value={formData.itemType}
                        InputProps={{ readOnly: true }}
                    />

                    <TextField
                        fullWidth margin="dense"
                        label="Status"
                        value={formData.status}
                        InputProps={{ readOnly: true }}
                    />

                    {formData.itemImageUrl && (
                        <Box mt={2} textAlign="center">
                            <img
                                src={formData.itemImageUrl}
                                style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* STATUS TOGGLE CONFIRMATION */}
            <Dialog open={openStatusModal} onClose={() => setOpenStatusModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'warning.main' }}>Disable Item</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to disable <strong>{currentItem?.itemName}</strong>?
                    </Typography>

                    {(associatedBundles.skinAndCharacterBundles.length > 0 || associatedBundles.gemBundles.length > 0) && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1, color: 'warning.contrastText' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Disabling this item will also disable the following bundles:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {associatedBundles.skinAndCharacterBundles.map(b => (
                                    <li key={`skin-status-${b.skinAndCharacterBundleId}`}>{b.bundleName} (Skin/Character)</li>
                                ))}
                                {associatedBundles.gemBundles.map(b => (
                                    <li key={`gem-status-${b.gemBundleId}`}>{b.bundleName} (Gem)</li>
                                ))}
                            </ul>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenStatusModal(false)}>Cancel</Button>
                    <Button onClick={handleConfirmToggleStatus} color="warning" variant="contained">Disable Everything</Button>
                </DialogActions>
            </Dialog>

            {/* DETAIL */}
            <Dialog open={openDetail} onClose={() => setOpenDetail(false)}>
                <DialogContent>
                    {detailItem && (
                        <Box textAlign="center">

                            {detailItem.itemImageUrl ? (
                                <img
                                    src={detailItem.itemImageUrl}
                                    style={{ width: 160, height: 160 }}
                                />
                            ) : (
                                <Avatar sx={{ width: 120, height: 120, margin: 'auto' }}>
                                    {detailItem.itemName[0]}
                                </Avatar>
                            )}

                            <Typography variant="h5">{detailItem.itemName}</Typography>

                            <Typography>{detailItem.itemType}</Typography>

                            <Typography color="text.secondary">
                                {detailItem.itemDescription}
                            </Typography>

                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetail(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ItemsPage;