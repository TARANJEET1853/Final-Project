import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Avatar } from "@mui/material";
import { FaRegUser } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import SearchBox from "./SearchBox";
import Navbar from "./Navbar";
import HeadStrip from "./HeadStrip";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const Header = () => {
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        setUser(userInfo);
        updateCartInfo();
        
        // Listen for cart updates
        window.addEventListener('cartUpdated', updateCartInfo);
        // Listen for user updates
        window.addEventListener('userUpdated', updateUserInfo);
        
        return () => {
            window.removeEventListener('cartUpdated', updateCartInfo);
            window.removeEventListener('userUpdated', updateUserInfo);
        };
    }, []);

    const updateUserInfo = () => {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        setUser(userInfo);
    };

    const updateCartInfo = () => {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo) {
            setCartTotal(0);
            setCartCount(0);
            return;
        }

        // Get user-specific cart
        const allCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
        const userCart = allCarts[userInfo.email] || [];
        
        const total = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
        setCartCount(userCart.length);
    };

    const handleUserClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            navigate('/signin');
        }
    };

    const handleCartClick = () => {
        if (user) {
            navigate('/cart');
        } else {
            navigate('/signin');
        }
    };

    const getInitial = (name) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase();
    };

    return (
        <>
            <HeadStrip/>
            <div className="header">
                <div className="container">
                    <div className="row">
                        <div className="logowrapper d-flex align-items-center col-sm-4">
                            <h1>EVOQUE CLOTHING</h1>
                        </div>
                    </div>
                    <SearchBox/>
                    <div className="account-cart d-flex align-items-center ms-auto">
                        <Button 
                            className="user-button me-3 d-flex align-items-center" 
                            onClick={handleUserClick}
                            style={{
                                backgroundColor: user ? '#f5f5f5' : 'transparent',
                                padding: '8px 15px',
                                borderRadius: '20px',
                                minWidth: 'auto'
                            }}
                        >
                            {user ? (
                                user.avatar ? (
                                    <Avatar 
                                        src={user.avatar}
                                        sx={{ 
                                            width: 32, 
                                            height: 32,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {getInitial(user.fullName || user.email)}
                                    </Avatar>
                                ) : (
                                    <div className="user-avatar" style={{ backgroundColor: user.avatarColor || '#E08E37' }}>
                                        {getInitial(user.fullName || user.email)}
                                    </div>
                                )
                            ) : (
                                <FaRegUser style={{ fontSize: '1.2rem' }}/>
                            )}
                            {user ? (
                                <span className="user-name ms-2" style={{ 
                                    textTransform: 'none',
                                    fontWeight: '500',
                                    color: '#333',
                                    fontSize: '0.9rem',
                                    maxWidth: '120px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {user.fullName || user.email.split('@')[0]}
                                </span>
                            ) : (
                                <span className="ms-2" style={{ 
                                    color: '#666',
                                    fontSize: '0.9rem'
                                }}>Sign In</span>
                            )}
                        </Button>
                        <span className="price">₹{cartTotal.toLocaleString()}</span>
                        <div className="position-relative ms-3">
                            <Button 
                                onClick={handleCartClick}
                                style={{
                                    padding: '8px',
                                    minWidth: 'auto'
                                }}
                            >
                                <FiShoppingCart style={{ fontSize: '1.2rem' }}/>
                            </Button>
                            <span className="count" style={{ backgroundColor: user?.avatarColor || '#E08E37' }}>{cartCount}</span>
                        </div>
                    </div>
                </div>
            </div>
            <nav>
                <Navbar/>
            </nav>
        </>
    );
}

export default Header;