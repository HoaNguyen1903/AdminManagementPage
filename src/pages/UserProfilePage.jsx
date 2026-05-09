import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
  alpha,
  useTheme,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
  ReceiptLong as OrderIcon,
  History as TransactionIcon,
  Email as EmailIcon,
  CalendarToday as DateIcon,
  AccountCircle as UserIcon,
} from "@mui/icons-material";

import PageHeader from "../components/PageHeader";
import { userService } from "../api/services";

// -------------------------
// Reusable Helpers
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

  if (typeof a === "number" && typeof b === "number") {
    return isAsc ? a - b : b - a;
  }

  // Compare Date
  if (a instanceof Date && b instanceof Date) {
    return isAsc ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
  }

  // Compare String fallback
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
const SortableTable = ({
  columns,
  rows,
  sortBy,
  sortOrder,
  onSort,
  emptyText = "No data found",
  maxHeight = 420,
}) => {
  return (
    <TableContainer sx={{ maxHeight }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align || "left"}>
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
              <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
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
    </TableContainer>
  );
};

const UserProfilePage = () => {
  const { id } = useParams();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Orders state
  const [orderSortBy, setOrderSortBy] = useState("orderDate");
  const [orderSortOrder, setOrderSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");

  // Transactions state
  const [txSortBy, setTxSortBy] = useState("transactionDateTime");
  const [txSortOrder, setTxSortOrder] = useState("desc");

  // Tabs state
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

  // -------------------------
  // Processed Orders
  // -------------------------
  const processedOrders = useMemo(() => {
    const filtered = orders.filter((o) => {
      if (statusFilter === "all") return true;
      return o.status?.toLowerCase() === statusFilter.toLowerCase();
    });

    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[orderSortBy];
      let bVal = b[orderSortBy];

      if (orderSortBy === "orderDate" || orderSortBy === "createdAt") {
        aVal = safeDate(aVal);
        bVal = safeDate(bVal);
      }

      return compareValues(aVal, bVal, orderSortOrder);
    });

    return sorted;
  }, [orders, statusFilter, orderSortBy, orderSortOrder]);

  // -------------------------
  // Processed Transactions
  // -------------------------
  const processedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      let aVal = a[txSortBy];
      let bVal = b[txSortBy];

      if (txSortBy === "transactionDateTime") {
        aVal = safeDate(aVal);
        bVal = safeDate(bVal);
      }

      return compareValues(aVal, bVal, txSortOrder);
    });

    return sorted;
  }, [transactions, txSortBy, txSortOrder]);

  // -------------------------
  // Table Column Definitions
  // -------------------------
  const inventoryColumns = useMemo(
    () => [
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
      },
      {
        key: "obtainedDate",
        label: "Obtained Date",
        render: (row) =>
          row.obtainedDate
            ? new Date(row.obtainedDate).toLocaleDateString()
            : "N/A",
      },
    ],
    []
  );

  const orderColumns = useMemo(
    () => [
      {
        key: "shopOrderId",
        label: "Order ID",
        sortable: true,
        render: (row) => `#${row.shopOrderId}`,
      },
      {
        key: "totalAmount",
        label: "Amount",
        sortable: true,
        align: "right",
        render: (row) => (
          <Typography fontWeight={700}>
            {(row.totalAmount || 0).toLocaleString()} VND
          </Typography>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <Chip
            label={row.status || "N/A"}
            size="small"
            color={getStatusColor(row.status)}
            variant="soft"
          />
        ),
      },
      {
        key: "orderDate",
        label: "Date",
        sortable: true,
        render: (row) =>
          row.orderDate ? new Date(row.orderDate).toLocaleDateString() : "N/A",
      },
    ],
    []
  );

  const transactionColumns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (row) => (
          <Typography
            sx={{
              fontWeight: 600,
              maxWidth: 150,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.id || "N/A"}
          </Typography>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        sortable: true,
        align: "right",
        render: (row) => (
          <Typography fontWeight={700}>
            {(row.amount || 0).toLocaleString()} VND
          </Typography>
        ),
      },
      {
        key: "transactionDateTime",
        label: "Date",
        sortable: true,
        render: (row) =>
          row.transactionDateTime
            ? new Date(row.transactionDateTime).toLocaleString()
            : "N/A",
      },
    ],
    []
  );

  // -------------------------
  // Loading / Missing
  // -------------------------
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profile || !user) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          title="User Not Found"
          breadcrumbs={[{ label: "Users", path: "/users" }]}
        />
        <Typography variant="h5" color="error" sx={{ mt: 2 }}>
          User profile data is missing or inaccessible.
        </Typography>
      </Box>
    );
  }

  const isBanned =
    user.bannedUntil && new Date(user.bannedUntil).getTime() > Date.now();

  return (
    <Box>
      <PageHeader
        title="User Profile"
        subtitle="Detailed view of player information and activity"
        breadcrumbs={[{ label: "Users", path: "/users" }, { label: fullName }]}
      />

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12}>
          <Card sx={{ p: 4, borderRadius: 3, position: "relative", overflow: "hidden" }}>
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

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              sx={{ position: "relative", pt: 4 }}
            >
              <Avatar
                src={user.avatarUrl}
                sx={{
                  width: 140,
                  height: 140,
                  border: "4px solid white",
                  boxShadow: theme.shadows[3],
                  bgcolor: "primary.main",
                  fontSize: "3rem",
                }}
              >
                {user.firstName ? user.firstName[0].toUpperCase() : "U"}
              </Avatar>

              <Box sx={{ flexGrow: 1, pt: { xs: 0, md: 4 } }}>
                <Typography variant="h2" fontWeight="800" gutterBottom>
                  {fullName}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <UserIcon color="action" fontSize="small" />
                      <Typography variant="body1" fontWeight="600">
                        {user.userName || "N/A"}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon color="action" fontSize="small" />
                      <Typography variant="body1">{user.email || "N/A"}</Typography>
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

              <Box sx={{ pt: { xs: 0, md: 4 }, textAlign: "right" }}>
                <Chip
                  label={isBanned ? "Banned" : "Active"}
                  color={isBanned ? "error" : "success"}
                  sx={{ fontWeight: 700, px: 2 }}
                />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Inventory */}
        <Grid item xs={12}>
          <Accordion
            defaultExpanded
            sx={{
              borderRadius: 2,
              "&:before": { display: "none" },
              boxShadow: "0 8px 16px 0 rgba(145, 158, 171, 0.16)",
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <InventoryIcon color="primary" />
                <Typography variant="h6" fontWeight="700">
                  User Inventory
                </Typography>
                <Chip label={inventory.length} size="small" color="primary" />
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 0, pt: 0 }}>
              <SortableTable
                columns={inventoryColumns}
                rows={inventory}
                sortBy={null}
                sortOrder={null}
                onSort={() => {}}
                emptyText="No items in inventory"
                maxHeight={300}
              />
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Orders + Transactions Tabs */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 8px 16px 0 rgba(145, 158, 171, 0.16)",
              overflow: "hidden",
            }}
          >
            {/* Tab Header */}
            <Box sx={{ px: 2.5, pt: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <OrderIcon fontSize="small" />
                      <Typography fontWeight={700}>Purchase Orders</Typography>
                      <Chip label={processedOrders.length} size="small" color="info" />
                    </Stack>
                  }
                />
                <Tab
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TransactionIcon fontSize="small" />
                      <Typography fontWeight={700}>Transaction History</Typography>
                      <Chip
                        label={processedTransactions.length}
                        size="small"
                        color="warning"
                      />
                    </Stack>
                  }
                />
              </Tabs>
            </Box>

            <Divider sx={{ borderStyle: "dashed" }} />

            {/* Tab Content */}
            <Box sx={{ p: 2.5 }}>
              {/* Orders */}
              {activeTab === 0 && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mb: 2,
                    }}
                  >
                    <FormControl size="small" sx={{ minWidth: 160 }}>
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

                  <SortableTable
                    columns={orderColumns}
                    rows={processedOrders}
                    sortBy={orderSortBy}
                    sortOrder={orderSortOrder}
                    onSort={(key) =>
                      handleSortToggle(
                        key,
                        orderSortBy,
                        orderSortOrder,
                        setOrderSortBy,
                        setOrderSortOrder
                      )
                    }
                    emptyText="No orders found"
                    maxHeight={420}
                  />
                </>
              )}

              {/* Transactions */}
              {activeTab === 1 && (
                <SortableTable
                  columns={transactionColumns}
                  rows={processedTransactions}
                  sortBy={txSortBy}
                  sortOrder={txSortOrder}
                  onSort={(key) =>
                    handleSortToggle(
                      key,
                      txSortBy,
                      txSortOrder,
                      setTxSortBy,
                      setTxSortOrder
                    )
                  }
                  emptyText="No transactions found"
                  maxHeight={420}
                />
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfilePage;