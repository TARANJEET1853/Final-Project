import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  Rating,
  Chip,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const ProductCard = ({ product }) => (
    <Card>
      <CardMedia
        component="img"
        height="140"
        image={product.images[0]}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Typography variant="h6" noWrap>{product.name}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {product.Category.name}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body1" color="primary">
            ₹{product.price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            MRP: ₹{product.mrp}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" mt={1}>
          <Rating value={product.rating} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" ml={1}>
            ({product.numReviews})
          </Typography>
        </Box>
        {product.isFeatured && (
          <Box mt={1}>
            <Chip icon={<StarIcon />} label="Featured" color="primary" size="small" />
          </Box>
        )}
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => handleEdit(product._id)}
        >
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => handleDelete(product._id)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }} 
        mb={3}
        gap={2}
      >
        <Typography variant="h4" component="h1">Products</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-product')}
          fullWidth={isMobile}
        >
          Add New Product
        </Button>
      </Box>

      {isMobile ? (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} key={product._id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>MRP</TableCell>
                <TableCell>Selling Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.Category.name}</TableCell>
                  <TableCell>₹{product.mrp}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>{product.countInStock}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Rating value={product.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        ({product.numReviews})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {product.isFeatured ? (
                      <Chip icon={<StarIcon />} label="Featured" color="primary" size="small" />
                    ) : (
                      <Chip label="Not Featured" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(product._id)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(product._id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProductList; 