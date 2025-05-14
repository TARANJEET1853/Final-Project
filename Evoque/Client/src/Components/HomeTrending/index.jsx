import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import axios from 'axios';
import { API_URL } from '../../config/api';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Navigation, Pagination } from 'swiper/modules';

import ProductItem from '../ProductItem';

const HomeTrending = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center">Loading trending products...</div>;
    }

    return (
        <>
            <div className="trending">
                <h1 className="text-center">TRENDING</h1>
                <div className="container">
                    <Swiper
                        slidesPerView={3}
                        spaceBetween={30}
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
                                slidesPerView: 1.3,
                                spaceBetween: 15,
                            },
                            480: {
                                slidesPerView: 1.8,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 2.3,
                                spaceBetween: 25,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 30,
                            },
                        }}
                        modules={[Navigation, Pagination]}
                        className='mySwipper'
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product.id}>
                                <ProductItem product={product} showSizes={false} />
                            </SwiperSlide>
                        ))}
                        <div className="swiper-button-prev"></div>
                        <div className="swiper-button-next"></div>
                        <div className="swiper-pagination"></div>
                    </Swiper>
                </div>
            </div>
        </>
    )
}

export default HomeTrending;