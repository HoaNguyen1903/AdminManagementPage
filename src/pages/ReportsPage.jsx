import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import DataTable from '../components/DataTable';
import { reportService, userService } from '../api/services';

const ReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);

    const columns = [
        { id: 'reportId', label: 'ID', minWidth: 50 },
        { id: 'senderName', label: 'Sender', minWidth: 150 },
        { id: 'accusedName', label: 'Accused', minWidth: 150 },
        { id: 'reason', label: 'Reason', minWidth: 200 },
        { id: 'status', label: 'Status', minWidth: 100 },
    ];

    const fetchData = async () => {
        try {
            const [reportsRes, usersRes] = await Promise.all([
                reportService.getAll(),
                userService.getAll()
            ]);

            const userMap = {};
            usersRes.data.forEach(user => {
                userMap[user.userId] = user.fullName;
            });
            setUsers(userMap);

            const enrichedReports = reportsRes.data.map(report => ({
                ...report,
                senderName: userMap[report.senderId] || report.senderId,
                accusedName: userMap[report.accusedId] || report.accusedId,
            }));
            setReports(enrichedReports);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleView = (report) => {
        setCurrentReport(report);
        setOpenDetails(true);
    };

    const handleApprove = async () => {
        if (!currentReport) return;
        try {
            await reportService.approve(currentReport.reportId);
            setOpenDetails(false);
            fetchData();
        } catch (error) {
            console.error('Failed to approve report', error);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>Reports</Typography>
            <DataTable
                columns={columns}
                data={reports}
                onView={handleView}
                searchPlaceholder="Search reports..."
            />

            {/* Details Modal */}
            <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Report Details</DialogTitle>
                <DialogContent>
                    {currentReport && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography><strong>ID:</strong> {currentReport.reportId}</Typography>
                            <Typography><strong>Sender:</strong> {users[currentReport.senderId] || currentReport.senderId}</Typography>
                            <Typography><strong>Accused:</strong> {users[currentReport.accusedId] || currentReport.accusedId}</Typography>
                            <Typography><strong>Reason:</strong> {currentReport.reason}</Typography>
                            <Typography><strong>Additional Info:</strong> {currentReport.additionalInfo}</Typography>
                            <Typography><strong>Date:</strong> {currentReport.sendDate}</Typography>
                            <Typography><strong>Status:</strong> {currentReport.status}</Typography>
                            {currentReport.approvedBy && (
                                <>
                                    <Typography><strong>Approved By:</strong> {users[currentReport.approvedBy] || currentReport.approvedBy}</Typography>
                                    <Typography><strong>Approved Date:</strong> {currentReport.approvedDate}</Typography>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetails(false)}>Close</Button>
                    {currentReport && currentReport.status !== 'Approved' && (
                        <Button variant="contained" color="primary" onClick={handleApprove}>
                            Approve
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportsPage;
