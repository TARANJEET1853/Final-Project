import React, { useState, useEffect } from 'react';
import InnerImageZoom from 'react-inner-image-zoom';
import { IconButton } from "@mui/material";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';

const ProductZoom = ({ images }) => {
    const [currentImage, setCurrentImage] = useState(images[0]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1023);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1023);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePrevImage = () => {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        setCurrentIndex(newIndex);
        setCurrentImage(images[newIndex]);
    };

    const handleNextImage = () => {
        const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
        setCurrentImage(images[newIndex]);
    };

    const handleThumbnailClick = (image, index) => {
        setCurrentImage(image);
        setCurrentIndex(index);
    };

    return (
        <div className="product-zoom-container">
            <div className="thumbnails-container">
                {images.map((image, index) => (
                    <div 
                        key={index}
                        className={`thumbnail-wrapper ${currentIndex === index ? 'active' : ''}`}
                        onClick={() => handleThumbnailClick(image, index)}
                    >
                        <img
                            src={image}
                            alt={`Product thumbnail ${index + 1}`}
                            className="thumbnail-image"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
            
            <div className="main-image-container">
                <IconButton 
                    className="nav-button prev"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                >
                    <MdKeyboardArrowLeft />
                </IconButton>
                
                <div className="main-image">
                    <InnerImageZoom
                        src={currentImage}
                        zoomSrc={currentImage}
                        zoomType={isMobile ? "click" : "hover"}
                        zoomPreload={true}
                        fullscreenOnMobile={true}
                        hideHint={true}
                        zoomScale={isMobile ? 1.5 : 2}
                        moveType="pan"
                        className="zoom-image"
                        imgAttributes={{
                            alt: "Product image",
                            className: "product-img"
                        }}
                    />
                </div>

                <IconButton 
                    className="nav-button next"
                    onClick={handleNextImage}
                    aria-label="Next image"
                >
                    <MdKeyboardArrowRight />
                </IconButton>
            </div>
        </div>
    );
};

export default ProductZoom;