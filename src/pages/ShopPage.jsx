import React, { useEffect, useState, useMemo, useRef } from 'react';
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
    MenuItem,
    IconButton,
    Grid,
    Avatar,
    Divider,
    Tooltip,
    Chip,
    LinearProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Upload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';
import DataTable from '../components/DataTable';
import { shopService, itemService } from '../api/services';
import api from '../api/axiosConfig';

const ShopPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [currentEntity, setCurrentEntity] = useState(null);
    const [items, setItems] = useState([]);

    // Detail dialog state
    const [openDetail, setOpenDetail] = useState(false);
    const [detailEntity, setDetailEntity] = useState(null);

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
        quantity: 1,
        imageUrl: ''
    });

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Actions column — eye + edit + delete in same column (compact)
    const actionsColumn = {
        id: 'actions',
        label: 'Actions',
        minWidth: 140,
        render: (row) => (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end' }}>
                <Tooltip title="Detail">
                    <IconButton size="small" onClick={() => handleDetail(row)} aria-label="detail">
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Edit">
                    <IconButton size="small" color="primary" onClick={() => handleEdit(row)} aria-label="edit">
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(row)} aria-label="delete">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        )
    };

    const columnsMap = {
        0: [
            { id: 'gemBundleId', label: 'ID', minWidth: 50 },
            { id: 'bundleName', label: 'Bundle Name', minWidth: 200 },
            {
                id: 'imageUrl',
                label: 'Image',
                minWidth: 80,
                render: (row) => row.imageUrl ? (
                    <Box
                        component="img"
                        src={row.imageUrl}
                        alt={row.bundleName}
                        sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
                    />
                ) : null
            },
            { id: 'bundlePrice', label: 'Price', minWidth: 100 },
            {
                id: 'itemId',
                label: 'Item',
                minWidth: 150,
                render: (row) => itemMap[row.itemId] || `Item #${row.itemId}`
            },
            { id: 'quantity', label: 'Quantity', minWidth: 80 },
            actionsColumn,
        ],
        1: [
            { id: 'skinAndCharacterBundleId', label: 'ID', minWidth: 50 },
            { id: 'bundleName', label: 'Bundle Name', minWidth: 200 },
            {
                id: 'imageUrl',
                label: 'Image',
                minWidth: 80,
                render: (row) => row.imageUrl ? (
                    <Box
                        component="img"
                        src={row.imageUrl}
                        alt={row.bundleName}
                        sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }}
                    />
                ) : null
            },
            { id: 'bundlePrice', label: 'Price', minWidth: 100 },
            {
                id: 'itemId',
                label: 'Item',
                minWidth: 150,
                render: (row) => itemMap[row.itemId] || `Item #${row.itemId}`
            },
            { id: 'quantity', label: 'Quantity', minWidth: 80 },
            actionsColumn,
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
            quantity: 1,
            imageUrl: ''
        });
        setUploadError(null);
        setOpenModal(true);
    };

    const handleEdit = (entity) => {
        setCurrentEntity(entity);
        setFormData({
            bundleName: entity.bundleName,
            bundlePrice: entity.bundlePrice,
            itemId: entity.itemId || '',
            quantity: entity.quantity || 1,
            imageUrl: entity.imageUrl || ''
        });
        setUploadError(null);
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

    // Detail handler
    const handleDetail = (entity) => {
        setDetailEntity(entity);
        setOpenDetail(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                bundlePrice: parseFloat(formData.bundlePrice) || 0,
                itemId: formData.itemId === '' ? null : Number(formData.itemId),
                quantity: Number(formData.quantity) || 1,
                imageUrl: formData.imageUrl || null // 🔥 QUAN TRỌNG
            };

            if (tabValue === 0) {
                if (currentEntity)
                    await shopService.updateGemBundle(currentEntity.gemBundleId, payload);
                else
                    await shopService.createGemBundle(payload);
            } else {
                if (currentEntity)
                    await shopService.updateSkinBundle(currentEntity.skinAndCharacterBundleId, payload);
                else
                    await shopService.createSkinBundle(payload);
            }

            setOpenModal(false);
            fetchData(tabValue);

        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    // Upload file -> use backend upload API at /Upload/image (swagger shows POST /api/Upload/image)
    const uploadFile = async (file) => {
        if (!file) return;

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

            let imageUrl = null;

            if (typeof res.data === 'string') {
                imageUrl = res.data;
            } else if (res.data?.url) {
                imageUrl = res.data.url;
            } else if (res.data?.imageUrl) {
                imageUrl = res.data.imageUrl;
            }

            if (!imageUrl) {
                throw new Error('Backend did not return image URL');
            }

            setFormData(prev => ({
                ...prev,
                imageUrl: imageUrl
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
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError('Only image files are allowed');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File too large (max 5MB)');
            return;
        }

        uploadFile(file);
        e.target.value = null;
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    // Utility to return id label & value for entity (works for both bundle types)
    const getEntityIdInfo = (entity) => {
        if (!entity) return { idLabel: 'ID', idValue: null };
        if (entity.gemBundleId !== undefined) return { idLabel: 'GemBundleId', idValue: entity.gemBundleId };
        if (entity.skinAndCharacterBundleId !== undefined) return { idLabel: 'SkinAndCharacterBundleId', idValue: entity.skinAndCharacterBundleId };
        return { idLabel: 'ID', idValue: entity.id ?? null };
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
                    searchPlaceholder="Search shop data..."
                />
            )}

            {/* Create / Edit Dialog */}
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
                        onChange={(e) => setFormData({ ...formData, bundlePrice: e.target.value })}
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

                    {/* File upload UI */}
                    <Box sx={{ mt: 1 }}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={onFileChange}
                            style={{ display: 'none' }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<UploadIcon />}
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                disabled={uploading}
                            >
                                {formData.imageUrl ? 'Change Image' : 'Upload Image'}
                            </Button>

                            {formData.imageUrl && (
                                <Box
                                    component="img"
                                    src={formData.imageUrl}
                                    alt="preview"
                                    sx={{
                                        width: 160,
                                        height: 160,
                                        objectFit: 'contain',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            )}
                        </Box>

                        {uploading && <LinearProgress sx={{ mt: 1 }} />}

                        {uploadError && (
                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                                {uploadError}
                            </Typography>
                        )}

                        {/* preview */}
                        {formData.imageUrl && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    component="img"
                                    src={formData.imageUrl}
                                    alt="preview"
                                    sx={{ width: 160, height: 160, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={uploading}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Detail Dialog (clean professional layout matching edit popup style) */}
            <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Bundle Details</DialogTitle>
                <DialogContent>
                    {!detailEntity ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <Box sx={{ py: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {detailEntity.imageUrl ? (
                                        <Box
                                            component="img"
                                            src={detailEntity.imageUrl}
                                            alt={detailEntity.bundleName}
                                            sx={{ width: '100%', maxWidth: 220, height: 220, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                                        />
                                    ) : (
                                        <Avatar sx={{ width: 160, height: 160, bgcolor: 'background.default' }}>
                                            {detailEntity.bundleName ? detailEntity.bundleName[0].toUpperCase() : '?'}
                                        </Avatar>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={7}>
                                    <Typography variant="h6" sx={{ mb: 1 }}>{detailEntity.bundleName}</Typography>
                                    <Divider sx={{ mb: 1 }} />

                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">ID</Typography>
                                            <Typography variant="body2">
                                                {getEntityIdInfo(detailEntity).idValue}
                                            </Typography>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Price</Typography>
                                            <Typography variant="body2">
                                                {detailEntity.bundlePrice?.toLocaleString?.() ?? detailEntity.bundlePrice} VND
                                            </Typography>
                                        </Grid>

                                        <Grid item xs={12} sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary">Item</Typography>
                                            <Chip label={itemMap[detailEntity.itemId] || `Item #${detailEntity.itemId}`} size="small" sx={{ ml: 1 }} />
                                        </Grid>

                                        <Grid item xs={12} sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary">Quantity</Typography>
                                            <Typography variant="body2" sx={{ ml: 0.5, display: 'inline-block' }}>
                                                {detailEntity.quantity}
                                            </Typography>
                                        </Grid>

                                        {detailEntity.imageUrl && (
                                            <Grid item xs={12} sx={{ mt: 1 }}>
                                                <Typography variant="caption" color="text.secondary">Image URL</Typography>
                                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                    {detailEntity.imageUrl}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Grid>
                            </Grid>
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

export default ShopPage;