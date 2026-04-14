import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress, Button, IconButton, Chip } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ReportActionDialog from '../components/ReportActionDialog';
import DataTable from '../components/DataTable';
import { feedbackService, userService } from '../api/services';

const FeedbackPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openReportActionDialog, setOpenReportActionDialog] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const userMap = useMemo(() => {
        const map = {};
        users.forEach(u => {
            map[u.userId] = `${u.firstName} ${u.lastName}`;
        });
        return map;
    }, [users]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const columnsMap = {
        0: [
            { id: 'notificationId', label: 'ID', minWidth: 50 },
            { id: 'notificationMessage', label: 'Message', minWidth: 250 },
            { id: 'receiverId', label: 'Receiver ID', minWidth: 100 },
            { id: 'read', label: 'Read', minWidth: 80, format: (v) => v ? 'Yes' : 'No' },
            {
                id: 'actions',
                label: '',
                minWidth: 100,
                render: (row) => (
                    <Button
                        variant="contained"
                        color={row.read ? 'warning' : 'primary'}
                        size="small"
                        onClick={async () => {
                            try {
                                if (row.read) await feedbackService.markUnread(row.notificationId);
                                else await feedbackService.markRead(row.notificationId);
                                fetchData(0); // Refresh notifications
                            } catch (e) {
                                console.error('Action failed', e);
                            }
                        }}
                    >
                        {row.read ? 'Mark Unread' : 'Mark Read'}
                    </Button>
                )
            },
        ],
        1: [
            { id: 'reportId', label: 'ID', minWidth: 50 },
            { 
                id: 'senderId', 
                label: 'Sender', 
                minWidth: 150,
                render: (row) => (
                    <Chip 
                        label={userMap[row.senderId] || 'Unknown'} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                    />
                )
            },
            { 
                id: 'accusedId', 
                label: 'Accused', 
                minWidth: 150,
                render: (row) => (
                    <Chip 
                        label={userMap[row.accusedId] || 'Unknown'} 
                        size="small" 
                        variant="outlined"
                        color="error"
                    />
                )
            },
            { id: 'reason', label: 'Reason', minWidth: 200 },
            { id: 'sendDate', label: 'Date', minWidth: 150 },
            { id: 'approved', label: 'Approved', minWidth: 100, format: (v) => v ? 'Yes' : 'No' },
            {
                id: 'actions',
                label: '',
                minWidth: 100,
                render: (row) => (
                    !row.approved ? (
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => {
                                setSelectedReport(row);
                                setOpenReportActionDialog(true);
                            }}
                        >
                            Take Action
                        </Button>
                    ) : (
                        <Typography variant="body2" color="textSecondary">Approved</Typography>
                    )
                )
            }
        ]
    };

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            const [feedbackRes, usersRes] = await Promise.all([
                tab === 0 ? feedbackService.getNotifications() : feedbackService.getReports(),
                userService.getAll()
            ]);
            setData(feedbackRes.data);
            setUsers(usersRes.data || []);
        } catch (error) {
            console.error('Failed to fetch feedback data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(tabValue);
    }, [tabValue]);

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Feedback</Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="feedback tabs">
                    <Tab label="Notifications" />
                    <Tab label="Reports" />
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
                    disableActions={true} // Use custom render columns for actions
                    searchPlaceholder="Search feedback..."
                />
            )}

            <ReportActionDialog
                open={openReportActionDialog}
                onClose={() => setOpenReportActionDialog(false)}
                report={selectedReport}
                onActionSuccess={() => fetchData(1)} // Refresh reports after action
            />
        </Box>
    );
};

export default FeedbackPage;
