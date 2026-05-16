import React, { useState } from 'react';
import defaultAvatar from '../assets/avatar.png'; // adjust relative path based on file location

export default function UserBubble({ userId, name, email, pic, online, select }) {
    const [isHovered, setIsHovered] = useState(false);

    

    return (
        <button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => select(userId)}
            style={{
                display: 'flex',
                alignItems: 'center',
                left: '4%',
                whiteSpace: 'nowrap',  // prevent breaking
                width: 'max-content',   // auto-resize based on content
                background: isHovered ? '#334' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                // padding: '10px',
                paddingRight: '120px',
                cursor: 'pointer',
                textAlign: 'left',
                gap: '10px',
                position: 'relative'
            }}
        >
            <div style={{ position: 'relative' }}>
                <img
                    src={pic || defaultAvatar}
                    alt="Profile"
                    style={{ width: 35, height: 35, borderRadius: '50%' }}
                />
                <span
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: 10,
                        width: 10,
                        backgroundColor: online ? 'green' : 'gray',
                        borderRadius: '50%',
                        border: '2px solid #333'
                    }}
                />
            </div>
            <div>
                <div style={{ fontWeight: 'bold' }}>{name || 'Unnamed User'}</div>
                <div style={{ fontSize: '0.85em', color: '#bbb' }}>{email || 'No email'}</div>
            </div>
        </button>
    );
}