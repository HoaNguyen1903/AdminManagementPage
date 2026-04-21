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
    Link
} from '@mui/material';
import DataTable from '../components/DataTable';
import { shopService, userService, orderService, itemService } from '../api/services';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [gemBundles, setGemBundles] = useState([]);
    const [skinBundles, setSkinBundles] = useState([]);
    const [items, setItems] = useState([]);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [fullOrderInfo, setFullOrderInfo] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            case 'expired': return 'default';
            default: return 'primary';
        }
    };

    // Create lookup maps for names
    const userMap = useMemo(() => {
        const map = {};
        users.forEach(u => {
            map[u.userId] = `${u.firstName} ${u.lastName}`;
        });
        return map;
    }, [users]);

    const gemBundleMap = useMemo(() => {
        const map = {};
        gemBundles.forEach(b => {
            map[b.gemBundleId] = b.bundleName;
        });
        return map;
    }, [gemBundles]);

    const skinBundleMap = useMemo(() => {
        const map = {};
        skinBundles.forEach(b => {
            map[b.skinAndCharacterBundleId] = b.bundleName;
        });
        return map;
    }, [skinBundles]);

    const itemMap = useMemo(() => {
        const map = {};
        items.forEach(item => {
            map[item.itemId] = item.itemName;
        });
        return map;
    }, [items]);

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
                const name = row.gemBundleId ? gemBundleMap[row.gemBundleId] : skinBundleMap[row.skinAndCharacterBundleId];
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
            id: 'itemId', 
            label: 'Item', 
            minWidth: 150,
            render: (row) => itemMap[row.itemId] || `Item #${row.itemId}`
        },
        { id: 'quantity', label: 'Quantity', minWidth: 50 },
        { id: 'unitPrice', label: 'Unit Price', minWidth: 100 },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, gemRes, skinRes, itemsRes] = await Promise.all([
                userService.getAll(),
                shopService.getGemBundles(),
                shopService.getSkinBundles(),
                itemService.getAll()
            ]);
            setUsers(usersRes.data || []);
            setGemBundles(gemRes.data || []);
            setSkinBundles(skinRes.data || []);
            setItems(itemsRes.data || []);

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
            <Typography variant="h4" sx={{ mb: 2 }}>Orders</Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <DataTable
                    columns={orderColumns}
                    data={orders}
                    onView={handleViewDetails}
                    searchPlaceholder="Search orders..."
                />
            )}

            <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Order Details #{currentOrder?.shopOrderId}
                    {fullOrderInfo?.orderCode && (
                        <Typography variant="subtitle2" color="textSecondary">
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
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="textSecondary">Customer Info</Typography>
                                            <Typography><strong>User:</strong> {userMap[fullOrderInfo.userId] || fullOrderInfo.playerUserName || 'Unknown'} (ID: {fullOrderInfo.userId})</Typography>
                                            <Typography><strong>Email:</strong> {fullOrderInfo.playerEmail || 'N/A'}</Typography>
                                            <Typography><strong>Date:</strong> {new Date(fullOrderInfo.orderDate).toLocaleString()}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="textSecondary">Payment Info</Typography>
                                            <Typography>
                                                <strong>Status: </strong> 
                                                <Chip 
                                                    label={fullOrderInfo.status} 
                                                    size="small" 
                                                    color={getStatusColor(fullOrderInfo.status)}
                                                />
                                            </Typography>
                                            <Typography><strong>Total Amount:</strong> {fullOrderInfo.totalAmount.toLocaleString()} {fullOrderInfo.currency || 'VND'}</Typography>
                                            <Typography><strong>Paid:</strong> {fullOrderInfo.amountPaid.toLocaleString()} {fullOrderInfo.currency || 'VND'}</Typography>
                                            {fullOrderInfo.checkoutUrl && fullOrderInfo.status === 'PENDING' && (
                                                <Typography sx={{ mt: 1 }}>
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
