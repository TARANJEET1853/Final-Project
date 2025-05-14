import React from 'react';
import { Button } from "@mui/material";
import { TfiFullscreen } from "react-icons/tfi";
import { useNavigate } from 'react-router-dom';

const ProductItem = ({ product, showSizes = true }) => {
    const navigate = useNavigate();

    if (!product) {
        return null; // Don't render anything if no product is passed
    }

    const viewProductDetails = () => {
        navigate(`/product/${product._id}`);
    }

    return (
        <div className="item text-center" onClick={viewProductDetails} style={{ cursor: 'pointer' }}>
            <div className="img-wrap">
                <img src={product.images[0]} alt={product.name} />
                <div className="actions">
                    <Button onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        viewProductDetails();
                    }}>
                        <TfiFullscreen />
                    </Button>
                </div>
            </div>
            <h6>{product.name}</h6>
            <h6>₹{product.price.toLocaleString()}</h6>
            {showSizes && (
                <div className="sizes">
                    {product.sizes && product.sizes.map((size, index) => (
                        <span key={index} className="size-tag">{size}</span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProductItem;