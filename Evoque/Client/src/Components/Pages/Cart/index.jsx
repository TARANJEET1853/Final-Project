import { Link, useNavigate } from 'react-router-dom';
import QuantityBox from '../../QuantityBox';
import { IoTrashBinOutline } from "react-icons/io5";
import emailjs from "@emailjs/browser";
import { EMAILJS_CONFIG } from "../../../config/emailjs";
import { 
    Button, 
    CircularProgress, 
    Dialog, 
    DialogContent, 
    DialogTitle,
    DialogActions,
    TextField,
    Alert, 
    Snackbar,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Box,
    Typography
} from "@mui/material";
import Header from "../../Header";
import Footer from "../../Footer";
import { useState, useEffect } from 'react';
import { FaCheckCircle } from "react-icons/fa";
import { API_URL } from '../../../config/api';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showQuickOrderForm, setShowQuickOrderForm] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [quickOrderDetails, setQuickOrderDetails] = useState({
        email: '',
        phone: '',
        address: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const navigate = useNavigate();

    // Initialize EmailJS
    useEffect(() => {
        console.log('Environment Variables:', {
            PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
            SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
            TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID
        });
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        console.log('EmailJS Initialized with config:', {
            serviceId: EMAILJS_CONFIG.SERVICE_ID,
            templateId: EMAILJS_CONFIG.TEMPLATE_ID,
            publicKey: EMAILJS_CONFIG.PUBLIC_KEY ? 'Present' : 'Missing'
        });
    }, []);

    useEffect(() => {
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/signin');
            return;
        }
        loadCartItems();

        // Pre-fill email and phone from user data
        setQuickOrderDetails(prev => ({
            ...prev,
            email: user.email || '',
            phone: user.contactNo || '',
            address: user.defaultAddress || ''
        }));
    }, [navigate]);

    const loadCartItems = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        // Get user-specific cart
        const allCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        const userCart = allCarts[user.email] || [];
        setCartItems(userCart);
        calculateSubtotal(userCart);
    };

    const calculateSubtotal = (items) => {
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setSubtotal(total);
    };

    const handleQuantityChange = (newQuantity, index) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        const updatedItems = [...cartItems];
        updatedItems[index].quantity = newQuantity;
        setCartItems(updatedItems);

        // Update user-specific cart
        const allCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        allCarts[user.email] = updatedItems;
        localStorage.setItem('userCarts', JSON.stringify(allCarts));

        calculateSubtotal(updatedItems);
        
        // Update cart total in header
        const cartTotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        localStorage.setItem(`cartTotal_${user.email}`, cartTotal);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    };

    const removeItem = (index) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        const updatedItems = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedItems);

        // Update user-specific cart
        const allCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        allCarts[user.email] = updatedItems;
        localStorage.setItem('userCarts', JSON.stringify(allCarts));

        calculateSubtotal(updatedItems);
        
        // Update cart total in header
        const cartTotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        localStorage.setItem(`cartTotal_${user.email}`, cartTotal);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    };

    const validateForm = () => {
        const errors = {};
        if (!quickOrderDetails.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(quickOrderDetails.email)) {
            errors.email = 'Invalid email format';
        }
        if (!quickOrderDetails.phone) {
            errors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(quickOrderDetails.phone.replace(/[^0-9]/g, ''))) {
            errors.phone = 'Invalid phone number (10 digits required)';
        }
        if (!quickOrderDetails.address) {
            errors.address = 'Delivery address is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const sendOrderConfirmationEmail = async (orderDetails) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            // Validate email before sending
            if (!quickOrderDetails.email) {
                console.error('No recipient email address found');
                return;
            }

            // Ensure image URLs are absolute
            const makeAbsoluteUrl = (url) => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
            };

            // Calculate discount amount
            const discountAmount = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
            console.log('Debug - Discount Calculation:', {
                appliedCoupon,
                calculatedDiscount: appliedCoupon?.calculatedDiscount,
                discountAmount,
                subtotal,
                finalTotal: calculateFinalTotal()
            });

            // Create template params matching the template variables
            const templateParams = {
                email: quickOrderDetails.email,
                order_id: new Date().getTime(),
                orders: cartItems.map(item => {
                    const discountedPrice = calculateDiscountedPrice(item.price);
                    return {
                        name: item.name,
                        price: discountedPrice.toLocaleString(),
                        units: item.quantity,
                        image_url: makeAbsoluteUrl(item.image)
                    };
                }),
                cost: {
                    shipping: "Free",
                    tax: "0",
                    discount: discountAmount > 0 ? discountAmount.toLocaleString() : "0",
                    total: calculateFinalTotal().toLocaleString()
                }
            };

            console.log('Debug - Email Template Parameters:', {
                discountInTemplate: templateParams.cost.discount,
                totalInTemplate: templateParams.cost.total,
                appliedCoupon: appliedCoupon ? {
                    code: appliedCoupon.code,
                    type: appliedCoupon.discountType,
                    value: appliedCoupon.discountValue,
                    calculatedDiscount: appliedCoupon.calculatedDiscount
                } : null
            });

            const result = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                templateParams
            );
            
            console.log('Email sent successfully:', result);
        } catch (error) {
            console.error('Failed to send confirmation email. Details:', {
                error: error.message,
                code: error.code,
                status: error.status,
                text: error.text,
                name: error.name,
                emailBeingSent: quickOrderDetails.email,
                templateParams: templateParams
            });
        }
    };

    const handleQuickOrderSubmit = () => {
        if (!validateForm()) {
            return;
        }
        setShowQuickOrderForm(false);
        setShowPaymentDialog(true);
    };

    const handlePaymentSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            // Validate cart items
            if (cartItems.length === 0) {
                throw new Error('Your cart is empty');
            }

            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                throw new Error('Please sign in to place an order');
            }

            // Get token and validate
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token not found in localStorage');
                throw new Error('Authentication token not found. Please sign in again.');
            }

            // Create order payload
            const orderPayload = {
                items: cartItems.map(item => {
                    const discountedPrice = calculateDiscountedPrice(item.price);
                    return {
                        product: item.productId,
                        productName: item.name,
                        productImage: item.image,
                        quantity: item.quantity,
                        originalPrice: item.price,
                        price: discountedPrice,
                        size: item.size || 'M'
                    };
                }),
                subtotal: subtotal,
                discount: appliedCoupon ? {
                    code: appliedCoupon.code,
                    type: appliedCoupon.discountType,
                    value: appliedCoupon.discountValue,
                    amount: appliedCoupon.calculatedDiscount
                } : null,
                totalAmount: calculateFinalTotal(),
                paymentMethod: paymentMethod,
                shippingAddress: {
                    fullName: user.fullName || 'Guest',
                    addressLine1: quickOrderDetails.address.trim()
                        .split('\n')
                        .filter(line => line.trim())
                        .join(', '),
                    phone: quickOrderDetails.phone,
                    email: quickOrderDetails.email
                }
            };

            // Place order
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(orderPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order');
            }

            const data = await response.json();
            
            if (data.success) {
                // Send confirmation email
                try {
                    await sendOrderConfirmationEmail();
                } catch (emailErr) {
                    console.error('Email sending failed:', emailErr);
                }

                // Clear cart
                const allCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
                allCarts[user.email] = [];
                localStorage.setItem('userCarts', JSON.stringify(allCarts));
                localStorage.setItem(`cartTotal_${user.email}`, 0);
                setCartItems([]);
                window.dispatchEvent(new CustomEvent('cartUpdated'));

                setShowPaymentDialog(false);
                setOrderSuccess(true);
                
                setTimeout(() => {
                    setOrderSuccess(false);
                    window.location.href = '/orders';
                }, 2000);
            } else {
                throw new Error(data.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order placement error:', error);
            setError(error.message || 'Failed to place order. Please try again.');
            
            if (error.message.includes('session has expired')) {
                setTimeout(() => {
                    navigate('/signin');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCloseError = () => {
        setError('');
    };

    const handleCouponSubmit = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            // First validate the coupon
            const response = await fetch(`${API_URL}/coupons/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: couponCode,
                    cartTotal: subtotal
                })
            });

            const data = await response.json();

            if (!data.success) {
                setCouponError(data.message);
                setAppliedCoupon(null);
                return;
            }

            // If validation successful, apply the coupon
            const applyResponse = await fetch(`${API_URL}/coupons/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: couponCode
                })
            });

            const applyData = await applyResponse.json();

            if (applyData.success) {
                setAppliedCoupon(data.coupon);
                setCouponError('');
                setCouponCode('');
            } else {
                setCouponError(applyData.message);
            }
        } catch (error) {
            setCouponError('Failed to apply coupon. Please try again.');
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponError('');
        setCouponCode('');
    };

    const calculateFinalTotal = () => {
        if (!appliedCoupon) return subtotal;
        return Math.max(0, subtotal - appliedCoupon.calculatedDiscount);
    };

    const calculateDiscountedPrice = (originalPrice) => {
        if (!appliedCoupon) return originalPrice;
        
        if (appliedCoupon.discountType === 'PERCENTAGE') {
            return Math.max(0, originalPrice * (1 - appliedCoupon.discountValue / 100));
        } else {
            // For fixed amount discount, we apply it proportionally to each item
            const discountRatio = Math.max(0, 1 - (appliedCoupon.calculatedDiscount / subtotal));
            return originalPrice * discountRatio;
        }
    };

    return (
        <>
            <Header/>
            <section className="cartPage container my-5">
                <h2 className="cart-bag mt-3">Shopping Bag (<b>{cartItems.length}</b>)</h2>
                <div className="cart-table mt-4">
                    <table width="100%">
                        <thead>
                            <tr>
                                <td>Image</td>
                                <td>Product</td>
                                <td>Price</td>
                                <td>Quantity</td>
                                <td>Total</td>
                                <td>Remove</td>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item, index) => {
                                const discountedPrice = calculateDiscountedPrice(item.price);
                                const itemTotal = discountedPrice * item.quantity;
                                return (
                                    <tr key={index}>
                                        <td>
                                            <Link to={`/product/${item.productId}`}>
                                                <img src={item.image} alt={item.name} />
                                            </Link>
                                        </td>
                                        <td>
                                            <Link to={`/product/${item.productId}`}>
                                                <h6>{item.name}</h6>
                                                {item.size && <small>Size: {item.size}</small>}
                                            </Link>
                                        </td>
                                        <td>
                                            <h6>
                                                {appliedCoupon ? (
                                                    <>
                                                        <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
                                                            ₹{item.price.toLocaleString()}
                                                        </span>
                                                        ₹{discountedPrice.toLocaleString()}
                                                    </>
                                                ) : (
                                                    `₹${item.price.toLocaleString()}`
                                                )}
                                            </h6>
                                        </td>
                                        <td>
                                            <QuantityBox 
                                                max={10} 
                                                onChange={(qty) => handleQuantityChange(qty, index)}
                                                initialValue={item.quantity}
                                            />
                                        </td>
                                        <td>
                                            <h6>
                                                {appliedCoupon ? (
                                                    <>
                                                        <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
                                                            ₹{(item.price * item.quantity).toLocaleString()}
                                                        </span>
                                                        ₹{itemTotal.toLocaleString()}
                                                    </>
                                                ) : (
                                                    `₹${(item.price * item.quantity).toLocaleString()}`
                                                )}
                                            </h6>
                                        </td>
                                        <td>
                                            <Button className="remove" onClick={() => removeItem(index)}>
                                                <IoTrashBinOutline />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="cart-bottom container">
                <div className="row">
                    <div className="coupon col-lg-6 col-md-6 col-12">
                        <div className="coupon-inner">
                            <h5>COUPON</h5>
                            <p>Enter your coupon code if you have one.</p>
                            {couponError && (
                                <div className="alert alert-danger" role="alert">
                                    {couponError}
                                </div>
                            )}
                            {appliedCoupon ? (
                                <div className="applied-coupon">
                                    <div className="alert alert-success">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{appliedCoupon.code}</strong>
                                                <p className="mb-0">
                                                    {appliedCoupon.discountType === 'PERCENTAGE' 
                                                        ? `${appliedCoupon.discountValue}% off` 
                                                        : `₹${appliedCoupon.discountValue} off`}
                                                </p>
                                            </div>
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={removeCoupon}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="coupon-input-group">
                                    <input 
                                        type="text" 
                                        placeholder="Coupon Code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    />
                                    <button 
                                        className="applycode"
                                        onClick={handleCouponSubmit}
                                    >
                                        APPLY CODE
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="total-cart col-lg-6 col-md-6 col-12">
                        <div className="total-cart-inner">
                            <h5>CART TOTAL</h5>
                            <div className="price-line">
                                <h6>Subtotal</h6>
                                <p>₹{subtotal.toLocaleString()}</p>
                            </div>
                            {appliedCoupon && (
                                <div className="price-line text-success">
                                    <h6>Discount ({appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`})</h6>
                                    <p>-₹{appliedCoupon.calculatedDiscount.toLocaleString()}</p>
                                </div>
                            )}
                            <div className="price-line">
                                <h6>Shipping</h6>
                                <p>Free</p>
                            </div>
                            <hr className="second-hr" />
                            <div className="price-line">
                                <h6>Total</h6>
                                <p>₹{calculateFinalTotal().toLocaleString()}</p>
                            </div>
                            <button 
                                className="checkout" 
                                onClick={() => setShowQuickOrderForm(true)}
                                disabled={loading || cartItems.length === 0}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'PLACE ORDER NOW'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <Footer/>

            {/* Quick Order Form Dialog */}
            <Dialog 
                open={showQuickOrderForm} 
                onClose={() => !loading && setShowQuickOrderForm(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Delivery Details</DialogTitle>
                <DialogContent>
                    <div className="quick-order-form">
                        <TextField
                            fullWidth
                            label="Email"
                            value={quickOrderDetails.email}
                            onChange={(e) => setQuickOrderDetails(prev => ({
                                ...prev,
                                email: e.target.value
                            }))}
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            margin="normal"
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={quickOrderDetails.phone}
                            onChange={(e) => setQuickOrderDetails(prev => ({
                                ...prev,
                                phone: e.target.value
                            }))}
                            error={!!formErrors.phone}
                            helperText={formErrors.phone}
                            margin="normal"
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Delivery Address"
                            value={quickOrderDetails.address}
                            onChange={(e) => setQuickOrderDetails(prev => ({
                                ...prev,
                                address: e.target.value
                            }))}
                            error={!!formErrors.address}
                            helperText={formErrors.address}
                            margin="normal"
                            multiline
                            rows={3}
                            disabled={loading}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setShowQuickOrderForm(false)} 
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleQuickOrderSubmit}
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                    >
                        Continue to Payment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Method Dialog */}
            <Dialog
                open={showPaymentDialog}
                onClose={() => !loading && setShowPaymentDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Payment Method</DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Select Payment Method</FormLabel>
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <FormControlLabel 
                                    value="COD" 
                                    control={<Radio />} 
                                    label={
                                        <Box>
                                            <Typography variant="subtitle1">Cash on Delivery (COD)</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Pay when your order is delivered
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom>Order Summary</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Subtotal:</Typography>
                                <Typography>₹{subtotal.toLocaleString()}</Typography>
                            </Box>
                            {appliedCoupon && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                                    <Typography>Discount:</Typography>
                                    <Typography>-₹{appliedCoupon.calculatedDiscount.toLocaleString()}</Typography>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Shipping:</Typography>
                                <Typography>Free</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, borderTop: '1px solid #eee', pt: 2 }}>
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6">₹{calculateFinalTotal().toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setShowPaymentDialog(false);
                            setShowQuickOrderForm(true);
                        }} 
                        disabled={loading}
                    >
                        Back
                    </Button>
                    <Button 
                        onClick={handlePaymentSubmit}
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Confirm Order'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Animation Dialog */}
            <Dialog
                open={orderSuccess}
                PaperProps={{
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogContent>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: '#4CAF50'
                    }}>
                        <FaCheckCircle className="success-icon" size={64} />
                        <h3 style={{ 
                            color: 'white', 
                            marginTop: '1rem',
                            textAlign: 'center',
                            animation: 'fadeInScale 0.5s ease-out forwards',
                            animationDelay: '0.2s',
                            opacity: 0
                        }}>
                            Order Placed Successfully!
                        </h3>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Error Snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseError} 
                    severity="error" 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
}

export default Cart;