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
import { API_URL } from '../../../config/api';

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
      navigate('/signin');
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
        navigate('/signin');
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

      // Check if products exist
      const products = productsResponse.data || [];
      setProducts(products);

      // Check if orders exist and calculate stats
      const orders = ordersResponse.data.orders || [];
      const deliveredOrders = orders.filter(order => order.status === 'Delivered');
      
      // Get categories from the response
      const categories = categoriesResponse.data?.categories || [];
      
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
        recentOrders: orders.slice(0, 5)
      };

      setStats(newStats);
      setError('');
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error fetching dashboard data';
      setError(errorMessage);
      
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
    navigate('/signin');
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

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue}
              icon={<AttachMoney color="primary" />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={<ShoppingCart color="secondary" />}
              color="secondary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={<Inventory color="success" />}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Categories"
              value={stats.totalCategories}
              icon={<Category color="info" />}
              color="info.main"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders}
              icon={<Pending color="warning" />}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Shipped Orders"
              value={stats.shippedOrders}
              icon={<LocalShipping color="info" />}
              color="info.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Delivered Orders"
              value={stats.deliveredOrders}
              icon={<LocalMall color="success" />}
              color="success.main"
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Recent Products
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.slice(0, 5).map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 