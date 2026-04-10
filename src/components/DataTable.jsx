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
    Delete as DeleteIcon
} from '@mui/icons-material';

const DataTable = ({
    columns,
    data,
    onView,
    onEdit,
    onDelete,
    viewLabel = "View",
    searchPlaceholder = "Search...",
    disableActions = false
}) => {
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
        <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <TextField
                    label={searchPlaceholder}
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="new-password"
                    name={`search-${Math.random().toString(36).substring(7)}`}
                />
            </Box>
            <TableContainer>
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
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            {!disableActions && (
                                <TableCell align="right" style={{ minWidth: 100 }}>
                                    {/* Actions column with blank header */}
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell key={column.id} align={column.align}>
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
                                            {onView && (
                                                <IconButton onClick={() => onView(row)} color="primary" size="small">
                                                    <ViewIcon />
                                                </IconButton>
                                            )}
                                            {onEdit && (
                                                <IconButton onClick={() => onEdit(row)} color="info" size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            {onDelete && (
                                                <IconButton onClick={() => onDelete(row)} color="error" size="small">
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
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
            />
        </Paper>
    );
};

export default DataTable;
