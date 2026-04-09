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
import { announcementService } from '../api/services';

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'General',
        status: 'Active',
        startDate: '',
        endDate: ''
    });

    const columns = [
        { id: 'announcementId', label: 'ID', minWidth: 50 },
        { id: 'title', label: 'Title', minWidth: 150 },
        { id: 'type', label: 'Type', minWidth: 100 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'startDate', label: 'Start Date', minWidth: 150 },
        { id: 'endDate', label: 'End Date', minWidth: 150 },
    ];

    const fetchAnnouncements = async () => {
        try {
            const response = await announcementService.getAll();
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Failed to fetch announcements', error);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

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

    const handleDelete = async (announcement) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await announcementService.delete(announcement.announcementId);
                fetchAnnouncements();
            } catch (error) {
                console.error('Failed to delete announcement', error);
            }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4">Announcements</Typography>
                <Button variant="contained" onClick={handleCreate}>Create Announcement</Button>
            </Box>
            <DataTable
                columns={columns}
                data={announcements}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Search announcements..."
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
        </Box>
    );
};

export default AnnouncementsPage;
