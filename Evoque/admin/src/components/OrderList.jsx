import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { API_URL } from '../config/api';

const orderStatuses = [
  { value: 'Pending', color: 'warning' },
  { value: 'Processing', color: 'info' },
  { value: 'Shipped', color: 'primary' },
  { value: 'Delivered', color: 'success' },
  { value: 'Cancelled', color: 'error' },
];

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        
        // Calculate total revenue from delivered orders
        const revenue = response.data.orders
          .filter(order => order.status === 'Delivered')
          .reduce((sum, order) => sum + order.totalAmount, 0);
        setTotalRevenue(revenue);

        // Count pending orders
        const pending = response.data.orders.filter(order => order.status === 'Pending').length;
        setPendingOrders(pending);
      } else {
        setError(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>Orders Management</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box display="flex" gap={4} mb={3}>
          <Paper elevation={3} sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="h6" color="primary">Total Revenue</Typography>
            <Typography variant="h4">₹{totalRevenue.toFixed(2)}</Typography>
          </Paper>
          <Paper elevation={3} sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="h6" color="warning.main">Pending Orders</Typography>
            <Typography variant="h4">{pendingOrders}</Typography>
          </Paper>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id.slice(-6)}</TableCell>
                <TableCell>{order.user?.fullName || 'Guest'}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      size="small"
                      sx={{ minWidth: 120 }}
                      renderValue={(selected) => (
                        <Chip
                          label={selected}
                          color={orderStatuses.find(s => s.value === selected)?.color || 'default'}
                          size="small"
                        />
                      )}
                    >
                      {orderStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          <Chip
                            label={status.value}
                            color={status.color}
                            size="small"
                            sx={{ width: '100%' }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewDetails(order)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Order Details #{selectedOrder._id.slice(-6)}
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                <Typography>Name: {selectedOrder.user?.fullName}</Typography>
                <Typography>Email: {selectedOrder.user?.email}</Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                <Typography>{selectedOrder.shippingAddress.fullName}</Typography>
                <Typography>{selectedOrder.shippingAddress.addressLine1}</Typography>
                {selectedOrder.shippingAddress.addressLine2 && (
                  <Typography>{selectedOrder.shippingAddress.addressLine2}</Typography>
                )}
                <Typography>
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pinCode}
                </Typography>
                <Typography>Phone: {selectedOrder.shippingAddress.phone}</Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Order Items</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>{item.size}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right"><strong>Total:</strong></TableCell>
                        <TableCell align="right"><strong>₹{selectedOrder.totalAmount.toFixed(2)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>Order Status</Typography>
                <Typography>Current Status: 
                  <Chip
                    label={selectedOrder.status}
                    color={orderStatuses.find(s => s.value === selectedOrder.status)?.color || 'default'}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography>Payment Method: {selectedOrder.paymentMethod}</Typography>
                <Typography>Payment Status: {selectedOrder.paymentStatus}</Typography>
                <Typography>Order Date: {formatDate(selectedOrder.createdAt)}</Typography>
                <Typography>Last Updated: {formatDate(selectedOrder.updatedAt)}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrderList; 