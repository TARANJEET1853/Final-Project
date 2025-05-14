import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Delete,
  ExitToApp,
  Inventory,
  Category,
  ShoppingCart,
  AttachMoney,
  LocalShipping,
  Warning,
  Pending,
  LocalMall,
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config/api';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    recentOrders: []
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Not authenticated');
        navigate('/login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Fetch all data in parallel
      const [ordersResponse, productsResponse, categoriesResponse] = await Promise.all([
        axios.get(`${API_URL}/orders`, { headers }),
        axios.get(`${API_URL}/products`, { headers }),
        axios.get(`${API_URL}/category`, { headers })
      ]);

      console.log('Categories Response:', categoriesResponse);

      // Check if products exist
      const products = productsResponse.data || [];
      setProducts(products);

      // Check if orders exist and calculate stats
      const orders = ordersResponse.data.orders || [];
      const deliveredOrders = orders.filter(order => order.status === 'Delivered');
      
      // Get categories from the response
      const categories = categoriesResponse.data?.categories || [];
      
      console.log('Processed Categories:', categories);
      
      const newStats = {
        totalRevenue: deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        totalOrders: orders.length,
        pendingOrders: orders.filter(order => order.status === 'Pending').length,
        processingOrders: orders.filter(order => order.status === 'Processing').length,
        shippedOrders: orders.filter(order => order.status === 'Shipped').length,
        deliveredOrders: deliveredOrders.length,
        cancelledOrders: orders.filter(order => order.status === 'Cancelled').length,
        totalProducts: products.length,
        totalCategories: categories.length,
        recentOrders: orders.slice(0, 5) // Get 5 most recent orders
      };

      console.log('New Stats:', newStats);

      setStats(newStats);
      setError('');
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error fetching dashboard data';
      setError(errorMessage);
      
      // Reset stats on error
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalProducts: 0,
        totalCategories: 0,
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (response.data.success) {
        fetchDashboardData();
      } else {
        setError('Failed to delete product');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting product');
    }
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          {icon}
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        </Box>
        <Typography 
          variant="h4" 
          component="div" 
          color={color}
          sx={{ 
            fontSize: { 
              xs: '1.5rem', 
              sm: '2rem', 
              md: '2.125rem' 
            } 
          }}
        >
          {typeof value === 'number' && title.includes('Revenue') ? `₹${value.toFixed(2)}` : value}
        </Typography>
      </CardContent>
      {onClick && (
        <CardActions>
          <Button size="small" onClick={onClick} fullWidth>
            View Details
          </Button>
        </CardActions>
      )}
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box 
        sx={{ 
          mt: { xs: 2, sm: 4 }, 
          mb: { xs: 2, sm: 4 }, 
          px: { xs: 2, sm: 0 }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 4 
          }}
        >
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontSize: { 
                xs: '1.75rem', 
                sm: '2.125rem' 
              } 
            }}
          >
            Admin Dashboard
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleLogout}
            startIcon={<ExitToApp />}
            fullWidth={false}
          >
            Logout
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue}
              icon={<AttachMoney sx={{ fontSize: { xs: 30, sm: 40 } }} color="primary" />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={<ShoppingCart sx={{ fontSize: { xs: 30, sm: 40 } }} color="info" />}
              color="info.main"
              onClick={() => navigate('/orders')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders}
              icon={<Warning sx={{ fontSize: { xs: 30, sm: 40 } }} color="warning" />}
              color="warning.main"
              onClick={() => navigate('/orders')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Processing Orders"
              value={stats.processingOrders}
              icon={<Pending sx={{ fontSize: { xs: 30, sm: 40 } }} color="info" />}
              color="info.main"
              onClick={() => navigate('/orders')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Shipped Orders"
              value={stats.shippedOrders}
              icon={<LocalShipping sx={{ fontSize: { xs: 30, sm: 40 } }} color="primary" />}
              color="primary.main"
              onClick={() => navigate('/orders')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Delivered Orders"
              value={stats.deliveredOrders}
              icon={<LocalMall sx={{ fontSize: { xs: 30, sm: 40 } }} color="success" />}
              color="success.main"
              onClick={() => navigate('/orders')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={<Inventory sx={{ fontSize: { xs: 30, sm: 40 } }} color="primary" />}
              color="primary.main"
              onClick={() => navigate('/products')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Categories"
              value={stats.totalCategories}
              icon={<Category sx={{ fontSize: { xs: 30, sm: 40 } }} color="secondary" />}
              color="secondary.main"
              onClick={() => navigate('/categories')}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <ShoppingCart sx={{ fontSize: 30, mr: 2 }} color="primary" />
                  <Typography variant="h5">Recent Orders</Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.recentOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>{order._id.slice(-6)}</TableCell>
                          <TableCell>{order.user?.fullName || 'Guest'}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Typography
                              component="span"
                              sx={{
                                color: order.status === 'Delivered'
                                  ? 'success.main'
                                  : order.status === 'Pending'
                                  ? 'warning.main'
                                  : order.status === 'Cancelled'
                                  ? 'error.main'
                                  : 'info.main'
                              }}
                            >
                              {order.status}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              onClick={() => navigate('/orders')}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate('/orders')}
                  fullWidth
                >
                  View All Orders
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 