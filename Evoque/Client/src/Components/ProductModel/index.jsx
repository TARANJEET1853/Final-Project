import React, { useState, useRef } from 'react';
import InnerImageZoom from 'react-inner-image-zoom';
import { Badge, Button, Dialog } from "@mui/material";
import { MdClose } from "react-icons/md";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';
import QuantityBox from '../QuantityBox';
import ProductZoom from '../ProductZoom';
import './styles.css';

const ProductModel = ({ product, closeProductModel }) => {
    const [currentImage, setCurrentImage] = useState(product.images[0]);
    const [selectedSize, setSelectedSize] = useState('');
    const zoomSlider = useRef();

    const settings = {
        arrows: true,
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
    };

    return (
        <div className="productModel">
            <Dialog className="productmodel" open={true} onClose={closeProductModel}>
                <Button className="close" onClick={closeProductModel}>
                    <MdClose />
                </Button>
                <h4 className="mb-0">{product.name}</h4>
                <hr />
                <div className="row">
                    <div className="col-md-5">
                        <ProductZoom images={product.images} />
                    </div>
                    <div className="col-md-7 productinfo">
                        <div className="d-flex align-items-center priceinfo mt-4">
                            <span className="newprice me-2">₹{product.price.toLocaleString()}</span>
                            {product.mrp > product.price && (
                                <span className="oldprice">₹{product.mrp.toLocaleString()}</span>
                            )}
                        </div>
                        <span className="badge mt-3">
                            {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <p className="mt-3">{product.description}</p>
                        
                        {product.sizes && (
                            <div className="sizes-section mt-3">
                                <h6 className="mb-2">Select Size</h6>
                                <div className="size-buttons">
                                    {product.sizes.map((size) => (
                                        <Button
                                            key={size}
                                            variant={selectedSize === size ? "contained" : "outlined"}
                                            className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                            sx={{
                                                minWidth: '45px',
                                                height: '45px',
                                                margin: '0 8px 8px 0',
                                                borderRadius: '4px',
                                                fontWeight: '600',
                                                backgroundColor: selectedSize === size ? '#ff5722' : '#fff',
                                                color: selectedSize === size ? '#fff' : '#ff5722',
                                                border: '1px solid #ff5722',
                                                '&:hover': {
                                                    backgroundColor: selectedSize === size ? '#ff5722' : '#fff',
                                                    opacity: 0.9,
                                                    border: '1px solid #ff5722',
                                                },
                                            }}
                                        >
                                            {size}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="d-flex align-items-center">
                            <QuantityBox max={product.countInStock} />
                            <Button 
                                className="btn-big rounded cart ms-3" 
                                disabled={product.countInStock === 0}
                            >
                                Add To Cart
                            </Button>
                        </div>
                        {product.specifications && (
                            <div className="d-flex align-items-center mt-3 item-type">
                                <ul>
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <li key={key}>{key} - {value}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ProductModel;
