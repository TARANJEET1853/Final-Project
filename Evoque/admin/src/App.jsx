import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CategoryList from './components/CategoryList';
import CategoryForm from './components/CategoryForm';
import OrderList from './components/OrderList';
import CouponList from './components/CouponList';
import CouponForm from './components/CouponForm';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: {
            xs: 2,
            sm: 3,
          },
          paddingRight: {
            xs: 2,
            sm: 3,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: {
            xs: '8px 4px',
            sm: '16px 8px',
            md: '16px',
          },
        },
      },
    },
  },
});

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  
  useEffect(() => {
    if (token) {
      // Set default authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return token ? children : <Navigate to="/login" />;
};

function App() {
  useEffect(() => {
    // Set up axios interceptor for handling 401 errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          delete axios.defaults.headers.common['Authorization'];
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Remove interceptor on cleanup
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin-auth/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <ProductList />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-product"
              element={
                <PrivateRoute>
                  <ProductForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <PrivateRoute>
                  <ProductForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <PrivateRoute>
                  <CategoryList />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-category"
              element={
                <PrivateRoute>
                  <CategoryForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-category/:id"
              element={
                <PrivateRoute>
                  <CategoryForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <OrderList />
                </PrivateRoute>
              }
            />
            <Route
              path="/coupons"
              element={
                <PrivateRoute>
                  <CouponList />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-coupon"
              element={
                <PrivateRoute>
                  <CouponForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-coupon/:id"
              element={
                <PrivateRoute>
                  <CouponForm />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;
