import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  PhotoCamera
} from '@mui/icons-material';
import Header from '../../Header';
import Footer from '../../Footer';
import api from '../../../services/api';
import { API_URL } from '../../../config/api';
import './styles.css';

const orderStatuses = {
  'Pending': { color: 'warning' },
  'Processing': { color: 'info' },
  'Shipped': { color: 'primary' },
  'Delivered': { color: 'success' },
  'Cancelled': { color: 'error' }
};

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    contactNo: '',
    avatar: null,
    _id: null
  });

  const [orders, setOrders] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '',
    contactNo: '',
  });

  useEffect(() => {
    fetchUserData();
    fetchOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      console.log('Current localStorage:', localStorage);

      if (!token) {
        console.log('No token found, redirecting to signin');
        navigate('/signin');
        return;
      }

      console.log('Attempting to fetch profile data...');
      const response = await api.get('/user/profile');
      console.log('API Response:', response);

      if (response.data.success) {
        console.log('Setting user data:', response.data.user);
        setUserData(response.data.user);
        setFormData({
          fullName: response.data.user.fullName,
          contactNo: response.data.user.contactNo || '',
        });
        if (response.data.user.avatar) {
          setAvatarPreview(response.data.user.avatar);
        }
      } else {
        console.error('API returned success: false:', response.data.message);
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Detailed error in fetchUserData:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setError(`Failed to fetch user data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPG, JPEG, or PNG)');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('contactNo', formData.contactNo);
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      // Check the content type of the response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Expected JSON response but got HTML. Please check if the server is running.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.success) {
        // Update local user data
        setUserData(prev => ({
          ...prev,
          ...formData,
          avatar: data.user.avatar
        }));

        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          fullName: data.user.fullName,
          avatar: data.user.avatar,
          contactNo: data.user.contactNo
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Dispatch an event to notify other components
        window.dispatchEvent(new Event('userUpdated'));

        setEditMode(false);
        setError('');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.message.includes('Expected JSON response')) {
        setError('Server error: Please check if the server is running');
      } else {
        setError(error.message || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleViewOrder = (order) => {
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
      <>
        <Header />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 200px)">
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" className="profile-container">
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" variant="h6" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setError('');
                fetchUserData();
              }}
            >
              Retry
            </Button>
          </Paper>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" className="profile-container">
        <Grid container spacing={3}>
          {/* User Profile Section */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    editMode && (
                      <IconButton 
                        color="primary" 
                        aria-label="upload picture" 
                        component="label"
                        sx={{
                          bgcolor: 'white',
                          ':hover': { bgcolor: 'grey.100' }
                        }}
                      >
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={handleAvatarChange}
                        />
                        <PhotoCamera />
                      </IconButton>
                    )
                  }
                >
                  <Avatar
                    src={avatarPreview}
                    sx={{
                      width: 100,
                      height: 100,
                      fontSize: '2.5rem',
                      mb: 2
                    }}
                  >
                    {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : ''}
                  </Avatar>
                </Badge>
                <Typography variant="h5" gutterBottom>
                  {userData.fullName}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {userData.email}
                </Typography>
                {error && (
                  <Typography color="error" sx={{ mt: 1, mb: 1 }}>
                    {error}
                  </Typography>
                )}
                {!editMode ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    variant="outlined"
                    sx={{ mt: 2 }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Contact Number"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          setEditMode(false);
                          setFormData({
                            fullName: userData.fullName,
                            contactNo: userData.contactNo || '',
                          });
                          setAvatarPreview(userData.avatar);
                          setAvatarFile(null);
                          setError('');
                        }}
                        variant="outlined"
                        color="error"
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Order History Section */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Order History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order._id.slice(-6)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={orderStatuses[order.status]?.color || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewOrder(order)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Order Details Dialog */}
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
                  <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                  <Typography>{selectedOrder.shippingAddress.fullName}</Typography>
                  <Typography>{selectedOrder.shippingAddress.addressLine1}</Typography>
                  {selectedOrder.shippingAddress.addressLine2 && (
                    <Typography>{selectedOrder.shippingAddress.addressLine2}</Typography>
                  )}
                  <Typography>
                    {[
                      selectedOrder.shippingAddress.city,
                      selectedOrder.shippingAddress.state,
                      selectedOrder.shippingAddress.pinCode
                    ].filter(Boolean).join(', ')}
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
                  <Typography variant="h6" gutterBottom>Order Information</Typography>
                  <Typography>Status: 
                    <Chip
                      label={selectedOrder.status}
                      color={orderStatuses[selectedOrder.status]?.color || 'default'}
                      size="small"
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
      </Container>
      <Footer />
    </>
  );
};

export default Profile; 