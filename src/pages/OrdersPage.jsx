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
import { userService, orderService, purchaseOrderService } from '../api/services';

// „Ÿ„Ÿ„Ÿ Microtransaction History Tab „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ

const MicrotransactionHistory = ({ users }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [fullOrderInfo, setFullOrderInfo] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
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

    const userMap = useMemo(() => {
        const map = {};
        users.forEach(u => { map[u.userId] = `${u.firstName} ${u.lastName}`; });
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
                <Chip label={row.status} size="small" color={getStatusColor(row.status)} />
            ) : 'N/A'
        },
        { id: 'orderDate', label: 'Date', minWidth: 150, format: (v) => v ? new Date(v).toLocaleString() : 'N/A' },
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
                        color={row.gemBundleId ? 'primary' : 'secondary'}
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

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const userName = (userMap[order.userId] || '').toLowerCase();
            const matchesUsername = userName.includes(usernameSearch.toLowerCase());
            const matchesStatus = statusFilter === 'All' || (order.status || '').toUpperCase() === statusFilter.toUpperCase();
            return matchesUsername && matchesStatus;
        });
    }, [orders, userMap, usernameSearch, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderService.getAll();
            setOrders(res.data || []);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleViewDetails = async (order) => {
        setCurrentOrder(order);
        setOpenDetails(true);
        setDetailsLoading(true);
        try {
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
        const reason = prompt('Enter cancellation reason:');
        if (reason === null) return;
        try {
            await orderService.cancelPayment(currentOrder.shopOrderId, reason);
            handleViewDetails(currentOrder);
            fetchOrders();
        } catch (error) {
            console.error('Failed to cancel order', error);
            alert('Failed to cancel order');
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
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
                                                <Chip label={fullOrderInfo.status} size="small" color={getStatusColor(fullOrderInfo.status)} />
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
        </>
    );
};

// „Ÿ„Ÿ„Ÿ In-game Purchase History Tab „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ

const InGamePurchaseHistory = ({ users }) => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentPurchase, setCurrentPurchase] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [usernameSearch, setUsernameSearch] = useState('');

    const userMap = useMemo(() => {
        const map = {};
        users.forEach(u => { map[u.userId] = `${u.firstName} ${u.lastName}`; });
        return map;
    }, [users]);

    const getPurchaseStatusLabel = (status) => {
        switch (status) {
            case 1: return { label: 'Completed', color: 'success' };
            case 0: return { label: 'Pending', color: 'warning' };
            default: return { label: `Status ${status}`, color: 'default' };
        }
    };

    const purchaseColumns = [
        { id: 'purchaseOrderId', label: 'Purchase ID', minWidth: 80 },
        { id: 'userId', label: 'User ID', minWidth: 50 },
        {
            id: 'userName',
            label: 'User Name',
            minWidth: 150,
            render: (row) => userMap[row.userId] || row.user?.userName || 'Unknown'
        },
        {
            id: 'bundleName',
            label: 'Bundle',
            minWidth: 200,
            render: (row) => {
                const name = row.bundle?.bundleName;
                return name ? (
                    <Chip label={name} size="small" variant="outlined" color="secondary" />
                ) : 'N/A';
            }
        },
        { id: 'gemCost', label: 'Gem Cost', minWidth: 100 },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            render: (row) => {
                const { label, color } = getPurchaseStatusLabel(row.status);
                return <Chip label={label} size="small" color={color} />;
            }
        },
        {
            id: 'purchaseDate',
            label: 'Date',
            minWidth: 150,
            format: (v) => v ? new Date(v).toLocaleString() : 'N/A'
        },
    ];

    const filteredPurchases = useMemo(() => {
        return purchases.filter(p => {
            const userName = (userMap[p.userId] || p.user?.userName || '').toLowerCase();
            return userName.includes(usernameSearch.toLowerCase());
        });
    }, [purchases, userMap, usernameSearch]);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const res = await purchaseOrderService.getAll();
            setPurchases(res.data || []);
        } catch (error) {
            console.error('Failed to fetch purchase orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPurchases(); }, []);

    const handleViewDetails = async (purchase) => {
        setCurrentPurchase(purchase);
        setOpenDetails(true);
        setDetailsLoading(true);
        try {
            const res = await purchaseOrderService.getById(purchase.purchaseOrderId);
            setCurrentPurchase(res.data);
        } catch (error) {
            console.error('Failed to fetch purchase order details', error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const p = currentPurchase;
    const bundle = p?.bundle;
    const user = p?.user;
    const { label: statusLabel, color: statusColor } = p ? getPurchaseStatusLabel(p.status) : { label: 'N/A', color: 'default' };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <TextField
                    label="Search Username"
                    variant="outlined"
                    size="small"
                    value={usernameSearch}
                    onChange={(e) => setUsernameSearch(e.target.value)}
                    sx={{ width: 250 }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <DataTable
                    columns={purchaseColumns}
                    data={filteredPurchases}
                    onView={handleViewDetails}
                    hideSearch
                />
            )}

            <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    In-game Purchase Details #{p?.purchaseOrderId}
                </DialogTitle>
                <DialogContent dividers>
                    {detailsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : p && (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Customer Info</Typography>
                                    <Typography component="div">
                                        <strong>User:</strong> {userMap[p.userId] || user?.userName || 'Unknown'} (ID: {p.userId})
                                    </Typography>
                                    <Typography component="div"><strong>Email:</strong> {user?.email || 'N/A'}</Typography>
                                    <Typography component="div">
                                        <strong>Date:</strong> {p.purchaseDate ? new Date(p.purchaseDate).toLocaleString() : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Purchase Info</Typography>
                                    <Typography component="div">
                                        <strong>Status: </strong>
                                        <Chip label={statusLabel} size="small" color={statusColor} />
                                    </Typography>
                                    <Typography component="div">
                                        <strong>Gem Cost:</strong> {p.gemCost?.toLocaleString() ?? 'N/A'}
                                    </Typography>
                                    <Typography component="div">
                                        <strong>Bundle ID:</strong> {p.skinAndCharacterBundleId ?? 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {bundle && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 1 }}>Bundle Info</Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography component="div"><strong>Bundle Name:</strong> {bundle.bundleName}</Typography>
                                            <Typography component="div">
                                                <strong>Bundle Price:</strong> {bundle.bundlePrice?.toLocaleString() ?? 'N/A'}
                                            </Typography>
                                            <Typography component="div"><strong>Quantity:</strong> {bundle.quantity ?? 'N/A'}</Typography>
                                            <Typography component="div"><strong>Item ID:</strong> {bundle.itemId ?? 'N/A'}</Typography>
                                            <Typography component="div">
                                                <strong>Bundle Status: </strong>
                                                <Chip
                                                    label={bundle.status === 1 ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    color={bundle.status === 1 ? 'success' : 'default'}
                                                />
                                            </Typography>
                                        </Grid>
                                        {bundle.imageUrl && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <img
                                                    src={bundle.imageUrl}
                                                    alt={bundle.bundleName}
                                                    style={{ maxWidth: 140, borderRadius: 8, display: 'block' }}
                                                />
                                            </Grid>
                                        )}
                                    </Grid>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetails(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// „Ÿ„Ÿ„Ÿ Main OrdersPage „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ

const OrdersPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setUsersLoading(true);
            try {
                const res = await userService.getAll();
                setUsers(res.data || []);
            } catch (error) {
                console.error('Failed to fetch users', error);
            } finally {
                setUsersLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4">Orders</Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} aria-label="order tabs">
                    <Tab label="Microtransaction History" />
                    <Tab label="In-game Purchase History" />
                </Tabs>
            </Box>

            {usersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {tabValue === 0 && <MicrotransactionHistory users={users} />}
                    {tabValue === 1 && <InGamePurchaseHistory users={users} />}
                </>
            )}
        </Box>
    );
};

export default OrdersPage;