import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    Typography,
    Avatar,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    CircularProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    alpha,
    useTheme,
    TableSortLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Inventory as InventoryIcon,
    ReceiptLong as OrderIcon,
    History as TransactionIcon,
    Email as EmailIcon,
    CalendarToday as DateIcon,
    AccountCircle as UserIcon,
    MonetizationOn as MoneyIcon
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import { userService, userItemService, orderService, shopService } from '../api/services';

const UserProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    // Sorting and Filtering states for Orders
    const [orderSortBy, setOrderSortBy] = useState('orderDate');
    const [orderOrder, setOrderOrder] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('all');

    // Sorting states for Transactions
    const [txSortBy, setTxSortBy] = useState('transactionDateTime');
    const [txOrder, setTxOrder] = useState('desc');

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const response = await userService.getProfile(id);
                setProfile(response.data);
            } catch (error) {
                console.error('Failed to fetch user profile data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!profile || !profile.user) {
        return (
            <Box sx={{ p: 3 }}>
                <PageHeader title="User Not Found" breadcrumbs={[{ label: 'Users', path: '/users' }]} />
                <Typography variant="h5" color="error" sx={{ mt: 2 }}>User profile data is missing or inaccessible.</Typography>
            </Box>
        );
    }

    const { user, inventory, orders, transactions } = profile;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName || 'Unknown User';

    // Helper for sorting
    const handleRequestSort = (property, currentSortBy, setSortBy, currentOrder, setOrder) => {
        const isAsc = currentSortBy === property && currentOrder === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setSortBy(property);
    };

    // Filtered and Sorted Orders
    const processedOrders = (orders || [])
        .filter(o => statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase())
        .sort((a, b) => {
            const isAsc = orderOrder === 'asc';
            let aVal = a[orderSortBy];
            let bVal = b[orderSortBy];
            
            if (orderSortBy === 'orderDate' || orderSortBy === 'createdAt') {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            }
            
            if (aVal < bVal) return isAsc ? -1 : 1;
            if (aVal > bVal) return isAsc ? 1 : -1;
            return 0;
        });

    // Sorted Transactions
    const processedTransactions = (transactions || [])
        .sort((a, b) => {
            const isAsc = txOrder === 'asc';
            let aVal = a[txSortBy];
            let bVal = b[txSortBy];

            if (txSortBy === 'transactionDateTime') {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            }

            if (aVal < bVal) return isAsc ? -1 : 1;
            if (aVal > bVal) return isAsc ? 1 : -1;
            return 0;
        });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <PageHeader 
                title="User Profile" 
                subtitle="Detailed view of player information and activity"
                breadcrumbs={[{ label: 'Users', path: '/users' }, { label: fullName }]}
            />

            <Grid container spacing={3}>
                {/* Profile Overview Card */}
                <Grid item xs={12}>
                    <Card sx={{ p: 4, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: 120, 
                            bgcolor: alpha(theme.palette.primary.main, 0.08) 
                        }} />
                        
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ position: 'relative', pt: 4 }}>
                            <Avatar 
                                src={user.avatarUrl} 
                                sx={{ 
                                    width: 140, 
                                    height: 140, 
                                    border: '4px solid white', 
                                    boxShadow: theme.shadows[3],
                                    bgcolor: 'primary.main',
                                    fontSize: '3rem'
                                }}
                            >
                                {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                            </Avatar>
                            
                            <Box sx={{ flexGrow: 1, pt: { xs: 0, md: 4 } }}>
                                <Typography variant="h2" fontWeight="800" gutterBottom>
                                    {fullName}
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <UserIcon color="action" fontSize="small" />
                                            <Typography variant="body1" fontWeight="600">{user.userName || 'N/A'}</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <EmailIcon color="action" fontSize="small" />
                                            <Typography variant="body1">{user.email}</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <DateIcon color="action" fontSize="small" />
                                            <Typography variant="body2" color="text.secondary">
                                                ID: {user.userId}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ pt: { xs: 0, md: 4 }, textAlign: 'right' }}>
                                <Chip 
                                    label={user.bannedUntil && new Date(user.bannedUntil) > new Date() ? 'Banned' : 'Active'} 
                                    color={user.bannedUntil && new Date(user.bannedUntil) > new Date() ? 'error' : 'success'}
                                    sx={{ fontWeight: 700, px: 2 }}
                                />
                            </Box>
                        </Stack>
                    </Card>
                </Grid>

                {/* Activity Sections */}
                <Grid item xs={12}>
                    <Stack spacing={3}>
                        {/* Inventory Accordion */}
                        <Accordion defaultExpanded sx={{ borderRadius: 2, '&:before': { display: 'none' }, boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <InventoryIcon color="primary" />
                                    <Typography variant="h6" fontWeight="700">User Inventory</Typography>
                                    <Chip label={inventory?.length || 0} size="small" variant="soft" color="primary" />
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 0, pt: 0 }}>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Item Name</TableCell>
                                                <TableCell>Quantity</TableCell>
                                                <TableCell>Obtained Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {!inventory || inventory.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                                        <Typography variant="body2" color="text.secondary">No items in inventory</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                inventory.map((item, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell sx={{ fontWeight: 600 }}>{item.itemName}</TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>{new Date(item.obtainedDate).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>

                        <Grid container spacing={3}>
                            {/* Orders Card (Left Column) */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)' }}>
                                    <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px dashed ${theme.palette.divider}` }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <OrderIcon color="info" />
                                            <Typography variant="h6" fontWeight="700">Purchase Orders</Typography>
                                            <Chip label={processedOrders.length} size="small" variant="soft" color="info" />
                                        </Stack>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                value={statusFilter}
                                                label="Status"
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                            >
                                                <MenuItem value="all">All Status</MenuItem>
                                                <MenuItem value="paid">Paid</MenuItem>
                                                <MenuItem value="pending">Pending</MenuItem>
                                                <MenuItem value="failed">Failed</MenuItem>
                                                <MenuItem value="cancelled">Cancelled</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        <TableSortLabel
                                                            active={orderSortBy === 'shopOrderId'}
                                                            direction={orderSortBy === 'shopOrderId' ? orderOrder : 'asc'}
                                                            onClick={() => handleRequestSort('shopOrderId', orderSortBy, setOrderSortBy, orderOrder, setOrderOrder)}
                                                        >
                                                            Order ID
                                                        </TableSortLabel>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <TableSortLabel
                                                            active={orderSortBy === 'totalAmount'}
                                                            direction={orderSortBy === 'totalAmount' ? orderOrder : 'asc'}
                                                            onClick={() => handleRequestSort('totalAmount', orderSortBy, setOrderSortBy, orderOrder, setOrderOrder)}
                                                        >
                                                            Amount
                                                        </TableSortLabel>
                                                    </TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>
                                                        <TableSortLabel
                                                            active={orderSortBy === 'orderDate'}
                                                            direction={orderSortBy === 'orderDate' ? orderOrder : 'asc'}
                                                            onClick={() => handleRequestSort('orderDate', orderSortBy, setOrderSortBy, orderOrder, setOrderOrder)}
                                                        >
                                                            Date
                                                        </TableSortLabel>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {processedOrders.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                            <Typography variant="body2" color="text.secondary">No orders found</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    processedOrders.map((order, index) => (
                                                        <TableRow key={index} hover>
                                                            <TableCell>#{order.shopOrderId}</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700 }}>{(order.totalAmount || 0).toLocaleString()} VND</TableCell>
                                                            <TableCell>
                                                                <Chip 
                                                                    label={order.status} 
                                                                    size="small" 
                                                                    color={getStatusColor(order.status)}
                                                                    variant="soft"
                                                                />
                                                            </TableCell>
                                                            <TableCell>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Card>
                            </Grid>

                            {/* Transactions Card (Right Column) */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)' }}>
                                    <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px dashed ${theme.palette.divider}` }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <TransactionIcon color="warning" />
                                            <Typography variant="h6" fontWeight="700">Transaction History</Typography>
                                            <Chip label={processedTransactions.length} size="small" variant="soft" color="warning" />
                                        </Stack>
                                    </Box>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell align="right">
                                                        <TableSortLabel
                                                            active={txSortBy === 'amount'}
                                                            direction={txSortBy === 'amount' ? txOrder : 'asc'}
                                                            onClick={() => handleRequestSort('amount', txSortBy, setTxSortBy, txOrder, setTxOrder)}
                                                        >
                                                            Amount
                                                        </TableSortLabel>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TableSortLabel
                                                            active={txSortBy === 'transactionDateTime'}
                                                            direction={txSortBy === 'transactionDateTime' ? txOrder : 'asc'}
                                                            onClick={() => handleRequestSort('transactionDateTime', txSortBy, setTxSortBy, txOrder, setTxOrder)}
                                                        >
                                                            Date
                                                        </TableSortLabel>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {processedTransactions.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                                            <Typography variant="body2" color="text.secondary">No transactions found</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    processedTransactions.map((tx, index) => (
                                                        <TableRow key={index} hover>
                                                            <TableCell sx={{ fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {tx.id || 'N/A'}
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700 }}>{(tx.amount || 0).toLocaleString()} VND</TableCell>
                                                            <TableCell>{tx.transactionDateTime ? new Date(tx.transactionDateTime).toLocaleString() : 'N/A'}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Card>
                            </Grid>
                        </Grid>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserProfilePage;
