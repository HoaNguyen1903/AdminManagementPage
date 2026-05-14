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
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
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
        imageUrl: '',
        status: 'Available'
    });

    const [filters, setFilters] = useState({
        Search: '',
        MinPrice: '',
        MaxPrice: '',
        Status: 'Available',
        ItemId: ''
    });

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const statusColumn = {
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
            statusColumn,
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
            statusColumn,
        ]
    };

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            const queryParams = {
                Search: filters.Search || undefined,
                MinPrice: filters.MinPrice || undefined,
                MaxPrice: filters.MaxPrice || undefined,
                Status: filters.Status || undefined,
                ItemId: filters.ItemId || undefined
            };
            
            let res;
            if (tab === 0) res = await shopService.getGemBundles(queryParams);
            else res = await shopService.getSkinBundles(queryParams);
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch shop data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (row) => {
        try {
            const newStatus = row.status === 'Available' ? 'Unavailable' : 'Available';
            if (tabValue === 0) {
                await shopService.updateGemBundleStatus(row.gemBundleId, newStatus);
            } else {
                await shopService.updateSkinBundleStatus(row.skinAndCharacterBundleId, newStatus);
            }
            fetchData(tabValue);
        } catch (error) {
            console.error('Failed to update status', error);
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
    }, [tabValue, filters]);

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreate = () => {
        setCurrentEntity(null);
        setFormData({
            bundleName: '',
            bundlePrice: 0,
            skinAndCharacterBundleId: '',
            itemId: '',
            quantity: 1,
            imageUrl: '',
            status: 'Available'
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
            imageUrl: entity.imageUrl || '',
            status: entity.status || 'Available'
        });
        setUploadError(null);
        setOpenModal(true);
    };

    const handleDelete = (entity) => {
        setCurrentEntity(entity);
        setFormData({
            bundleName: entity.bundleName,
            bundlePrice: entity.bundlePrice,
            itemId: entity.itemId || '',
            quantity: entity.quantity || 1,
            imageUrl: entity.imageUrl || ''
        });
        setOpenDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (tabValue === 0) await shopService.deleteGemBundle(currentEntity.gemBundleId);
            else await shopService.deleteSkinBundle(currentEntity.skinAndCharacterBundleId);
            setOpenDeleteModal(false);
            fetchData(tabValue);
        } catch (error) {
            console.error('Failed to delete', error);
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
                imageUrl: formData.imageUrl || null
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

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
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
                    size="small"
                    label="Min Price"
                    type="number"
                    value={filters.MinPrice}
                    onChange={(e) => handleFilterChange('MinPrice', e.target.value)}
                    sx={{ width: 120 }}
                />
                <TextField
                    size="small"
                    label="Max Price"
                    type="number"
                    value={filters.MaxPrice}
                    onChange={(e) => handleFilterChange('MaxPrice', e.target.value)}
                    sx={{ width: 120 }}
                />
                <TextField
                    select
                    size="small"
                    label="Item"
                    value={filters.ItemId}
                    onChange={(e) => handleFilterChange('ItemId', e.target.value)}
                    sx={{ width: 150 }}
                >
                    <MenuItem value="">All Items</MenuItem>
                    {items.map(item => (
                        <MenuItem key={item.itemId} value={item.itemId}>
                            {item.itemName}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    size="small"
                    label="Status"
                    value={filters.Status}
                    onChange={(e) => handleFilterChange('Status', e.target.value)}
                    sx={{ width: 120 }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Unavailable">Unavailable</MenuItem>
                </TextField>
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => setFilters({ Search: '', MinPrice: '', MaxPrice: '', Status: 'Available', ItemId: '' })}
                >
                    Clear Filters
                </Button>
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
                    onView={handleDetail}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    viewLabel="Detail"
                    hideSearch // We are using our own filter UI
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

                    <TextField
                        select
                        margin="dense"
                        label="Status"
                        fullWidth
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <MenuItem value="Available">Available</MenuItem>
                        <MenuItem value="Unavailable">Unavailable</MenuItem>
                    </TextField>

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
                                <Typography
                                    variant="body2"
                                    sx={{
                                        maxWidth: 200,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {formData.imageUrl.split('/').pop()}
                                </Typography>
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'error.main' }}>
                    Delete {tabValue === 0 ? 'Gem Bundle' : 'Skin Bundle'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to delete this bundle? This action cannot be undone.
                    </Typography>
                    <TextField
                        margin="dense"
                        label="Bundle Name"
                        fullWidth
                        value={formData.bundleName}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Price"
                        type="number"
                        fullWidth
                        value={formData.bundlePrice}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Item"
                        fullWidth
                        value={itemMap[formData.itemId] || (formData.itemId ? `Item #${formData.itemId}` : 'None')}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Quantity"
                        type="number"
                        fullWidth
                        value={formData.quantity}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Status"
                        fullWidth
                        value={formData.status}
                        InputProps={{ readOnly: true }}
                    />

                    {formData.imageUrl && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Box
                                component="img"
                                src={formData.imageUrl}
                                alt="preview"
                                sx={{ width: 160, height: 160, objectFit: 'contain', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
                <DialogContent sx={{ p: 3 }}>
                    {!detailEntity ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <Box>
                            {/* IMAGE */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.04)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                    }}
                                >
                                    {detailEntity.imageUrl ? (
                                        <Box
                                            component="img"
                                            src={detailEntity.imageUrl}
                                            alt={detailEntity.bundleName}
                                            sx={{
                                                width: 180,
                                                height: 180,
                                                objectFit: 'contain',
                                            }}
                                        />
                                    ) : (
                                        <Avatar sx={{ width: 160, height: 160 }}>
                                            {detailEntity.bundleName?.[0]?.toUpperCase() || '?'}
                                        </Avatar>
                                    )}
                                </Box>
                            </Box>

                            {/* TITLE */}
                            <Typography
                                variant="h5"
                                align="center"
                                sx={{
                                    fontWeight: 700,
                                    mb: 1,
                                    background: 'linear-gradient(90deg, #a18cd1, #fbc2eb)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                {detailEntity.bundleName}
                            </Typography>


                            {/* PRICE */}
                            <Typography
                                align="center"
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: '#FFD700',
                                    mb: 3
                                }}
                            >
                                {detailEntity.bundlePrice?.toLocaleString?.()} VND
                            </Typography>

                            <Divider sx={{ mb: 3 }} />

                                <Grid container spacing={2} justifyContent="space-between">
                                    {/* ID */}
                                    <Grid item xs={4} textAlign="center">
                                        <Typography variant="caption" color="text.secondary">
                                            ID
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            {getEntityIdInfo(detailEntity).idValue}
                                        </Typography>
                                    </Grid>

                                    {/* QUANTITY */}
                                    <Grid item xs={4} textAlign="center">
                                        <Typography variant="caption" color="text.secondary">
                                            Quantity
                                        </Typography>
                                        <Typography fontWeight={600}>
                                            x{detailEntity.quantity}
                                        </Typography>
                                    </Grid>

                                    {/* ITEM */}
                                    <Grid item xs={4} textAlign="center">
                                        <Typography variant="caption" color="text.secondary">
                                            Item
                                        </Typography>
                                        <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'center' }}>
                                            <Chip
                                                label={itemMap[detailEntity.itemId] || `Item #${detailEntity.itemId}`}
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setOpenDetail(false)}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ShopPage;