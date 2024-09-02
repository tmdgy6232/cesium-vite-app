import React from 'react';
import Button from '@mui/material/Button';

const CustomButton = ({color, onClick, children}) => {

    return (
        <Button variant="contained" color={color} onClick={onClick}>
        {children}
        </Button>
    );
};

export default CustomButton;