import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  IconButton,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const checkAndSetToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return false;
    }
    // Set token in axios headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  };

  useEffect(() => {
    if (checkAndSetToken()) {
      fetchCoupons();
    }
  }, [navigate]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);

      // Double check token before request
      if (!checkAndSetToken()) {
        return;
      }

      console.log('Fetching coupons from:', `${API_URL}/coupons/admin`);
      console.log('Auth header:', axios.defaults.headers.common['Authorization']);

      const response = await axios.get(`${API_URL}/coupons/admin`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch coupons');
      }

      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, clearing and redirecting');
        localStorage.removeItem('adminToken');
        delete axios.defaults.headers.common['Authorization'];
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setError(error.message || 'Failed to load coupons. Please try again later.');
      }
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!checkAndSetToken()) {
      return;
    }

    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const response = await axios.delete(`${API_URL}/coupons/${id}`);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to delete coupon');
        }

        fetchCoupons();
        setError(null);
      } catch (error) {
        console.error('Error deleting coupon:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          delete axios.defaults.headers.common['Authorization'];
          setError('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          setError(error.message || 'Failed to delete coupon. Please try again later.');
        }
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getCouponStatus = (validUntil) => {
    try {
      return new Date(validUntil) > new Date() ? 'Active' : 'Expired';
    } catch (error) {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Coupons
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (checkAndSetToken()) {
              navigate('/add-coupon');
            }
          }}
        >
          Add New Coupon
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {coupons.length === 0 && !error ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No coupons found. Create your first coupon by clicking the "Add New Coupon" button.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Discount Type</TableCell>
                <TableCell>Discount Value</TableCell>
                <TableCell>Valid From</TableCell>
                <TableCell>Valid Until</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>{coupon.code}</TableCell>
                  <TableCell>{coupon.discountType}</TableCell>
                  <TableCell>
                    {coupon.discountType === 'PERCENTAGE' 
                      ? `${coupon.discountValue}%` 
                      : `$${coupon.discountValue}`}
                  </TableCell>
                  <TableCell>{formatDate(coupon.startDate)}</TableCell>
                  <TableCell>{formatDate(coupon.endDate)}</TableCell>
                  <TableCell>
                    {getCouponStatus(coupon.endDate)}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        if (checkAndSetToken()) {
                          navigate(`/edit-coupon/${coupon._id}`);
                        }
                      }}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(coupon._id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default CouponList; 