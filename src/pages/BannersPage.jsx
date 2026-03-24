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
import { bannerService, bannerItemService, gameItemService } from '../api/services';

const BannersPage = () => {
    const [banners, setBanners] = useState([]);
    const [itemMap, setItemMap] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(null);
    const [bannerItems, setBannerItems] = useState([]);
    const [formData, setFormData] = useState({
        bannerImage: '',
        startDate: '',
        endDate: ''
    });

    const columns = [
        { id: 'bannerId', label: 'ID', minWidth: 50 },
        { id: 'bannerImage', label: 'Image', minWidth: 100 },
        { id: 'startDate', label: 'Start Date', minWidth: 100 },
        { id: 'endDate', label: 'End Date', minWidth: 100 },
    ];

    const fetchBanners = async () => {
        try {
            const response = await bannerService.getAll();
            setBanners(response.data);
        } catch (error) {
            console.error('Failed to fetch banners', error);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleCreate = () => {
        setCurrentBanner(null);
        setFormData({ bannerImage: '', startDate: '', endDate: '' });
        setOpenModal(true);
    };

    const handleEdit = (banner) => {
        setCurrentBanner(banner);
        setFormData({
            bannerImage: banner.bannerImage,
            startDate: banner.startDate,
            endDate: banner.endDate
        });
        setOpenModal(true);
    };

    const handleDelete = async (banner) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await bannerService.delete(banner.bannerId);
                fetchBanners();
            } catch (error) {
                console.error('Failed to delete banner', error);
            }
        }
    };

    const handleView = async (banner) => {
        setCurrentBanner(banner);
        try {
            const response = await bannerItemService.getAll();
            const allItems = await gameItemService.getAll();
            
            console.log('Banner Items:', response.data);
            console.log('All Items:', allItems.data);

            // Create a map of itemId -> name for quick lookup
            const itemMap = {};
            allItems.data.forEach(item => {
                itemMap[item.itemId] = item.name; // Changed from item.itemName to item.name
            });

            console.log('Item Map:', itemMap);

            const items = response.data
                .filter(item => item.bannerId === banner.bannerId)
                .map(item => ({
                    ...item,
                    itemName: itemMap[item.itemId] || 'Unknown'
                }));
            
            console.log('Mapped items:', items);
            setBannerItems(items);
            setOpenDetails(true);
        } catch (error) {
            console.error('Failed to fetch banner items', error);
        }
    };

    const handleSave = async () => {
        try {
            if (currentBanner) {
                await bannerService.update(currentBanner.bannerId, formData);
            } else {
                await bannerService.create(formData);
            }
            setOpenModal(false);
            fetchBanners();
        } catch (error) {
            console.error('Failed to save banner', error);
        }
    };

    const bannerItemColumns = [
        { id: 'itemId', label: 'Item ID', minWidth: 50 },
        { id: 'itemName', label: 'Item Name', minWidth: 150 },
        { id: 'rateIncreaseValue', label: 'Rate Increase', minWidth: 100 },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Banners</Typography>
                <Button variant="contained" onClick={handleCreate}>Create Banner</Button>
            </Box>
            <DataTable
                columns={columns}
                data={banners}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Search banners..."
            />

            {/* Create/Edit Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>{currentBanner ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Image URL"
                        fullWidth
                        value={formData.bannerImage}
                        onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Start Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="End Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Details Modal */}
            <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
                <DialogTitle>Banner Details</DialogTitle>
                <DialogContent>
                    {currentBanner && (
                        <Box sx={{ mb: 2 }}>
                            <Typography><strong>ID:</strong> {currentBanner.bannerId}</Typography>
                            <Typography><strong>Image:</strong> {currentBanner.bannerImage}</Typography>
                            <Typography><strong>Start Date:</strong> {currentBanner.startDate}</Typography>
                            <Typography><strong>End Date:</strong> {currentBanner.endDate}</Typography>
                        </Box>
                    )}
                    <Typography variant="h6" sx={{ mt: 2 }}>Banner Items</Typography>
                    <DataTable
                        columns={bannerItemColumns}
                        data={bannerItems}
                        disableActions
                        searchPlaceholder="Search items..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetails(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BannersPage;
