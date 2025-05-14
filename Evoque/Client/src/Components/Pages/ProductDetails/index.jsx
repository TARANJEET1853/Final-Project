import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductZoom from "../../ProductZoom";
import Rating from '@mui/material/Rating';
import QuanityBox from "../../QuantityBox";
import { Button, Divider, Alert, Snackbar, TextField } from "@mui/material";
import Footer from "../../Footer";
import Header from "../../Header";
import { API_URL } from '../../../config/api';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activesize, setActivesize] = useState(null);
    const [activetabs, setactivetabs] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [userRating, setUserRating] = useState(0);
    const [reviewerName, setReviewerName] = useState("");
    const [reviewText, setReviewText] = useState("");

    useEffect(() => {
        fetchProduct();
        checkAuthStatus();
        window.scrollTo(0, 0);
    }, [id]);

    const checkAuthStatus = () => {
        const token = localStorage.getItem('userToken');
        setIsLoggedIn(!!token);
    };

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`${API_URL}/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (newQuantity) => {
        setQuantity(newQuantity);
    };

    const addToCart = () => {
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/signin');
            return;
        }

        if (activesize === null && product.sizes?.length > 0) {
            setError("Please select a size");
            return;
        }
        
        const cartItem = {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : '',
            size: product.sizes ? product.sizes[activesize] : null,
            quantity: quantity
        };

        // Get user-specific cart
        const allCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        const userCart = allCarts[user.email] || [];
        
        // Check if item already exists in cart (same product and size)
        const existingItemIndex = userCart.findIndex(item => 
            item.productId === cartItem.productId && item.size === cartItem.size
        );

        if (existingItemIndex !== -1) {
            // Update quantity of existing item
            userCart[existingItemIndex].quantity += quantity;
            setSnackbarMessage(`Updated quantity in cart`);
        } else {
            // Add new item
            userCart.push(cartItem);
            setSnackbarMessage(`Added to cart`);
        }

        // Save updated cart
        allCarts[user.email] = userCart;
        localStorage.setItem('userCarts', JSON.stringify(allCarts));

        // Update cart total in header
        const cartTotal = userCart.reduce((total, item) => total + (item.price * item.quantity), 0);
        localStorage.setItem(`cartTotal_${user.email}`, cartTotal);

        // Trigger a custom event to notify the header component
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Show success message
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const isactive = (index) => {
        setActivesize(index);
        setError(""); // Clear error when size is selected
    }

    const isactiveTab = (index) => {
        setactivetabs(index);
        setError("");
    }

    const submitReview = async () => {
        if (!userRating) {
            setError("Please select a rating");
            return;
        }
        if (!reviewerName.trim()) {
            setError("Please enter your name");
            return;
        }
        if (!reviewText.trim()) {
            setError("Please write your review");
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            const response = await axios.post(
                `${API_URL}/products/${id}/review`, 
                {
                    name: reviewerName.trim(),
                    rating: userRating,
                    comment: reviewText.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                await fetchProduct();
                setUserRating(0);
                setReviewerName("");
                setReviewText("");
                setError("");
                setSnackbarMessage("Review submitted successfully");
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            if (error.response?.status === 401) {
                setError("Please login to submit a review");
                navigate('/signin');
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Failed to submit review. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="container py-5">
                    <div className="text-center">Loading product details...</div>
                </div>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header />
                <div className="container py-5">
                    <div className="text-center">Product not found</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header/>
            <div className="productdetails">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-lg-7">
                            <ProductZoom images={product.images} />
                        </div>
                        <div className="col-lg-5">
                            <div className="product-info">
                                <div className="category-badge mb-1" style={{ 
                                    display: 'inline-block',
                                    padding: '2px 10px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    color: '#666'
                                }}>
                                    {product.Category?.name}
                                </div>
                                
                                <h1 className="product-title mb-2" style={{ fontSize: '1.8rem', fontWeight: '600' }}>
                                    {product.name}
                                </h1>

                                <div className="ratings mb-2">
                                    <Rating value={product.rating} readOnly precision={0.5} />
                                    <span className="ms-2 text-muted">({product.numReviews} reviews)</span>
                                </div>

                                <div className="price-section mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="current-price" style={{ fontSize: '1.6rem', fontWeight: '600', color: '#E08E37' }}>
                                            ₹{product.price.toLocaleString()}
                                        </span>
                                        {product.mrp > product.price && (
                                            <span className="original-price" style={{ 
                                                fontSize: '1.1rem', 
                                                textDecoration: 'line-through',
                                                color: '#999' 
                                            }}>
                                                ₹{product.mrp.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="tax-info" style={{ fontSize: '0.85rem', color: '#666' }}>
                                        Inclusive of all taxes
                                    </div>
                                </div>

                                <Divider className="my-3" />

                                {product.sizes && (
                                    <div className="size-section mb-3">
                                        <h6 className="mb-2">Select Size</h6>
                                        <div className="size-options d-flex gap-2 flex-wrap">
                                            {product.sizes.map((size, index) => (
                                                <Button
                                                    key={index}
                                                    variant={activesize === index ? "contained" : "outlined"}
                                                    onClick={() => isactive(index)}
                                                    sx={{
                                                        minWidth: '45px',
                                                        height: '45px',
                                                        borderRadius: '8px',
                                                        backgroundColor: activesize === index ? '#E08E37' : 'transparent',
                                                        borderColor: '#E08E37',
                                                        color: activesize === index ? '#fff' : '#E08E37',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            backgroundColor: activesize === index ? '#E08E37' : 'transparent',
                                                            borderColor: '#E08E37',
                                                            color: activesize === index ? '#fff' : '#E08E37'
                                                        }
                                                    }}
                                                >
                                                    {size}
                                                </Button>
                                            ))}
                                        </div>
                                        {error && (
                                            <div 
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: '#d32f2f',
                                                    fontSize: '0.75rem',
                                                    marginTop: '4px',
                                                    gap: '4px'
                                                }}
                                            >
                                                <svg 
                                                    style={{ 
                                                        width: '14px', 
                                                        height: '14px'
                                                    }} 
                                                    fill="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                                </svg>
                                                Please select a size
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="quantity-section mb-3">
                                    <h6 className="mb-2">Quantity</h6>
                                    <QuanityBox max={product.countInStock} onChange={handleQuantityChange} />
                                </div>

                                <Button 
                                    variant="contained"
                                    className="add-to-cart-btn"
                                    disabled={product.countInStock === 0}
                                    onClick={addToCart}
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#E08E37',
                                        padding: '10px',
                                        fontSize: '1rem',
                                        borderRadius: '8px',
                                        '&:hover': {
                                            backgroundColor: '#c97f31'
                                        }
                                    }}
                                >
                                    {product.countInStock > 0 ? 'Add To Cart' : 'Out of Stock'}
                                </Button>

                                <Divider className="my-3" />

                                <div className="product-tabs">
                                    <div className="tab-buttons mb-2">
                                        {['Description', 'Specifications', 'Reviews'].map((tab, index) => (
                                            <Button 
                                                key={index}
                                                onClick={() => isactiveTab(index)}
                                                className={`me-2 ${activetabs === index ? 'active' : ''}`}
                                                style={{
                                                    color: activetabs === index ? '#E08E37' : '#666',
                                                    borderBottom: activetabs === index ? '2px solid #E08E37' : 'none',
                                                    padding: '4px 8px'
                                                }}
                                            >
                                                {tab}
                                                {index === 2 && ` (${product.numReviews})`}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="tab-content p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                        {activetabs === 0 && (
                                            <div className="description-tab">
                                                <p style={{ lineHeight: '1.5', margin: 0 }}>{product.description}</p>
                                            </div>
                                        )}
                                        {activetabs === 1 && (
                                            <div className="specifications-tab">
                                                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                                                    <div key={key} className="spec-item d-flex justify-content-between py-1">
                                                        <span className="spec-label" style={{ color: '#666' }}>{key}</span>
                                                        <span className="spec-value" style={{ fontWeight: '500' }}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {activetabs === 2 && (
                                            <div className="reviews-tab">
                                                <div className="overall-rating mb-4">
                                                    <Rating value={product.rating} readOnly size="large" />
                                                    <div className="rating-text mt-1" style={{ color: '#666' }}>
                                                        Based on {product.numReviews} reviews
                                                    </div>
                                                </div>
                                                
                                                <div className="add-review-section">
                                                    <h6 className="mb-3">Write a Review</h6>
                                                    <div className="review-form">
                                                        <div className="mb-3">
                                                            <label style={{ color: '#666', marginBottom: '8px', display: 'block' }}>Your Rating*</label>
                                                            <Rating 
                                                                value={userRating} 
                                                                onChange={(event, newValue) => {
                                                                    setUserRating(newValue);
                                                                    setError("");
                                                                }}
                                                                size="large"
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <TextField
                                                                fullWidth
                                                                label="Your Name*"
                                                                value={reviewerName}
                                                                onChange={(e) => {
                                                                    setReviewerName(e.target.value);
                                                                    setError("");
                                                                }}
                                                                error={error && !reviewerName.trim()}
                                                                size="small"
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <TextField
                                                                fullWidth
                                                                label="Your Review*"
                                                                value={reviewText}
                                                                onChange={(e) => {
                                                                    setReviewText(e.target.value);
                                                                    setError("");
                                                                }}
                                                                error={error && !reviewText.trim()}
                                                                multiline
                                                                rows={4}
                                                                size="small"
                                                            />
                                                        </div>
                                                        {error && (
                                                            <div style={{ color: '#d32f2f', fontSize: '0.75rem', marginBottom: '10px' }}>
                                                                {error}
                                                            </div>
                                                        )}
                                                        <Button
                                                            variant="contained"
                                                            onClick={submitReview}
                                                            sx={{
                                                                backgroundColor: '#E08E37',
                                                                '&:hover': {
                                                                    backgroundColor: '#c97f31'
                                                                }
                                                            }}
                                                        >
                                                            Submit Review
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                <div className="reviews-list mt-4">
                                                    {product.reviews && product.reviews.map((review, index) => (
                                                        <div key={index} className="review-item" style={{
                                                            padding: '15px',
                                                            borderBottom: '1px solid #eee',
                                                            marginBottom: '15px'
                                                        }}>
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div>
                                                                    <h6 style={{ margin: '0 0 5px 0' }}>{review.name}</h6>
                                                                    <Rating value={review.rating} readOnly size="small" />
                                                                </div>
                                                                <small style={{ color: '#666' }}>
                                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                                </small>
                                                            </div>
                                                            <p style={{ margin: '10px 0 0 0', color: '#444' }}>
                                                                {review.comment}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                ContentProps={{
                    sx: {
                        background: '#E08E37',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        borderRadius: '8px',
                        padding: '6px 16px'
                    }
                }}
            />
            <Footer/>
        </>
    );
}

export default ProductDetails;