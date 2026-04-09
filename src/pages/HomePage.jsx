import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Grid, Paper, TextField, MenuItem, Divider } from '@mui/material';
import { shopService } from '../api/services';
import SimpleLineChart from '../components/SimpleCharts';

const HomePage = () => {
    const [granularity, setGranularity] = useState('weekly');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [orders, setOrders] = useState([]);
    const [topups, setTopups] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [ordersRes, topupsRes] = await Promise.all([
                    shopService.getOrders(),
                    shopService.getTopUpHistory(),
                ]);
                setOrders(ordersRes.data || []);
                setTopups(topupsRes.data || []);
            } catch (e) {
                console.error('Failed to load dashboard data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const period = useMemo(() => {
        const now = new Date();
        if (granularity === 'weekly') {
            const s = new Date(now);
            s.setDate(now.getDate() - 6);
            return { start: s, end: now, unit: 'day' };
        }
        if (granularity === 'monthly') {
            const s = new Date(now);
            s.setDate(1);
            return { start: s, end: now, unit: 'day' };
        }
        if (granularity === 'yearly') {
            const s = new Date(now);
            s.setMonth(now.getMonth() - 11, 1);
            return { start: s, end: now, unit: 'month' };
        }
        const s = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        const e = endDate ? new Date(endDate) : now;
        const days = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
        return { start: s, end: e, unit: days > 90 ? 'month' : 'day' };
    }, [granularity, startDate, endDate]);

    const within = (d) => {
        const dt = new Date(d);
        return dt >= period.start && dt <= period.end;
    };

    const revenueOrders = useMemo(
        () => orders.filter(o => within(o.orderDate)),
        [orders, period]
    );
    const revenueTopups = useMemo(
        () => topups.filter(t => within(t.date)),
        [topups, period]
    );

    const sum = (arr, key) => arr.reduce((acc, v) => acc + (Number(v[key]) || 0), 0);
    const revenueFromOrders = sum(revenueOrders, 'totalAmount');
    const revenueFromTopups = sum(revenueTopups, 'realMoneyAmount');
    const totalRevenue = revenueFromOrders + revenueFromTopups;

    const ordersCount = revenueOrders.length;
    const avgOrder = ordersCount ? revenueFromOrders / ordersCount : 0;

    const newPurchasingUsers = useMemo(() => {
        const firstOrderMap = new Map();
        orders.forEach(o => {
            const dt = new Date(o.orderDate);
            const cur = firstOrderMap.get(o.userId);
            if (!cur || dt < cur) firstOrderMap.set(o.userId, dt);
        });
        let c = 0;
        firstOrderMap.forEach(dt => {
            if (dt >= period.start && dt <= period.end) c += 1;
        });
        return c;
    }, [orders, period]);

    const bucketKey = (d) => {
        const dt = new Date(d);
        if (period.unit === 'month') {
            return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        }
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };

    const seriesLabels = useMemo(() => {
        const labels = new Set();
        revenueOrders.forEach(o => labels.add(bucketKey(o.orderDate)));
        revenueTopups.forEach(t => labels.add(bucketKey(t.date)));
        const sorted = Array.from(labels).sort();
        return sorted;
    }, [revenueOrders, revenueTopups, period]);

    const ordersSeries = seriesLabels.map(k =>
        revenueOrders
            .filter(o => bucketKey(o.orderDate) === k)
            .reduce((acc, v) => acc + (Number(v.totalAmount) || 0), 0)
    );
    const topupsSeries = seriesLabels.map(k =>
        revenueTopups
            .filter(t => bucketKey(t.date) === k)
            .reduce((acc, v) => acc + (Number(v.realMoneyAmount) || 0), 0)
    );

    const labelTitle = useMemo(() => {
        if (granularity === 'weekly') return 'Last 7 Days';
        if (granularity === 'monthly') return 'This Month';
        if (granularity === 'yearly') return 'Last 12 Months';
        return 'Custom Range';
    }, [granularity]);

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>Dashboard</Typography>
                <TextField
                    select
                    label="Granularity"
                    size="small"
                    value={granularity}
                    onChange={(e) => setGranularity(e.target.value)}
                >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                </TextField>
                {granularity === 'custom' && (
                    <>
                        <TextField
                            label="Start"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <TextField
                            label="End"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </>
                )}
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Revenue ({labelTitle})</Typography>
                        <SimpleLineChart
                            labels={seriesLabels}
                            series={[
                                { name: 'Orders', data: ordersSeries, color: '#696cff' },
                                { name: 'Top-ups', data: topupsSeries, color: '#2bbd7e' },
                            ]}
                            loading={loading}
                            height={260}
                        />
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={6} md={3}>
                                <Typography variant="subtitle2">Total Revenue</Typography>
                                <Typography variant="h5">${totalRevenue.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="subtitle2">Orders Revenue</Typography>
                                <Typography variant="h6">${revenueFromOrders.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="subtitle2">Top-up Revenue</Typography>
                                <Typography variant="h6">${revenueFromTopups.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="subtitle2">Avg Order Value</Typography>
                                <Typography variant="h6">${avgOrder.toFixed(2)}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">New Purchasing Users</Typography>
                        <Typography variant="h3" sx={{ mt: 1 }}>{newPurchasingUsers}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Count of users whose first purchase falls within the selected period
                        </Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Orders Count</Typography>
                        <Typography variant="h3" sx={{ mt: 1 }}>{ordersCount}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Number of orders in the selected period
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomePage;
