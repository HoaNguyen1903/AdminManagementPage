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
    const [currentItem, setCurrentItem] = useState(null);

    const [openDetail, setOpenDetail] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        itemName: '',
        itemDescription: '',
        itemType: 'Character',
        itemImageUrl: ''
    });

    const fetchItems = async () => {
        try {
            const res = await itemService.getAll();
            setItems(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

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
            itemImageUrl: ''
        });
        setOpenModal(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setFormData(item);
        setOpenModal(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm('Delete this item?')) {
            await itemService.delete(item.itemId);
            fetchItems();
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
            id: 'actions',
            label: 'Actions',
            width: 120,
            align: 'center',
            render: (row) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Detail">
                        <IconButton onClick={() => handleDetail(row)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(row)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Items</Typography>
                <Button variant="contained" onClick={handleCreate}>
                    Create Item
                </Button>
            </Box>

            <DataTable columns={columns} data={items} searchPlaceholder="Search items..." />

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