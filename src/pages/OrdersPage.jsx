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
    Chip
} from '@mui/material';
import DataTable from '../components/DataTable';
import { shopService, userService } from '../api/services';

const OrdersPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [orders, setOrders] = useState([]);
    const [topUpHistory, setTopUpHistory] = useState([]);
    const [users, setUsers] = useState([]);
    const [gemBundles, setGemBundles] = useState([]);
    const [skinBundles, setSkinBundles] = useState([]);
    const [openDetails, setOpenDetails] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
        { id: 'orderDate', label: 'Date', minWidth: 150 },
    ];

    const detailColumns = [
        { id: 'shopOrderDetailId', label: 'Detail ID', minWidth: 50 },
        { 
            id: 'skinAndCharacterBundleId', 
            label: 'Bundle', 
            minWidth: 150,
            render: (row) => {
                const name = skinBundleMap[row.skinAndCharacterBundleId] || 'Unknown Bundle';
                return (
                    <Chip 
                        label={name} 
                        size="small" 
                        variant="outlined"
                        color="secondary"
                    />
                );
            }
        },
        { id: 'itemId', label: 'Item ID', minWidth: 80 },
        { id: 'quantity', label: 'Quantity', minWidth: 50 },
        { id: 'unitPrice', label: 'Unit Price', minWidth: 100 },
    ];

    const topUpColumns = [
        { id: 'topUpId', label: 'ID', minWidth: 50 },
        { id: 'userId', label: 'User ID', minWidth: 50 },
        { 
            id: 'userName', 
            label: 'User Name', 
            minWidth: 150,
            render: (row) => userMap[row.userId] || 'Unknown'
        },
        { 
            id: 'gemBundleId', 
            label: 'Bundle', 
            minWidth: 150,
            render: (row) => {
                const name = gemBundleMap[row.gemBundleId] || 'Unknown Bundle';
                return (
                    <Chip 
                        label={name} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                    />
                );
            }
        },
        { id: 'gemsAmount', label: 'Gems', minWidth: 80 },
        { id: 'realMoneyAmount', label: 'Amount', minWidth: 100 },
        { id: 'currencyCode', label: 'Currency', minWidth: 80 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'date', label: 'Date', minWidth: 150 },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, gemRes, skinRes] = await Promise.all([
                userService.getAll(),
                shopService.getGemBundles(),
                shopService.getSkinBundles()
            ]);
            setUsers(usersRes.data || []);
            setGemBundles(gemRes.data || []);
            setSkinBundles(skinRes.data || []);

            if (tabValue === 0) {
                const res = await shopService.getOrders();
                setOrders(res.data || []);
            } else {
                const res = await shopService.getTopUpHistory();
                setTopUpHistory(res.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch orders/history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tabValue]);

    const handleViewDetails = async (order) => {
        setCurrentOrder(order);
        try {
            const res = await shopService.getOrderDetails(order.shopOrderId);
            setOrderDetails(res.data || []);
            setOpenDetails(true);
        } catch (error) {
            console.error('Failed to fetch order details', error);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Orders & History</Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="order tabs">
                    <Tab label="Shop Orders" />
                    <Tab label="TopUp History" />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <DataTable
                    columns={tabValue === 0 ? orderColumns : topUpColumns}
                    data={tabValue === 0 ? orders : topUpHistory}
                    onView={tabValue === 0 ? handleViewDetails : null}
                    disableActions={tabValue !== 0}
                    searchPlaceholder="Search history..."
                />
            )}

            <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
                <DialogTitle>Order Details #{currentOrder?.shopOrderId}</DialogTitle>
                <DialogContent>
                    {currentOrder && (
                        <Box sx={{ mb: 2 }}>
                            <Typography><strong>User:</strong> {userMap[currentOrder.userId] || 'Unknown'} (ID: {currentOrder.userId})</Typography>
                            <Typography><strong>Date:</strong> {currentOrder.orderDate}</Typography>
                            <Typography><strong>Total Amount:</strong> ${currentOrder.totalAmount}</Typography>
                        </Box>
                    )}
                    <DataTable
                        columns={detailColumns}
                        data={orderDetails}
                        disableActions
                        searchPlaceholder="Search order details..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetails(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrdersPage;
