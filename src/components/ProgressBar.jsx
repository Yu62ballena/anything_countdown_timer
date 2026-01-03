import React from 'react';

const ProgressBar = ({ percent, color }) => {
    const containerStyle = {
        height: '10px',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: '5px',
        overflow: 'hidden',
        marginTop: '0.5rem',
        display: 'flex',
        alignItems: 'center'
    };

    const fillStyle = {
        height: '100%',
        width: `${percent}%`,
        backgroundColor: color || '#888',
        transition: 'width 0.5s ease-in-out',
        borderRadius: '5px'
    };

    return (
        <div className="progress-container">
            <div style={containerStyle}>
                <div style={fillStyle}></div>
            </div>
            <div className="progress-label" style={{ fontSize: '0.8rem', marginTop: '0.2rem', textAlign: 'right', color: '#666' }}>
                {percent}% 経過
            </div>
        </div>
    );
};

export default ProgressBar;
