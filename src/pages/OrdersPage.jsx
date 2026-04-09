import React, { useEffect, useState } from 'react';
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
    CircularProgress
} from '@mui/material';
import DataTable from '../components/DataTable';
import { shopService, userService } from '../api/services';

const OrdersPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [orders, setOrders] = useState([]);
    const [topUpHistory, setTopUpHistory] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const orderColumns = [
        { id: 'shopOrderId', label: 'Order ID', minWidth: 50 },
        { id: 'userId', label: 'User ID', minWidth: 50 },
        { id: 'userName', label: 'User Name', minWidth: 150 },
        { id: 'totalAmount', label: 'Total Amount', minWidth: 100 },
        { id: 'orderDate', label: 'Date', minWidth: 150 },
    ];

    const detailColumns = [
        { id: 'itemId', label: 'Item ID', minWidth: 50 },
        { id: 'skinAndCharacterBundleId', label: 'Bundle ID', minWidth: 100 },
        { id: 'quantity', label: 'Quantity', minWidth: 50 },
        { id: 'unitPrice', label: 'Unit Price', minWidth: 100 },
    ];

    const topUpColumns = [
        { id: 'topUpId', label: 'ID', minWidth: 50 },
        { id: 'userId', label: 'User ID', minWidth: 50 },
        { id: 'userName', label: 'User Name', minWidth: 150 },
        { id: 'gemsAmount', label: 'Gems', minWidth: 100 },
        { id: 'realMoneyAmount', label: 'Amount', minWidth: 100 },
        { id: 'currencyCode', label: 'Currency', minWidth: 80 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'date', label: 'Date', minWidth: 150 },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersRes = await userService.getAll();
            const map = {};
            usersRes.data.forEach(user => {
                map[user.userId] = user.fullName;
            });
            setUserMap(map);

            if (tabValue === 0) {
                const res = await shopService.getOrders();
                setOrders(res.data.map(o => ({ ...o, userName: map[o.userId] || 'Unknown' })));
            } else {
                const res = await shopService.getTopUpHistory();
                setTopUpHistory(res.data.map(o => ({ ...o, userName: map[o.userId] || 'Unknown' })));
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
            setOrderDetails(res.data);
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
                            <Typography><strong>User:</strong> {currentOrder.userName} (ID: {currentOrder.userId})</Typography>
                            <Typography><strong>Date:</strong> {currentOrder.orderDate}</Typography>
                            <Typography><strong>Total Amount:</strong> {currentOrder.totalAmount}</Typography>
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
