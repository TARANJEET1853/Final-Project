import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../Sidebar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { FaAngleDown, FaFilter } from "react-icons/fa6";
import ProductIem from "../../ProductItem";
import { TfiFullscreen } from "react-icons/tfi";
import Footer from "../../Footer";
import Header from "../../Header";
import axios from "axios";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { API_URL } from '../../../config/api';

const Listing = () => {
    const { id: categoryId } = useParams();
    const [anchorEl, setAnchorEl] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [priceRange, setPriceRange] = useState([100, 6000]);
    const [products, setProducts] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(9);
    const open = Boolean(anchorEl);

    useEffect(() => {
        if (categoryId) {
            setSelectedCategories([categoryId]);
            fetchCategoryName();
        }
        fetchProducts();
    }, [categoryId]);

    useEffect(() => {
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [selectedCategories, priceRange]);

    const fetchCategoryName = async () => {
        try {
            const response = await axios.get(`${API_URL}/category/${categoryId}`);
            if (response.data && response.data.success) {
                setCategoryName(response.data.category.name);
            } else if (response.data && response.data.name) {
                setCategoryName(response.data.name);
            }
        } catch (error) {
            console.error('Error fetching category name:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/products`);
            if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else {
                console.error('Invalid products data format:', response.data);
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    const handlePriceRangeChange = (newRange) => {
        setPriceRange(newRange);
    };

    const handleCategoryChange = (categories) => {
        setSelectedCategories(categories);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleProductsPerPageChange = (count) => {
        setProductsPerPage(count);
        setCurrentPage(1);
        handleClose();
    };

    // Filter products based on selected categories and price range
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategories.length === 0 || 
            selectedCategories.includes(product.Category?._id || product.Category?.id);
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesCategory && matchesPrice;
    });

    // Calculate pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    return (
        <>
            <Header/>
            <section className="product_Listing_Page">
                <div className="container">
                    {categoryName && (
                        <h2 className="text-center mb-4">{categoryName}</h2>
                    )}
                    <div className="productlist d-flex">
                        {/* Desktop Sidebar */}
                        <div className="sidebar-wrapper d-none d-md-block">
                            <Sidebar 
                                priceRange={priceRange} 
                                onPriceRangeChange={handlePriceRangeChange}
                                selectedCategories={selectedCategories}
                                onCategoryChange={handleCategoryChange}
                            />
                        </div>
                        {/* Mobile Sidebar */}
                        <div className={`sidebar-wrapper d-md-none ${showSidebar ? 'show' : ''}`}>
                            <Sidebar 
                                onClose={() => setShowSidebar(false)} 
                                priceRange={priceRange} 
                                onPriceRangeChange={handlePriceRangeChange}
                                selectedCategories={selectedCategories}
                                onCategoryChange={handleCategoryChange}
                            />
                        </div>

                        <div className="content_right">
                            <div className="showby d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <Button className="filter d-md-none" onClick={toggleSidebar}>
                                        <FaFilter />
                                    </Button>
                                    <span>{filteredProducts.length} Products</span>
                                </div>
                                <div className="showvalue">
                                    <Button
                                        id="basic-button"
                                        aria-controls={open ? 'basic-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={open ? 'true' : undefined}
                                        onClick={handleClick}
                                    >
                                        Show: {productsPerPage} <FaAngleDown />
                                    </Button>
                                    <Menu
                                        id="basic-menu"
                                        anchorEl={anchorEl}
                                        open={open}
                                        onClose={handleClose}
                                        MenuListProps={{
                                            'aria-labelledby': 'basic-button',
                                        }}
                                        className="showperpage"
                                    >
                                        <MenuItem onClick={() => handleProductsPerPageChange(9)}>9</MenuItem>
                                        <MenuItem onClick={() => handleProductsPerPageChange(12)}>12</MenuItem>
                                        <MenuItem onClick={() => handleProductsPerPageChange(15)}>15</MenuItem>
                                    </Menu>
                                </div>
                            </div>

                            <div className="productlisting">
                                {loading ? (
                                    <div className="text-center w-100">Loading products...</div>
                                ) : currentProducts.length === 0 ? (
                                    <div className="text-center w-100">No products found matching your criteria.</div>
                                ) : (
                                    currentProducts.map(product => (
                                        <ProductIem key={product._id || product.id} product={product} />
                                    ))
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4 mb-4">
                                    <Stack spacing={2}>
                                        <Pagination 
                                            count={totalPages} 
                                            page={currentPage} 
                                            onChange={handlePageChange}
                                            color="primary"
                                            size="large"
                                        />
                                    </Stack>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <Footer/>
        </>
    );
};

export default Listing;
