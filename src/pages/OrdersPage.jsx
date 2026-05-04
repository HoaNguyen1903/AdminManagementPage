import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tabs,
    Tab,
    CircularProgress,
    Chip,
    Grid,
    Divider,
    Link,
    TextField,
    MenuItem
} from '@mui/material';
import DataTable from '../components/DataTable';
import { userService, orderService } from '../api/services';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [fullOrderInfo, setFullOrderInfo] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Search and filter states
    const [usernameSearch, setUsernameSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            case 'expired': return 'default';
            default: return 'primary';
        }
    };

    // Create lookup map for user names
    const userMap = useMemo(() => {
        const map = {};
        users.forEach(u => {
            map[u.userId] = `${u.firstName} ${u.lastName}`;
        });
        return map;
    }, [users]);

    const orderColumns = [
        { id: 'shopOrderId', label: 'Order ID', minWidth: 50 },
        { id: 'userId', label: 'User ID', minWidth: 50 },
        { 
            id: 'userName', 
            label: 'User Name', 
            minWidth: 150,
            render: (row) => userMap[row.userId] || 'Unknown'
        },
        { id: 'totalAmount', label: 'Total Amount', minWidth: 100 },
        { 
            id: 'status', 
            label: 'Status', 
            minWidth: 100,
            render: (row) => row.status ? (
                <Chip 
                    label={row.status} 
                    size="small" 
                    color={getStatusColor(row.status)}
                />
            ) : 'N/A'
        },
        { id: 'orderDate', label: 'Date', minWidth: 150 },
    ];

    const detailColumns = [
        { id: 'shopOrderDetailId', label: 'Detail ID', minWidth: 50 },
        { 
            id: 'bundleName', 
            label: 'Bundle', 
            minWidth: 200,
            render: (row) => {
                const name = row.gemBundleName || row.skinAndCharacterBundleName;
                return (
                    <Chip 
                        label={name || 'Unknown Bundle'} 
                        size="small" 
                        variant="outlined"
                        color={row.gemBundleId ? "primary" : "secondary"}
                    />
                );
            }
        },
        { 
            id: 'itemName', 
            label: 'Item', 
            minWidth: 150,
            render: (row) => row.itemName || `Item #${row.itemId}`
        },
        { id: 'quantity', label: 'Quantity', minWidth: 50 },
        { id: 'unitPrice', label: 'Unit Price', minWidth: 100 },
    ];

    // Filtered orders logic
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const userName = (userMap[order.userId] || '').toLowerCase();
            const matchesUsername = userName.includes(usernameSearch.toLowerCase());
            const matchesStatus = statusFilter === 'All' || (order.status || '').toUpperCase() === statusFilter.toUpperCase();
            return matchesUsername && matchesStatus;
        });
    }, [orders, userMap, usernameSearch, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersRes = await userService.getAll();
            setUsers(usersRes.data || []);

            const res = await orderService.getAll();
            setOrders(res.data || []);
        } catch (error) {
            console.error('Failed to fetch orders/history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewDetails = async (order) => {
        setCurrentOrder(order);
        setOpenDetails(true);
        setDetailsLoading(true);
        try {
            // Fetch both order details and the full order info (with PayOS data)
            const [detailsRes, fullInfoRes] = await Promise.all([
                orderService.getDetails(order.shopOrderId),
                orderService.getById(order.shopOrderId)
            ]);
            setOrderDetails(detailsRes.data || []);
            setFullOrderInfo(fullInfoRes.data);
        } catch (error) {
            console.error('Failed to fetch order details', error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!currentOrder) return;
        const reason = prompt("Enter cancellation reason:");
        if (reason === null) return;

        try {
            await orderService.cancelPayment(currentOrder.shopOrderId, reason);
            // Refresh data
            handleViewDetails(currentOrder);
            fetchData();
        } catch (error) {
            console.error('Failed to cancel order', error);
            alert('Failed to cancel order');
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Orders</Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Search Username"
                        variant="outlined"
                        size="small"
                        value={usernameSearch}
                        onChange={(e) => setUsernameSearch(e.target.value)}
                        sx={{ width: 250 }}
                    />
                    <TextField
                        select
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                        sx={{ width: 150 }}
                    >
                        <MenuItem value="All">All Status</MenuItem>
                        <MenuItem value="PAID">Paid</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        <MenuItem value="EXPIRED">Expired</MenuItem>
                    </TextField>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <DataTable
                    columns={orderColumns}
                    data={filteredOrders}
                    onView={handleViewDetails}
                    hideSearch
                />
            )}

            <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Order Details #{currentOrder?.shopOrderId}
                    {fullOrderInfo?.orderCode && (
                        <Typography variant="subtitle2" color="textSecondary" component="div">
                            PayOS Code: {fullOrderInfo.orderCode}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    {detailsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {fullOrderInfo && (
                                <Box sx={{ mb: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="subtitle2" color="textSecondary">Customer Info</Typography>
                                            <Typography component="div"><strong>User:</strong> {userMap[fullOrderInfo.userId] || fullOrderInfo.playerUserName || 'Unknown'} (ID: {fullOrderInfo.userId})</Typography>
                                            <Typography component="div"><strong>Email:</strong> {fullOrderInfo.playerEmail || 'N/A'}</Typography>
                                            <Typography component="div"><strong>Date:</strong> {new Date(fullOrderInfo.orderDate).toLocaleString()}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="subtitle2" color="textSecondary">Payment Info</Typography>
                                            <Typography component="div">
                                                <strong>Status: </strong> 
                                                <Chip 
                                                    label={fullOrderInfo.status} 
                                                    size="small" 
                                                    color={getStatusColor(fullOrderInfo.status)}
                                                />
                                            </Typography>
                                            <Typography component="div"><strong>Total Amount:</strong> {fullOrderInfo.totalAmount.toLocaleString()} {fullOrderInfo.currency || 'VND'}</Typography>
                                            <Typography component="div"><strong>Paid:</strong> {fullOrderInfo.amountPaid.toLocaleString()} {fullOrderInfo.currency || 'VND'}</Typography>
                                            {fullOrderInfo.checkoutUrl && fullOrderInfo.status === 'PENDING' && (
                                                <Typography sx={{ mt: 1 }} component="div">
                                                    <Link href={fullOrderInfo.checkoutUrl} target="_blank" rel="noopener">
                                                        Open Payment Link
                                                    </Link>
                                                </Typography>
                                            )}
                                        </Grid>
                                    </Grid>
                                    
                                    {fullOrderInfo.cancellationReason && (
                                        <Box sx={{ mt: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                                            <Typography variant="body2" color="error.contrastText">
                                                <strong>Cancellation Reason:</strong> {fullOrderInfo.cancellationReason}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="h6" sx={{ mb: 1 }}>Items</Typography>
                            <DataTable
                                columns={detailColumns}
                                data={orderDetails}
                                disableActions
                                searchPlaceholder="Search order items..."
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {fullOrderInfo?.status === 'PENDING' && (
                        <Button color="error" onClick={handleCancelOrder}>Cancel Order</Button>
                    )}
                    <Button onClick={() => setOpenDetails(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrdersPage;
