import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    IconButton,
    Box,
    TablePagination,
    Button,
    TableSortLabel
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

const DataTable = ({
    columns,
    data,
    onView,
    onEdit,
    onDelete,
    viewLabel = "View",
    searchPlaceholder = "Search...",
    disableActions = false,
    hideSearch = false
}) => {
    const theme = useTheme();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('');

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const filteredData = data.filter((row) =>
        Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (!orderBy) return 0;
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        if (bValue < aValue) {
            return order === 'asc' ? 1 : -1;
        }
        if (bValue > aValue) {
            return order === 'asc' ? -1 : 1;
        }
        return 0;
    });

    const paginatedData = sortedData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', p: 3, borderRadius: 3 }}>
            {!hideSearch && (
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
                    <TextField
                        placeholder={searchPlaceholder}
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                        name={`search-${Math.random().toString(36).substring(7)}`}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon sx={{ color: 'text.disabled', mr: 1 }} />
                            ),
                            sx: {
                                borderRadius: 2,
                                width: { xs: '100%', sm: 300 },
                                bgcolor: alpha(theme.palette.text.primary, 0.04),
                                '& fieldset': { border: 'none' },
                                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) },
                            }
                        }}
                    />
                </Box>
            )}
            <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                    sortDirection={orderBy === column.id ? order : false}
                                >
                                    <TableSortLabel
                                        active={orderBy === column.id}
                                        direction={orderBy === column.id ? order : 'asc'}
                                        onClick={() => handleRequestSort(column.id)}
                                        sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            {!disableActions && (
                                <TableCell align="right" style={{ minWidth: 100, fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }}>
                                    Actions
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => {
                            return (
                                <TableRow
                                    hover
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={index}
                                    onClick={() => {
                                        if (window.getSelection().toString()) return;
                                        onView && onView(row);
                                    }} sx={{
                                        cursor: onView ? 'pointer' : 'default',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.04) + ' !important'
                                        }
                                    }}
                                >
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell key={column.id} align={column.align} sx={{ fontSize: '0.875rem' }}>
                                                {column.render
                                                    ? column.render(row)
                                                    : column.format
                                                        ? column.format(value)
                                                        : value}
                                            </TableCell>
                                        );
                                    })}
                                    {!disableActions && (
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                {onView && (
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onView(row);
                                                        }}
                                                        size="small"
                                                        sx={{ color: 'primary.main' }}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                {onEdit && (
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(row);
                                                        }}
                                                        size="small"
                                                        sx={{ color: 'info.main' }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                {onDelete && (
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(row);
                                                        }}
                                                        size="small"
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: `1px dashed ${theme.palette.divider}` }}
            />
        </Paper>
    );
};

export default DataTable;
