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
import { orderService, orderDetailService, userService } from '../api/services';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);

    const columns = [
        { id: 'orderId', label: 'Order ID', minWidth: 50 },
        { id: 'userId', label: 'User ID', minWidth: 50 },
        { id: 'userName', label: 'User Name', minWidth: 150 },
        { id: 'orderDate', label: 'Date', minWidth: 100 },
        { id: 'totalAmount', label: 'Total Amount', minWidth: 100 },
    ];

    const detailColumns = [
        { id: 'productId', label: 'Product ID', minWidth: 50 },
        { id: 'quantity', label: 'Quantity', minWidth: 50 },
        { id: 'subtotal', label: 'Subtotal', minWidth: 100 },
    ];

    const fetchOrders = async () => {
        try {
            const [ordersRes, usersRes] = await Promise.all([
                orderService.getAll(),
                userService.getAll()
            ]);
            
            const map = {};
            usersRes.data.forEach(user => {
                map[user.userId] = user.fullName;
            });
            setUserMap(map);

            const enrichedOrders = ordersRes.data.map(order => ({
                ...order,
                userName: map[order.userId] || 'Unknown'
            }));
            setOrders(enrichedOrders);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleView = async (order) => {
        setCurrentOrder(order);
        try {
            const response = await orderDetailService.getAll();
            // Filter details for this order
            const details = response.data.filter(detail => detail.orderId === order.orderId);
            setOrderDetails(details);
            setOpenDetails(true);
        } catch (error) {
            console.error('Failed to fetch order details', error);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>Orders</Typography>
            <DataTable
                columns={columns}
                data={orders}
                onView={handleView}
                searchPlaceholder="Search orders..."
            />

            {/* Details Modal */}
            <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
                <DialogTitle>Order Details</DialogTitle>
                <DialogContent>
                    {currentOrder && (
                        <Box sx={{ mb: 2 }}>
                            <Typography><strong>Order ID:</strong> {currentOrder.orderId}</Typography>
                            <Typography><strong>User ID:</strong> {currentOrder.userId}</Typography>
                            <Typography><strong>User Name:</strong> {userMap[currentOrder.userId] || 'Unknown'}</Typography>
                            <Typography><strong>Date:</strong> {currentOrder.orderDate}</Typography>
                            <Typography><strong>Total Amount:</strong> {currentOrder.totalAmount}</Typography>
                        </Box>
                    )}
                    <Typography variant="h6" sx={{ mt: 2 }}>Order Items</Typography>
                    <DataTable
                        columns={detailColumns}
                        data={orderDetails}
                        disableActions
                        searchPlaceholder="Search order items..."
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
