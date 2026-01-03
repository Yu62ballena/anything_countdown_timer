import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, events, visibilityState, onToggleVisibility, onReset, onToggleCategory }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredEvents = events.filter(ev =>
        ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.emoji.includes(searchTerm)
    );

    // Helper to check category status
    const getCategoryStatus = (cat) => {
        const catEvents = events.filter(e => e.category === cat);
        if (catEvents.length === 0) return false;
        // If at least one is visible, treat as "on" or "indeterminate"
        // For simplicity: ON if ANY is visible.
        return catEvents.some(e => visibilityState[e.id] !== false);
    };

    const categories = [
        { id: 'DEFAULT', label: '🎪 バラエティ（標準）' },
        { id: 'JP', label: '🇯🇵 日本の祝日' },
        { id: 'US', label: '🇺🇸 アメリカの祝日' },
        { id: 'GB', label: '🇬🇧 イギリスの祝日' },
    ];

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>表示設定</h2>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px'
                    }}>
                        <X size={24} color="#666" />
                    </button>
                </div>

                {/* Category Toggles */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f5f5f5' }}>
                    <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold', color: '#666' }}>
                        イベントカテゴリ（一括ON/OFF）
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {categories.map(cat => {
                            const isActive = getCategoryStatus(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => onToggleCategory(cat.id, !isActive)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '20px',
                                        border: `1px solid ${isActive ? '#4cd964' : '#ddd'}`,
                                        backgroundColor: isActive ? '#e8f5e9' : 'white',
                                        color: isActive ? '#2e7d32' : '#666',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isActive && <span style={{ marginRight: '4px' }}>✓</span>}
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Search */}
                <div style={{ padding: '1rem 1.5rem' }}>
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Search size={20} color="#999" style={{ position: 'absolute', left: '10px' }} />
                        <input
                            type="text"
                            placeholder="タイマーを検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                borderRadius: '10px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                {/* List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 1.5rem 1.5rem'
                }}>
                    {filteredEvents.map(ev => {
                        const isVisible = visibilityState[ev.id] !== false; // Default true if undefined
                        return (
                            <div key={ev.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 0',
                                borderBottom: '1px solid #f5f5f5'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{ev.emoji}</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>{ev.name}</span>
                                </div>

                                <label className="toggle-switch-small" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                                    <input
                                        type="checkbox"
                                        checked={isVisible}
                                        onChange={() => onToggleVisibility(ev.id)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        cursor: 'pointer',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: isVisible ? '#4cd964' : '#ccc',
                                        transition: '.4s',
                                        borderRadius: '34px'
                                    }}></span>
                                    <span style={{
                                        position: 'absolute',
                                        content: "",
                                        height: '18px',
                                        width: '18px',
                                        left: isVisible ? '18px' : '4px', // Toggle position
                                        bottom: '3px',
                                        backgroundColor: 'white',
                                        transition: '.4s',
                                        borderRadius: '50%'
                                    }}></span>
                                </label>
                            </div>
                        );
                    })}
                    {filteredEvents.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                            見つかりませんでした
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid #eee',
                    textAlign: 'center'
                }}>
                    <button onClick={onReset} style={{
                        background: 'none',
                        border: '1px solid #ddd',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        color: '#666',
                        cursor: 'pointer'
                    }}>
                        初期設定に戻す
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;
