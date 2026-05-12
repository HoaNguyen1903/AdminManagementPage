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
import PageHeader from '../components/PageHeader';
import { announcementService } from '../api/services';

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'General',
        status: 'Active',
        startDate: '',
        endDate: ''
    });

    const [filters, setFilters] = useState({
        Search: '',
        Type: '',
        Status: '',
        StartDate: '',
        EndDate: ''
    });

    const columns = [
        { id: 'announcementId', label: 'ID', minWidth: 50 },
        { id: 'title', label: 'Title', minWidth: 150 },
        { id: 'type', label: 'Type', minWidth: 100 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'startDate', label: 'Start Date', minWidth: 150, format: (v) => v ? new Date(v).toLocaleString() : 'N/A' },
        { id: 'endDate', label: 'End Date', minWidth: 150, format: (v) => v ? new Date(v).toLocaleString() : 'N/A' },
    ];

    const fetchAnnouncements = async () => {
        try {
            const queryParams = {
                Search: filters.Search || undefined,
                Type: filters.Type || undefined,
                Status: filters.Status || undefined,
                StartDate: filters.StartDate || undefined,
                EndDate: filters.EndDate || undefined
            };
            const response = await announcementService.getAll(queryParams);
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Failed to fetch announcements', error);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreate = () => {
        setCurrentAnnouncement(null);
        setFormData({
            title: '',
            content: '',
            type: 'General',
            status: 'Active',
            startDate: '',
            endDate: ''
        });
        setOpenModal(true);
    };

    const handleEdit = (announcement) => {
        setCurrentAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            status: announcement.status,
            startDate: announcement.startDate.split('T')[0],
            endDate: announcement.endDate.split('T')[0]
        });
        setOpenModal(true);
    };

    const handleDelete = (announcement) => {
        setCurrentAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            status: announcement.status,
            startDate: announcement.startDate.split('T')[0],
            endDate: announcement.endDate.split('T')[0]
        });
        setOpenDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await announcementService.delete(currentAnnouncement.announcementId);
            setOpenDeleteModal(false);
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to delete announcement', error);
        }
    };

    const handleSave = async () => {
        try {
            if (currentAnnouncement) {
                await announcementService.update(currentAnnouncement.announcementId, formData);
            } else {
                await announcementService.create(formData);
            }
            setOpenModal(false);
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to save announcement', error);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <PageHeader 
                title="Announcements" 
                subtitle="Manage game news and announcements for your players"
                actionLabel="Create Announcement"
                onAction={handleCreate}
                breadcrumbs={[{ label: 'Announcements' }]}
            />

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
                    value={filters.Type}
                    onChange={(e) => handleFilterChange('Type', e.target.value)}
                    sx={{ width: 150 }}
                >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Event">Event</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
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
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
                <TextField
                    size="small"
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={filters.StartDate}
                    onChange={(e) => handleFilterChange('StartDate', e.target.value)}
                    sx={{ width: 160 }}
                />
                <TextField
                    size="small"
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={filters.EndDate}
                    onChange={(e) => handleFilterChange('EndDate', e.target.value)}
                    sx={{ width: 160 }}
                />
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => setFilters({ Search: '', Type: '', Status: '', StartDate: '', EndDate: '' })}
                >
                    Clear Filters
                </Button>
            </Box>

            <DataTable
                columns={columns}
                data={announcements}
                onEdit={handleEdit}
                onDelete={handleDelete}
                hideSearch
            />

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{currentAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Content"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Type"
                        fullWidth
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="Event">Event</MenuItem>
                        <MenuItem value="Maintenance">Maintenance</MenuItem>
                    </TextField>
                    <TextField
                        select
                        margin="dense"
                        label="Status"
                        fullWidth
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </TextField>
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

            <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'error.main' }}>Delete Announcement</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to delete this announcement? This action cannot be undone.
                    </Typography>
                    <TextField
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={formData.title}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Content"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.content}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Type"
                        fullWidth
                        value={formData.type}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Status"
                        fullWidth
                        value={formData.status}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Start Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.startDate}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="dense"
                        label="End Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.endDate}
                        InputProps={{ readOnly: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AnnouncementsPage;
