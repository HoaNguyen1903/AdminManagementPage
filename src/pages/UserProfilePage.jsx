import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  Typography,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  ReceiptLong as OrderIcon,
  History as TransactionIcon,
  Email as EmailIcon,
  CalendarToday as DateIcon,
  AccountCircle as UserIcon,
  Gavel as GavelIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import PageHeader from "../components/PageHeader";
import { userService } from "../api/services";

// -------------------------
// Helpers
// -------------------------
const safeDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const compareValues = (a, b, order = "asc") => {
  const isAsc = order === "asc";
  if (a == null && b == null) return 0;
  if (a == null) return isAsc ? 1 : -1;
  if (b == null) return isAsc ? -1 : 1;
  if (typeof a === "number" && typeof b === "number") return isAsc ? a - b : b - a;
  if (a instanceof Date && b instanceof Date)
    return isAsc ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
  const aStr = String(a).toLowerCase();
  const bStr = String(b).toLowerCase();
  if (aStr < bStr) return isAsc ? -1 : 1;
  if (aStr > bStr) return isAsc ? 1 : -1;
  return 0;
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "paid":
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
    case "failed":
      return "error";
    default:
      return "default";
  }
};

// -------------------------
// Reusable Sortable Table
// -------------------------
const SortableTable = ({ columns, rows, sortBy, sortOrder, onSort, emptyText = "No data found" }) => (
  <Table stickyHeader size="small">
    <TableHead>
      <TableRow>
        {columns.map((col) => (
          <TableCell
            key={col.key}
            align={col.align || "left"}
            sx={{ bgcolor: "background.paper", fontWeight: 700 }}
          >
            {col.sortable ? (
              <TableSortLabel
                active={sortBy === col.key}
                direction={sortBy === col.key ? sortOrder : "asc"}
                onClick={() => onSort(col.key)}
              >
                {col.label}
              </TableSortLabel>
            ) : (
              col.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.length === 0 ? (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {emptyText}
            </Typography>
          </TableCell>
        </TableRow>
      ) : (
        rows.map((row, index) => (
          <TableRow key={row.id ?? index} hover>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align || "left"}>
                {col.render ? col.render(row) : row[col.key] ?? "N/A"}
              </TableCell>
            ))}
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

// -------------------------
// Search Bar
// -------------------------
const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <TextField
    size="small"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    sx={{ minWidth: 220 }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon fontSize="small" color="action" />
        </InputAdornment>
      ),
    }}
  />
);

// -------------------------
// Main Component
// -------------------------
const UserProfilePage = () => {
  const { id } = useParams();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [inventorySearch, setInventorySearch] = useState("");
  const [orderSortBy, setOrderSortBy] = useState("orderDate");
  const [orderSortOrder, setOrderSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [txSortBy, setTxSortBy] = useState("transactionDateTime");
  const [txSortOrder, setTxSortOrder] = useState("desc");
  const [txSearch, setTxSearch] = useState("");
  const [banSearch, setBanSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await userService.getProfile(id);
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id]);

  const user = profile?.user;
  const inventory = profile?.inventory || [];
  const orders = profile?.orders || [];
  const transactions = profile?.transactions || [];
  const banLogs = profile?.banLogs || [];

  const fullName = useMemo(() => {
    if (!user) return "Unknown User";
    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.userName ||
      "Unknown User"
    );
  }, [user]);

  const handleSortToggle = (key, sortBy, sortOrder, setSortBy, setSortOrder) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const processedInventory = useMemo(() => {
    const q = inventorySearch.toLowerCase();
    if (!q) return inventory;
    return inventory.filter((item) => (item.itemName || "").toLowerCase().includes(q));
  }, [inventory, inventorySearch]);

  const processedOrders = useMemo(() => {
    const q = orderSearch.toLowerCase();
    const filtered = orders.filter((o) => {
      const matchStatus =
        statusFilter === "all" || o.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchSearch =
        !q ||
        String(o.shopOrderId || "").toLowerCase().includes(q) ||
        (o.status || "").toLowerCase().includes(q) ||
        String(o.totalAmount || "").includes(q);
      return matchStatus && matchSearch;
    });
    return [...filtered].sort((a, b) => {
      let aVal = a[orderSortBy];
      let bVal = b[orderSortBy];
      if (orderSortBy === "orderDate" || orderSortBy === "createdAt") {
        aVal = safeDate(aVal);
        bVal = safeDate(bVal);
      }
      return compareValues(aVal, bVal, orderSortOrder);
    });
  }, [orders, statusFilter, orderSearch, orderSortBy, orderSortOrder]);

  const processedTransactions = useMemo(() => {
    const q = txSearch.toLowerCase();
    const filtered = transactions.filter((tx) => {
      if (!q) return true;
      return (tx.id || "").toLowerCase().includes(q) || String(tx.amount || "").includes(q);
    });
    return [...filtered].sort((a, b) => {
      let aVal = a[txSortBy];
      let bVal = b[txSortBy];
      if (txSortBy === "transactionDateTime") {
        aVal = safeDate(aVal);
        bVal = safeDate(bVal);
      }
      return compareValues(aVal, bVal, txSortOrder);
    });
  }, [transactions, txSearch, txSortBy, txSortOrder]);

  const processedBanLogs = useMemo(() => {
    const q = banSearch.toLowerCase();
    if (!q) return banLogs;
    return banLogs.filter(
      (b) =>
        (b.banReason || "").toLowerCase().includes(q) ||
        String(b.userBanLogId || "").includes(q) ||
        String(b.bannedBy || "").toLowerCase().includes(q)
    );
  }, [banLogs, banSearch]);

  // -------------------------
  // Column Definitions
  // -------------------------
  const inventoryColumns = useMemo(
    () => [
      {
        key: "itemId",
        label: "Item ID",
        render: (row) => (
          <Typography fontWeight={600}>#{row.itemId || "N/A"}</Typography>
        ),
      },
      {
        key: "itemName",
        label: "Item Name",
        render: (row) => (
          <Typography fontWeight={600}>{row.itemName || "N/A"}</Typography>
        ),
      },
      {
        key: "quantity",
        label: "Quantity",
        render: (row) => (
          <Typography fontWeight={500}>
            {row.quantity?.toLocaleString() || "0"}
          </Typography>
        ),
      },
    ],
    []
  );

  const orderColumns = useMemo(() => [
    {
      key: "shopOrderId",
      label: "Order ID",
      sortable: true,
      render: (row) => (
        <Typography variant="body2" fontWeight={600}>#{row.shopOrderId}</Typography>
      ),
    },
    {
      key: "totalAmount",
      label: "Amount",
      sortable: true,
      align: "left",
      render: (row) => (
        <Typography variant="body2" fontWeight={700}>
          {(row.totalAmount || 0).toLocaleString()} VND
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Chip label={row.status || "N/A"} size="small" color={getStatusColor(row.status)} variant="soft" />
      ),
    },
    {
      key: "orderDate",
      label: "Date",
      sortable: true,
      render: (row) => row.orderDate ? new Date(row.orderDate).toLocaleDateString() : "N/A",
    },
  ], []);

  const transactionColumns = useMemo(() => [
    {
      key: "id",
      label: "Transaction ID",
      render: (row) => (
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, maxWidth: 160, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {row.id || "N/A"}
        </Typography>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      align: "left",
      render: (row) => (
        <Typography variant="body2" fontWeight={700}>
          {(row.amount || 0).toLocaleString()} VND
        </Typography>
      ),
    },
    {
      key: "transactionDateTime",
      label: "Date & Time",
      sortable: true,
      render: (row) => row.transactionDateTime ? new Date(row.transactionDateTime).toLocaleString() : "N/A",
    },
  ], []);

  const banLogColumns = useMemo(() => [
    {
      key: "userBanLogId",
      label: "ID",
      render: (row) => (
        <Typography variant="caption" fontWeight={600}>#{row.userBanLogId}</Typography>
      ),
    },
    {
      key: "banReason",
      label: "Reason",
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.banReason || "N/A"}</Typography>
      ),
    },
    {
      key: "bannedDate",
      label: "Banned Date",
      sortable: true,
      render: (row) => row.bannedDate ? new Date(row.bannedDate).toLocaleString() : "N/A",
    },
    {
      key: "bannedUntil",
      label: "Banned Until",
      sortable: true,
      render: (row) =>
        row.bannedUntil ? (
          <Chip label={new Date(row.bannedUntil).toLocaleString()} size="small" color="error" variant="outlined" />
        ) : (
          <Chip label="Indefinite" size="small" color="error" />
        ),
    },
    {
      key: "bannedBy",
      label: "Staff ID",
      render: (row) => (
        <Typography variant="caption" fontWeight={600}>{row.bannedBy ?? "N/A"}</Typography>
      ),
    },
  ], []);

  // -------------------------
  // Loading / Missing
  // -------------------------
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile || !user) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="User Not Found" breadcrumbs={[{ label: "Users", path: "/users" }]} />
        <Typography variant="h5" color="error" sx={{ mt: 2 }}>
          User profile data is missing or inaccessible.
        </Typography>
      </Box>
    );
  }

  const isBanned = user.bannedUntil && new Date(user.bannedUntil).getTime() > Date.now();

  const ROW1_HEIGHT = 320;
  const ROW2_HEIGHT = 500;

  return (
    <Box>
      <PageHeader
        title="User Profile"
        subtitle="Detailed view of player information and activity"
        breadcrumbs={[{ label: "Users", path: "/users" }, { label: fullName }]}
      />

      {/* Outer container: 2 rows stacked vertically, full width */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

        {/* ======== ROW 1: Profile (65%) + Inventory (35%) ======== */}
        <Box sx={{ display: "flex", gap: 3 }}>

          {/* Profile Card — 65% */}
          <Box sx={{ flex: "0 0 65%", minWidth: 0 }}>
            <Card
              sx={{
                p: 4,
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                height: ROW1_HEIGHT,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: 120,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={4} sx={{ position: "relative", pt: 4 }}>
                <Avatar
                  src={user.avatarUrl}
                  sx={{
                    width: 130,
                    height: 130,
                    border: "4px solid white",
                    boxShadow: theme.shadows[3],
                    bgcolor: "primary.main",
                    fontSize: "3rem",
                    flexShrink: 0,
                  }}
                >
                  {user.firstName ? user.firstName[0].toUpperCase() : "U"}
                </Avatar>

                <Box sx={{ flexGrow: 1, pt: { xs: 0, sm: 4 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={1.5}>
                    <Typography variant="h4" fontWeight={800}>{fullName}</Typography>
                    <Chip
                      label={isBanned ? "Banned" : "Active"}
                      color={isBanned ? "error" : "success"}
                      sx={{ fontWeight: 700, px: 1 }}
                    />
                  </Stack>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <UserIcon color="action" fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>{user.userName || "N/A"}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmailIcon color="action" fontSize="small" />
                        <Typography variant="body2">{user.email || "N/A"}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DateIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">User ID: {user.userId}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Card>
          </Box>

          {/* Inventory — remaining 35% */}
          <Box sx={{ flex: "1 1 0%", minWidth: 0 }}>
            <Card
              sx={{
                borderRadius: 3,
                height: ROW1_HEIGHT,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box sx={{ px: 2.5, pt: 2, pb: 1.5, flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <InventoryIcon color="primary" fontSize="small" />
                    <Typography variant="h6" fontWeight={700}>Inventory</Typography>
                    <Chip label={processedInventory.length} size="small" color="primary" />
                  </Stack>
                  <SearchBar value={inventorySearch} onChange={setInventorySearch} placeholder="Search items..." />
                </Stack>
              </Box>
              <Divider sx={{ borderStyle: "dashed" }} />
              <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
                <SortableTable
                  columns={inventoryColumns}
                  rows={processedInventory}
                  sortBy={null}
                  sortOrder={null}
                  onSort={() => {}}
                  emptyText="No items in inventory"
                />
              </TableContainer>
            </Card>
          </Box>

        </Box>

        {/* ======== ROW 2: Tabs (65%) + Ban Logs (35%) ======== */}
        <Box sx={{ display: "flex", gap: 3 }}>

          {/* Orders + Transactions Tabs — 65% */}
          <Box sx={{ flex: "0 0 65%", minWidth: 0 }}>
            <Card
              sx={{
                borderRadius: 3,
                height: ROW2_HEIGHT,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box sx={{ px: 2.5, pt: 2, flexShrink: 0 }}>
                <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
                  <Tab
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <OrderIcon fontSize="small" />
                        <span style={{ fontWeight: 700 }}>Purchase Orders</span>
                        <Chip label={orders.length} size="small" color="info" />
                      </Stack>
                    }
                  />
                  <Tab
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TransactionIcon fontSize="small" />
                        <span style={{ fontWeight: 700 }}>Transactions</span>
                        <Chip label={transactions.length} size="small" color="warning" />
                      </Stack>
                    }
                  />
                </Tabs>
              </Box>
              <Divider sx={{ borderStyle: "dashed" }} />

              {/* Search/filter bar — fixed, doesn't scroll */}
              <Box sx={{ px: 2.5, pt: 2, pb: 1, flexShrink: 0 }}>
                {activeTab === 0 && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="flex-end">
                    <SearchBar value={orderSearch} onChange={setOrderSearch} placeholder="Search orders..." />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Status</InputLabel>
                      <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                )}
                {activeTab === 1 && (
                  <Stack direction="row" justifyContent="flex-end">
                    <SearchBar value={txSearch} onChange={setTxSearch} placeholder="Search transactions..." />
                  </Stack>
                )}
              </Box>

              {/* Scrollable table */}
              <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
                {activeTab === 0 && (
                  <SortableTable
                    columns={orderColumns}
                    rows={processedOrders}
                    sortBy={orderSortBy}
                    sortOrder={orderSortOrder}
                    onSort={(key) => handleSortToggle(key, orderSortBy, orderSortOrder, setOrderSortBy, setOrderSortOrder)}
                    emptyText="No orders found"
                  />
                )}
                {activeTab === 1 && (
                  <SortableTable
                    columns={transactionColumns}
                    rows={processedTransactions}
                    sortBy={txSortBy}
                    sortOrder={txSortOrder}
                    onSort={(key) => handleSortToggle(key, txSortBy, txSortOrder, setTxSortBy, setTxSortOrder)}
                    emptyText="No transactions found"
                  />
                )}
              </TableContainer>
            </Card>
          </Box>

          {/* Ban Logs — remaining 35% */}
          <Box sx={{ flex: "1 1 0%", minWidth: 0 }}>
            <Card
              sx={{
                borderRadius: 3,
                height: ROW2_HEIGHT,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box sx={{ px: 2.5, pt: 2, pb: 1.5, flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <GavelIcon color="error" fontSize="small" />
                    <Typography variant="h6" fontWeight={700}>Ban History</Typography>
                    <Chip label={processedBanLogs.length} size="small" color="error" />
                  </Stack>
                  <SearchBar value={banSearch} onChange={setBanSearch} placeholder="Search bans..." />
                </Stack>
              </Box>
              <Divider sx={{ borderStyle: "dashed" }} />
              <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
                <SortableTable
                  columns={banLogColumns}
                  rows={processedBanLogs}
                  sortBy={null}
                  sortOrder={null}
                  onSort={() => {}}
                  emptyText="No ban history found"
                />
              </TableContainer>
            </Card>
          </Box>

        </Box>

      </Box>
    </Box>
  );
};

export default UserProfilePage;