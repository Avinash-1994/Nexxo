import React from 'react';

export default function Button({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
            }}
        >
            {children || 'Remote Button'}
        </button>
    );
}
