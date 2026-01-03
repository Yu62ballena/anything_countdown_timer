import React from 'react';

const DisplayToggle = ({ mode, onToggle }) => {
    return (
        <div className="display-toggle-container" style={{ margin: '1rem', textAlign: 'center' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem', color: '#fff' }}>
                <span style={{ fontWeight: mode === 'std' ? 'bold' : 'normal' }}>日時分秒</span>
                <div
                    className="toggle-switch"
                    onClick={onToggle}
                    style={{
                        width: '50px',
                        height: '24px',
                        backgroundColor: '#ddd',
                        borderRadius: '12px',
                        position: 'relative',
                        transition: 'background-color 0.2s'
                    }}
                >
                    <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#333',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: mode === 'std' ? '2px' : '28px',
                        transition: 'left 0.2s'
                    }}></div>
                </div>
                <span style={{ fontWeight: mode === 'total' ? 'bold' : 'normal' }}>トータル時間</span>
            </label>
        </div>
    );
};

export default DisplayToggle;
