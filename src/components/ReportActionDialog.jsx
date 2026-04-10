import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    Box,
    CircularProgress
} from '@mui/material';
import { userService } from '../api/services';
import DataTable from './DataTable';

const ReportActionDialog = ({ open, onClose, report, onActionSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [banLogs, setBanLogs] = useState([]); // Placeholder for ban logs
    const [showBanLogs, setShowBanLogs] = useState(false);
    const [banType, setBanType] = useState('period'); // 'period' or 'until'
    const [banDuration, setBanDuration] = useState({ months: 0, weeks: 0, days: 0 });
    const [banUntilDate, setBanUntilDate] = useState('');
    const [banReason, setBanReason] = useState('');

    useEffect(() => {
        if (open && report) {
            setLoading(true);
            setUserData(null);
            setBanLogs([]);
            setShowBanLogs(false);
            setBanType('period');
            setBanDuration({ months: 0, weeks: 0, days: 0 });
            setBanUntilDate('');
            setBanReason('');

            const fetchUserData = async () => {
                try {
                    const userRes = await userService.getById(report.accusedId);
                    setUserData(userRes.data);
                    console.log('User data fetched:', userRes.data);

                    const logsRes = await userService.getBanLogs(report.accusedId);
                    console.log('Ban logs API response:', logsRes);
                    console.log('Ban logs data:', logsRes.data);
                    const formattedBanLogs = logsRes.data.map((log) => ({
                        ...log,
                        banDate: log.bannedDate,
                        reason: log.banReason,
                    }));
                    setBanLogs(formattedBanLogs);
                } catch (error) {
                    console.error('Failed to fetch user data or ban logs', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        }
    }, [open, report]);

    const handleBan = async () => {
        if (!report || !userData || !banReason) return;

        let bannedUntil = null;
        if (banType === 'period') {
            const now = new Date();
            now.setMonth(now.getMonth() + banDuration.months);
            now.setDate(now.getDate() + (banDuration.weeks * 7) + banDuration.days);
            bannedUntil = now.toISOString();
        } else if (banType === 'until' && banUntilDate) {
            bannedUntil = new Date(banUntilDate).toISOString();
        }

        try {
            setLoading(true);
            await userService.ban(userData.userId, { banReason, bannedUntil });
            onActionSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to ban user', error);
        } finally {
            setLoading(false);
        }
    };

    const banLogColumns = [
        { id: 'banDate', label: 'Ban Date', minWidth: 150 },
        { id: 'reason', label: 'Reason', minWidth: 200 },
        { id: 'bannedUntil', label: 'Banned Until', minWidth: 150 },
        { id: 'staff', label: 'Staff', minWidth: 120, render: (row) => row.staffName || row.staffId || '—' },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Take Action on Report #{report?.reportId}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    report && userData && (
                        <Box>
                            <Typography variant="h6">Accused User Details:</Typography>
                            <Typography><strong>ID:</strong> {userData.userId}</Typography>
                            <Typography><strong>Email:</strong> {userData.email}</Typography>
                            <Typography><strong>Full Name:</strong> {userData.firstName} {userData.lastName}</Typography>
                            <Button onClick={() => setShowBanLogs(!showBanLogs)} sx={{ mt: 1 }}>
                                {showBanLogs ? 'Hide Ban Logs' : 'Show Ban Logs'}
                            </Button>

                            {showBanLogs && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h6">Ban Logs:</Typography>
                                    {banLogs.length > 0 ? (
                                        <DataTable
                                            columns={banLogColumns}
                                            data={banLogs}
                                            disableActions
                                            searchPlaceholder="Search ban logs..."
                                        />
                                    ) : (
                                        <Typography>No ban logs found for this user.</Typography>
                                    )}
                                </Box>
                            )}

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6">Ban User:</Typography>
                                <TextField
                                    margin="dense"
                                    label="Ban Reason"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                />

                                <FormControl component="fieldset" sx={{ mt: 2 }}>
                                    <FormLabel component="legend">Ban Duration</FormLabel>
                                    <RadioGroup
                                        row
                                        value={banType}
                                        onChange={(e) => setBanType(e.target.value)}
                                    >
                                        <FormControlLabel value="period" control={<Radio />} label="For a period" />
                                        <FormControlLabel value="until" control={<Radio />} label="Until a specific date" />
                                    </RadioGroup>
                                </FormControl>

                                {banType === 'period' ? (
                                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                        <TextField
                                            label="Months"
                                            type="number"
                                            value={banDuration.months}
                                            onChange={(e) => setBanDuration({ ...banDuration, months: parseInt(e.target.value) || 0 })}
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 100 }}
                                        />
                                        <TextField
                                            label="Weeks"
                                            type="number"
                                            value={banDuration.weeks}
                                            onChange={(e) => setBanDuration({ ...banDuration, weeks: parseInt(e.target.value) || 0 })}
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 100 }}
                                        />
                                        <TextField
                                            label="Days"
                                            type="number"
                                            value={banDuration.days}
                                            onChange={(e) => setBanDuration({ ...banDuration, days: parseInt(e.target.value) || 0 })}
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 100 }}
                                        />
                                    </Box>
                                ) : (
                                    <TextField
                                        margin="dense"
                                        label="Ban Until Date"
                                        type="datetime-local"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={banUntilDate}
                                        onChange={(e) => setBanUntilDate(e.target.value)}
                                        sx={{ mt: 1 }}
                                    />
                                )}
                            </Box>
                        </Box>
                    )
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleBan} variant="contained" color="error" disabled={loading || !banReason}>
                    Ban User
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReportActionDialog;
