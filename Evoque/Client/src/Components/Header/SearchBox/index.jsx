import { Button } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const SearchBox = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Add click outside listener to close dropdown
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                handleSearch();
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/products`);
            const products = response.data;
            
            // Filter products based on search term
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setSearchResults(filtered);
            setShowResults(true);
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (productId) => {
        setShowResults(false);
        setSearchTerm('');
        navigate(`/product/${productId}`);
    };

    return (
        <div className="header-search ml-3 mr-3" ref={searchRef}>
            <div className="search-input-container">
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="What are you Looking For" 
                />
                <Button onClick={handleSearch}><FaSearch /></Button>
            </div>
            
            {showResults && searchResults.length > 0 && (
                <div className="search-results-dropdown">
                    {searchResults.map((product) => (
                        <div 
                            key={product._id} 
                            className="search-result-item"
                            onClick={() => handleProductClick(product._id)}
                        >
                            <img 
                                src={product.images[0]} 
                                alt={product.name} 
                                className="search-result-image"
                            />
                            <div className="search-result-details">
                                <h4>{product.name}</h4>
                                <p>₹{product.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {showResults && searchResults.length === 0 && searchTerm && !loading && (
                <div className="search-results-dropdown">
                    <div className="no-results">No products found</div>
                </div>
            )}
        </div>
    );
};

export default SearchBox;