import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Card,
  CardContent,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";

import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  FiberManualRecord as OnlineIcon,
  ShoppingCart as OrdersIcon,
  MonetizationOn as RevenueIcon,
  Group as ConversionIcon,
} from "@mui/icons-material";

import { dashboardService } from "../api/services";
import SimpleLineChart from "../components/SimpleCharts";
import { useAuth } from "../context/AuthContext";
import { styled, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
  padding: theme.spacing(6, 4),
  borderRadius: theme.shape.borderRadius * 1.5,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -20,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: '50%',
    background: alpha(theme.palette.primary.main, 0.1),
  }
}));

const IconCircle = styled(Box)(({ theme, color }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette[color].main, 0.12),
  color: theme.palette[color].main,
  marginBottom: theme.spacing(2),
}));

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [granularity, setGranularity] = useState("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [tab, setTab] = useState("all");

  const staffName = user?.email ? user.email.split('@')[0] : 'Admin';

  // Data states
  const [revenueData, setRevenueData] = useState([]);
  const [prevRevenueData, setPrevRevenueData] = useState([]);
  const [bundleRankings, setBundleRankings] = useState([]);
  const [userRanking, setUserRanking] = useState([]);
  const [playerStats, setPlayerStats] = useState({
    currentOnline: 0,
    dailyActiveUsers: 0,
    bannedAccountsCount: 0,
  });
  const [playerHistory, setPlayerHistory] = useState([]);

  const [loading, setLoading] = useState(false);

  // ===================== Period Logic =====================
  const period = useMemo(() => {
    const now = new Date();

    if (granularity === "weekly") {
      const s = new Date(now);
      s.setDate(now.getDate() - 7);
      
      const prevS = new Date(s);
      prevS.setDate(s.getDate() - 7);
      return { start: s, end: now, unit: "day", prevStart: prevS, prevEnd: s };
    }

    if (granularity === "monthly") {
      const s = new Date(now);
      s.setMonth(now.getMonth() - 1);
      
      const prevS = new Date(s);
      prevS.setMonth(s.getMonth() - 1);
      return { start: s, end: now, unit: "day", prevStart: prevS, prevEnd: s };
    }

    if (granularity === "yearly") {
      const s = new Date(now);
      s.setFullYear(now.getFullYear() - 1);
      
      const prevS = new Date(s);
      prevS.setFullYear(s.getFullYear() - 1);
      return { start: s, end: now, unit: "month", prevStart: prevS, prevEnd: s };
    }

    if (granularity === "all") {
      return { start: new Date(0), end: now, unit: "month" };
    }

    const s = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const e = endDate ? new Date(endDate) : now;

    const days = Math.ceil((e - s) / (1000 * 60 * 60 * 24));

    return { start: s, end: e, unit: days > 90 ? "month" : "day" };
  }, [granularity, startDate, endDate]);

  // ===================== Fetch Data =====================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          start: period.start.toISOString(),
          end: period.end.toISOString(),
          status: 'paid',
          ...(period.unit === "month" && { groupBy: "month" }),
        };

        const promises = [
          dashboardService.getRevenue(params),
          dashboardService.getBundleRanking({ ...params, top: 5 }),
          dashboardService.getPlayerStats(params),
          dashboardService.getPlayerHistory(params),
          dashboardService.getUserRanking({ ...params, top: 3 }),
        ];

        // Fetch previous revenue if period supports it
        if (period.prevStart && period.prevEnd) {
          const prevParams = {
            start: period.prevStart.toISOString(),
            end: period.prevEnd.toISOString(),
            status: 'paid',
            ...(period.unit === "month" && { groupBy: "month" }),
          };
          promises.push(dashboardService.getRevenue(prevParams));
        }

        const [revenueRes, bundleRes, statsRes, historyRes, rankingRes, prevRevenueRes] = await Promise.all(promises);

        setRevenueData(revenueRes.data || []);
        setBundleRankings(bundleRes.data || []);
        setUserRanking(rankingRes.data || []);
        setPlayerStats(statsRes.data || {
          currentOnline: 0,
          dailyActiveUsers: 0,
          bannedAccountsCount: 0,
        });
        setPlayerHistory(historyRes.data || []);
        
        if (prevRevenueRes) {
          setPrevRevenueData(prevRevenueRes.data || []);
        } else {
          setPrevRevenueData([]);
        }
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // ===================== Revenue Calculations =====================
  const totalRevenue = useMemo(() => {
    return revenueData.reduce((sum, item) => sum + item.revenue, 0);
  }, [revenueData]);

  const prevTotalRevenue = useMemo(() => {
    return prevRevenueData.reduce((sum, item) => sum + item.revenue, 0);
  }, [prevRevenueData]);

  const revenueGrowth = useMemo(() => {
    if (!period.prevStart || !period.prevEnd) return null;
    if (prevTotalRevenue === 0) return totalRevenue > 0 ? 100 : 0;
    return ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100;
  }, [totalRevenue, prevTotalRevenue, period]);

  // ===================== Revenue Graph Data =====================
  const revenueGraphData = useMemo(() => {
    const labels = revenueData.map((item) => item.label);
    const data = revenueData.map((item) => item.revenue);

    return { labels, series: [{ name: "Revenue", data, color: "#00a76f" }] };
  }, [revenueData]);

  // ===================== Player Graph Data =====================
  const playerGraphData = useMemo(() => {
    const labels = playerHistory.map((h) =>
      new Date(h.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    );

    const onlineData = playerHistory.map((h) => h.onlineCount);
    const dauData = playerHistory.map((h) => h.dailyActiveUsers);

    return {
      labels,
      series: [
        { name: "Peak Online", data: onlineData, color: "#00b8d9" },
        { name: "DAU", data: dauData, color: "#ffab00" },
      ],
    };
  }, [playerHistory]);

  // ===================== UI =====================
  return (
    <Box>
      {/* Top Section: Greeting and Filters */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <GradientBox>
            <Typography variant="h4" gutterBottom>
              👋 Hello {staffName},
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480 }}>
              Welcome to your Management Dashboard! Monitor your revenue, 
              track player activity, and gain valuable insights.
            </Typography>
          </GradientBox>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Quick Filters</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                size="small"
                fullWidth
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
              >
                <MenuItem value="weekly">Last 7 Days</MenuItem>
                <MenuItem value="monthly">Last Month</MenuItem>
                <MenuItem value="yearly">Last Year</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </TextField>

              {granularity === "custom" && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    label="From"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    label="To"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              )}
              
              <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                variant="fullWidth"
                sx={{
                  minHeight: 40,
                  '& .MuiTab-root': { py: 1, minHeight: 40, fontSize: '0.75rem' }
                }}
              >
                <Tab value="all" label="All" />
                <Tab value="revenue" label="Revenue" />
                <Tab value="player" label="Players" />
                <Tab value="bundle" label="Bundles" />
              </Tabs>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <IconCircle color="warning">
              <OrdersIcon />
            </IconCircle>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Sales (Bundles)
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Typography variant="h5">
                {bundleRankings.reduce((sum, b) => sum + b.count, 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                +12%
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <IconCircle color="primary">
              <RevenueIcon />
            </IconCircle>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Revenue
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Typography variant="h5">
                {(totalRevenue / 1000).toFixed(0)}k
              </Typography>
              {revenueGrowth !== null && (
                <Typography variant="caption" sx={{ color: revenueGrowth >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                  {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <IconCircle color="info">
              <PeopleIcon />
            </IconCircle>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Active Players
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Typography variant="h5">
                {playerStats.dailyActiveUsers}
              </Typography>
              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                -3.2%
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <IconCircle color="error">
              <BlockIcon />
            </IconCircle>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Banned Accounts
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Typography variant="h5">
                {playerStats.bannedAccountsCount}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                Total
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* ===================== Revenue Section ===================== */}
        {(tab === "all" || tab === "revenue") && (
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Revenue Analytics</Typography>
                <Chip label="Live" color="success" size="small" variant="outlined" />
              </Box>
              <SimpleLineChart
                labels={revenueGraphData.labels}
                series={revenueGraphData.series}
                height={320}
                loading={loading}
              />
            </Card>
          </Grid>
        )}

        {/* ===================== Player Section ===================== */}
        {(tab === "all" || tab === "player") && (
          <Grid item xs={12} lg={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Player History</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Online & DAU Trends
              </Typography>
              <SimpleLineChart
                labels={playerGraphData.labels}
                series={playerGraphData.series}
                height={280}
                loading={loading}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00b8d9' }} />
                  <Typography variant="caption">Peak Online</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ffab00' }} />
                  <Typography variant="caption">DAU</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        )}

        {/* ===================== Bundle Ranking Section ===================== */}
        {(tab === "all" || tab === "bundle") && (
          <Grid item xs={12} md={6}>
            <Card>
              <Box sx={{ p: 3, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="h6">Bundle Revenue Ranking</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bundle Name</TableCell>
                      <TableCell align="right">Sales</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bundleRankings.map((bundle, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{bundle.bundleName}</Typography>
                          <Typography variant="caption" color="text.secondary">{bundle.type}</Typography>
                        </TableCell>
                        <TableCell align="right">{bundle.count}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {bundle.revenue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        )}

        {/* ===================== User Ranking Section ===================== */}
        {(tab === "all" || tab === "revenue") && (
          <Grid item xs={12} md={6}>
            <Card>
              <Box sx={{ p: 3, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="h6">User Ranking (Top Spenders)</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Total Spent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userRanking.map((spender, index) => (
                      <TableRow 
                        key={index} 
                        hover 
                        onClick={() => navigate(`/users/${spender.userId}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: '0.75rem' }}>
                              {spender.userName ? spender.userName[0].toUpperCase() : spender.email[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{spender.userName || "Unknown"}</Typography>
                              <Typography variant="caption" color="text.secondary">{spender.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{spender.transactionCount}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {spender.totalSpent.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default HomePage;