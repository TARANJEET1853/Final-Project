import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Paper, Typography, Chip } from '@mui/material';
import Header from '../../Header';
import Footer from '../../Footer';
import './styles.css';
import { API_URL } from '../../../config/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setOrders(data.orders);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Processing': return 'info';
            case 'Shipped': return 'primary';
            case 'Delivered': return 'success';
            case 'Cancelled': return 'error';
            default: return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="orders-loading">
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="orders-container">
                <div className="orders-content">
                    <Typography variant="h4" className="orders-title">
                        My Orders
                    </Typography>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {orders.length === 0 ? (
                        <Typography variant="body1" className="no-orders">
                            You haven't placed any orders yet.
                        </Typography>
                    ) : (
                        orders.map((order) => (
                            <Paper key={order._id} className="order-card">
                                <div className="order-header">
                                    <div>
                                        <Typography variant="h6">
                                            Order #{order._id.slice(-6)}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Placed on {formatDate(order.createdAt)}
                                        </Typography>
                                    </div>
                                    <Chip
                                        label={order.status}
                                        color={getStatusColor(order.status)}
                                        variant="outlined"
                                    />
                                </div>

                                <div className="order-items">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <img
                                                src={item.productImage || (item.product && item.product.image)}
                                                alt={item.productName || (item.product && item.product.name)}
                                                className="item-image"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                            <div className="item-details">
                                                <Typography variant="body1">
                                                    {item.productName || (item.product && item.product.name)}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Size: {item.size}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Quantity: {item.quantity}
                                                </Typography>
                                            </div>
                                            <Typography variant="body1" className="item-price">
                                                ₹{item.price.toFixed(2)}
                                            </Typography>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="shipping-address">
                                        <Typography variant="subtitle2">
                                            Shipping Address:
                                        </Typography>
                                        <Typography variant="body2">
                                            {order.shippingAddress.fullName}<br />
                                            {order.shippingAddress.addressLine1}<br />
                                            {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2}<br />`}
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}<br />
                                            Phone: {order.shippingAddress.phone}
                                        </Typography>
                                    </div>
                                    <div className="order-summary">
                                        <Typography variant="subtitle2">
                                            Payment Method: {order.paymentMethod}
                                        </Typography>
                                        <Typography variant="h6">
                                            Total: ₹{order.totalAmount.toFixed(2)}
                                        </Typography>
                                    </div>
                                </div>
                            </Paper>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Orders; 