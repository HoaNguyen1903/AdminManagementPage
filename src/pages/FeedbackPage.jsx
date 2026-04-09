import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import DataTable from '../components/DataTable';
import { feedbackService } from '../api/services';

const FeedbackPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const columnsMap = {
        0: [
            { id: 'notificationId', label: 'ID', minWidth: 50 },
            { id: 'notificationMessage', label: 'Message', minWidth: 250 },
            { id: 'receiverId', label: 'Receiver ID', minWidth: 100 },
            { id: 'read', label: 'Read', minWidth: 80, format: (v) => v ? 'Yes' : 'No' },
        ],
        1: [
            { id: 'reportId', label: 'ID', minWidth: 50 },
            { id: 'senderId', label: 'Sender ID', minWidth: 100 },
            { id: 'accusedId', label: 'Accused ID', minWidth: 100 },
            { id: 'reason', label: 'Reason', minWidth: 200 },
            { id: 'sendDate', label: 'Date', minWidth: 150 },
            { id: 'approved', label: 'Approved', minWidth: 100, format: (v) => v ? 'Yes' : 'No' },
        ]
    };

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            let res;
            if (tab === 0) res = await feedbackService.getNotifications();
            else res = await feedbackService.getReports();
            setData(res.data);
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
                    disableActions
                    searchPlaceholder="Search feedback..."
                />
            )}
        </Box>
    );
};

export default FeedbackPage;
