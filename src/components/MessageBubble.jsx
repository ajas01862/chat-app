import React, { useState } from 'react';

export default function MessageBubble({ message, isSender, isNew, otherUser }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            {isNew && (
                <div id="new-msg-divider" style={{
                    textAlign: 'center', margin: '30px 0 10px',
                    color: '#bbb', fontSize: 13, fontStyle: 'italic'
                }}>
                    — New Messages —
                </div>
            )}
            <div style={{
                display: 'flex',
                justifyContent: isSender ? 'flex-end' : 'flex-start',
                marginBottom: 10
            }}>
                <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        background: isHovered
                            ? (isSender ? '#c1f8ac' : '#fff') : (isSender ? '#adf68f' : '#f0f0f0'),
                        color: '#000',
                        padding: 10,
                        borderRadius: 15,
                        maxWidth: '75%',
                        wordBreak: 'break-word',
                        transition: 'background 0.2s'
                    }}
                >
                    <div>{typeof message.text === 'string' && message.text.trim() ? message.text : ''}</div>
                    <div style={{ fontSize: 10, textAlign: 'right', marginTop: 5 }}>
                        {message.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isSender && (
                            <span style={{ marginLeft: 5 }}>
                                {message.readBy?.includes(otherUser.uid) ? '✔✔' : '✔'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
