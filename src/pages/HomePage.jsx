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
} from "@mui/icons-material";

import { dashboardService } from "../api/services";
import SimpleLineChart from "../components/SimpleCharts";

const HomePage = () => {
  const [granularity, setGranularity] = useState("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [tab, setTab] = useState("all");

  // Data states
  const [revenueData, setRevenueData] = useState([]);
  const [prevRevenueData, setPrevRevenueData] = useState([]);
  const [bundleRankings, setBundleRankings] = useState([]);
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
          ...(period.unit === "month" && { groupBy: "month" }),
        };

        const promises = [
          dashboardService.getRevenue(params),
          dashboardService.getBundleRanking({ ...params, top: 5 }),
          dashboardService.getPlayerStats(params),
          dashboardService.getPlayerHistory(params),
        ];

        // Fetch previous revenue if period supports it
        if (period.prevStart && period.prevEnd) {
          const prevParams = {
            start: period.prevStart.toISOString(),
            end: period.prevEnd.toISOString(),
            ...(period.unit === "month" && { groupBy: "month" }),
          };
          promises.push(dashboardService.getRevenue(prevParams));
        }

        const [revenueRes, bundleRes, statsRes, historyRes, prevRevenueRes] = await Promise.all(promises);

        setRevenueData(revenueRes.data || []);
        setBundleRankings(bundleRes.data || []);
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

    return { labels, series: [{ name: "Revenue", data, color: "#696cff" }] };
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
        { name: "Peak Online", data: onlineData, color: "#71dd37" },
        { name: "DAU", data: dauData, color: "#03c3ec" },
      ],
    };
  }, [playerHistory]);

  // ===================== UI =====================
  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of revenue, players, and bundle performance
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: "bold",
              },
            }}
          >
            <Tab value="all" label="All" />
            <Tab value="revenue" label="Revenue" />
            <Tab value="player" label="Players" />
            <Tab value="bundle" label="Bundles" />
          </Tabs>

          <TextField
            select
            size="small"
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            sx={{ width: 160 }}
          >
            <MenuItem value="weekly">Last 7 Days</MenuItem>
            <MenuItem value="monthly">Last Month</MenuItem>
            <MenuItem value="yearly">Last Year</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </TextField>

          {granularity === "custom" && (
            <>
              <TextField
                type="date"
                size="small"
                label="From"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                size="small"
                label="To"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* ===================== Revenue Section ===================== */}
        {(tab === "all" || tab === "revenue") && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Revenue (General)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Avatar sx={{ bgcolor: "primary.light", color: "primary.main" }}>
                          <TrendingUpIcon />
                        </Avatar>
                        {revenueGrowth !== null && (
                          <Chip 
                            label={`${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`} 
                            color={revenueGrowth >= 0 ? "success" : "error"} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>

                      <Typography color="text.secondary" variant="body2">
                        Total Revenue
                      </Typography>

                      <Typography variant="h5" fontWeight="bold">
                        ${totalRevenue.toLocaleString()}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Includes top-ups and shop orders
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={9}>
                  <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      Revenue Analytics
                    </Typography>

                    <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Revenue
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold">
                          ${totalRevenue.toLocaleString()}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Data Points
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {revenueData.length}
                        </Typography>
                      </Box>
                    </Box>

                    <SimpleLineChart
                      labels={revenueGraphData.labels}
                      series={revenueGraphData.series}
                      height={260}
                      loading={loading}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* ===================== Player Section ===================== */}
        {(tab === "all" || tab === "player") && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Players
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Avatar sx={{ bgcolor: "success.light", color: "success.main" }}>
                          <OnlineIcon />
                        </Avatar>
                        <Chip label="LIVE" color="success" size="small" variant="outlined" />
                      </Box>

                      <Typography color="text.secondary" variant="body2">
                        Online Players
                      </Typography>

                      <Typography variant="h5" fontWeight="bold">
                        {playerStats.currentOnline}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Avatar sx={{ bgcolor: "info.light", color: "info.main" }}>
                          <PeopleIcon />
                        </Avatar>
                      </Box>

                      <Typography color="text.secondary" variant="body2">
                        Daily Active Users
                      </Typography>

                      <Typography variant="h5" fontWeight="bold">
                        {playerStats.dailyActiveUsers}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Avatar sx={{ bgcolor: "error.light", color: "error.main" }}>
                          <BlockIcon />
                        </Avatar>
                      </Box>

                      <Typography color="text.secondary" variant="body2">
                        Banned Accounts
                      </Typography>

                      <Typography variant="h5" fontWeight="bold">
                        {playerStats.bannedAccountsCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        Player Activity History
                      </Typography>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Chip
                          size="small"
                          label="Peak Online"
                          sx={{ bgcolor: "#71dd37", color: "white" }}
                        />
                        <Chip
                          size="small"
                          label="DAU"
                          sx={{ bgcolor: "#03c3ec", color: "white" }}
                        />
                      </Box>
                    </Box>

                    <SimpleLineChart
                      labels={playerGraphData.labels}
                      series={playerGraphData.series}
                      height={280}
                      loading={loading}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* ===================== Bundle Revenue Ranking Section ===================== */}
        {(tab === "all" || tab === "bundle") && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Bundle Revenue Ranking
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bundle Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Sales</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {bundleRankings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="body2" color="text.secondary">
                            No bundle revenue data found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      bundleRankings.map((bundle, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {bundle.bundleName}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={bundle.type}
                              size="small"
                              color={bundle.type === "Gem" ? "primary" : "secondary"}
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2">{bundle.count}</Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              ${bundle.revenue.toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default HomePage;