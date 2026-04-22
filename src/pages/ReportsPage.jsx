import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, CircularProgress, Button, Chip } from '@mui/material';
import ReportActionDialog from '../components/ReportActionDialog';
import DataTable from '../components/DataTable';
import { feedbackService, userService } from '../api/services';

const ReportsPage = () => {
    const [reports, setReports] = useState([]);
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

    const columns = [
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
        { id: 'sendDate', label: 'Date', minWidth: 150, format: (v) => v ? new Date(v).toLocaleString() : 'N/A' },
        { id: 'approved', label: 'Approved', minWidth: 100, format: (v) => v ? 'Yes' : 'No' },
        {
            id: 'actions',
            label: 'Actions',
            minWidth: 120,
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
    ];

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [reportsRes, usersRes] = await Promise.all([
                feedbackService.getReports(),
                userService.getAll()
            ]);
            setReports(reportsRes.data || []);
            setUsers(usersRes.data || []);
        } catch (error) {
            console.error('Failed to fetch reports data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Reports</Typography>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <DataTable
                    columns={columns}
                    data={reports}
                    disableActions={true} 
                    searchPlaceholder="Search reports..."
                />
            )}

            <ReportActionDialog
                open={openReportActionDialog}
                onClose={() => setOpenReportActionDialog(false)}
                report={selectedReport}
                onActionSuccess={() => fetchReports()} 
            />
        </Box>
    );
};

export default ReportsPage;
