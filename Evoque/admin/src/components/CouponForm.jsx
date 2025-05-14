import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

const CouponForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchase: '0',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true
  });

  useEffect(() => {
    // Set auth token for API requests
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    if (id) {
      fetchCoupon();
    }
  }, [id]);

  const fetchCoupon = async () => {
    try {
      const response = await axios.get(`${API_URL}/coupons/${id}`);
      const coupon = response.data.coupon;
      setFormData({
        ...coupon,
        startDate: formatDateForInput(coupon.startDate),
        endDate: formatDateForInput(coupon.endDate),
        minPurchase: coupon.minPurchase?.toString() || '0',
        maxDiscount: coupon.maxDiscount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || ''
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching coupon:', error);
      setError('Failed to load coupon details. Please try again.');
    }
  };

  const formatDateForInput = (date) => {
    return date ? new Date(date).toISOString().split('T')[0] : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.code) return 'Coupon code is required';
    if (!formData.description) return 'Description is required';
    if (!formData.discountValue) return 'Discount value is required';
    if (!formData.startDate) return 'Start date is required';
    if (!formData.endDate) return 'End date is required';
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      return 'End date must be after start date';
    }
    if (formData.discountType === 'PERCENTAGE' && Number(formData.discountValue) > 100) {
      return 'Percentage discount cannot be more than 100%';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Check if token exists
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('You must be logged in to perform this action');
        navigate('/login');
        return;
      }

      const dataToSubmit = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        code: formData.code.toUpperCase()
      };

      if (id) {
        await axios.put(`${API_URL}/coupons/${id}`, dataToSubmit);
      } else {
        await axios.post(`${API_URL}/coupons`, dataToSubmit);
      }
      navigate('/coupons');
    } catch (error) {
      console.error('Error saving coupon:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to save coupon. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Coupon' : 'Add New Coupon'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Coupon Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            inputProps={{ style: { textTransform: 'uppercase' } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={2}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Discount Type</InputLabel>
            <Select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              label="Discount Type"
            >
              <MenuItem value="PERCENTAGE">Percentage</MenuItem>
              <MenuItem value="FIXED">Fixed Amount</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            required
            fullWidth
            label={`Discount Value (${formData.discountType === 'PERCENTAGE' ? '%' : '₹'})`}
            name="discountValue"
            type="number"
            value={formData.discountValue}
            onChange={handleChange}
            inputProps={{ min: 0, max: formData.discountType === 'PERCENTAGE' ? 100 : undefined }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Minimum Purchase Amount (₹)"
            name="minPurchase"
            type="number"
            value={formData.minPurchase}
            onChange={handleChange}
            inputProps={{ min: 0 }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Maximum Discount Amount (₹)"
            name="maxDiscount"
            type="number"
            value={formData.maxDiscount}
            onChange={handleChange}
            inputProps={{ min: 0 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Valid From"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Valid Until"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Maximum Usage Count"
            name="usageLimit"
            type="number"
            value={formData.usageLimit}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            helperText="Leave empty for unlimited usage"
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              {id ? 'Update Coupon' : 'Create Coupon'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={() => navigate('/coupons')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CouponForm; 