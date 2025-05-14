import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { IoClose } from "react-icons/io5";
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';

const Sidebar = ({ onClose, priceRange, onPriceRangeChange, selectedCategories = [], onCategoryChange }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/category`);
            if (response.data && response.data.categories) {
                setCategories(response.data.categories);
            } else if (response.data && Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                console.error('Invalid categories data format:', response.data);
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const handleCategoryChange = (categoryId) => {
        const updatedCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];
        onCategoryChange(updatedCategories);
    };

    const handlePriceChange = (values) => {
        onPriceRangeChange(values);
    };

    return (
        <>
            <div className="sidebar">
                <div className="sticky">
                    <div className="d-flex align-items-center justify-content-between mb-3 d-md-none">
                        <h5 className="m-0">Filters</h5>
                        <Button className="close-filter" onClick={onClose}>
                            <IoClose />
                        </Button>
                    </div>
                    <div className="filterbox mb-3">
                        <h6>CATEGORIES</h6>
                        <div className="scroll">
                            <ul>
                                {Array.isArray(categories) && categories.map((category) => (
                                    <li key={category._id || category.id}>
                                        <FormControlLabel 
                                            control={
                                                <Checkbox
                                                    checked={selectedCategories.includes(category._id || category.id)}
                                                    onChange={() => handleCategoryChange(category._id || category.id)}
                                                />
                                            }
                                            label={category.name}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="filterbox">
                        <h6>PRICE RANGE</h6>
                        <div className="price-range">
                            <RangeSlider
                                className="range-slider"
                                min={100}
                                max={6000}
                                step={100}
                                value={priceRange}
                                onInput={handlePriceChange}
                            />
                            <div className="price-inputs">
                                <span>₹{priceRange[0]}</span>
                                <span>₹{priceRange[1]}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;