import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Navigation, Pagination } from 'swiper/modules';

const HomeCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                console.error('Invalid data format received:', response.data);
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/cat/${categoryId}`);
    };

    if (loading) {
        return <div className="text-center">Loading categories...</div>;
    }

    return (
        <div className="category">
            <h1 className="text-center">Shop By Category</h1>
            <div className="container">
                <Swiper
                    slidesPerView={4.3}
                    spaceBetween={25}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                        enabled: true,
                    }}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    breakpoints={{
                        320: {
                            slidesPerView: 2.3,
                            spaceBetween: 15,
                        },
                        480: {
                            slidesPerView: 2.8,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 3.5,
                            spaceBetween: 25,
                        },
                        1024: {
                            slidesPerView: 4.3,
                            spaceBetween: 25,
                        },
                    }}
                    modules={[Navigation, Pagination]}
                    className='mySwipper'
                >
                    {categories.map((category) => (
                        <SwiperSlide key={category.id}>
                            <div 
                                className="item text-center" 
                                onClick={() => handleCategoryClick(category.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img src={category.images[0]} alt={category.name} />
                                <h5>{category.name}</h5>
                            </div>
                        </SwiperSlide>
                    ))}
                    <div className="swiper-button-prev"></div>
                    <div className="swiper-button-next"></div>
                    <div className="swiper-pagination"></div>
                </Swiper>
            </div>
        </div>
    );
};

export default HomeCategory;
