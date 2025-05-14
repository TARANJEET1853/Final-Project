import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";

const QuanityBox = ({ max = 10, onChange, initialValue = 1 }) => {
    const [inputVal, setInputVal] = useState(initialValue);

    useEffect(() => {
        if (onChange) {
            onChange(inputVal);
        }
    }, [inputVal, onChange]);

    useEffect(() => {
        setInputVal(initialValue);
    }, [initialValue]);

    const minus = () => {
        if(inputVal > 1) {
            setInputVal(inputVal - 1);
        } 
    }

    const plus = () => {
        if(inputVal < max) {
            setInputVal(inputVal + 1);
        }
    }

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1 && value <= max) {
            setInputVal(value);
        }
    }

    return (
        <div className="quantitydrop d-flex align-items-center">
            <Button onClick={minus}><FaMinus /></Button>
            <input 
                type='number' 
                value={inputVal} 
                onChange={handleInputChange}
                min={1}
                max={max}
                className="ms-3"
            />
            <Button onClick={plus}><FaPlus /></Button>
        </div>
    );
}

export default QuanityBox;