import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';

export default function Chat() {
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        const user = auth.currentUser;
        const trimmed = msg.trim();

        if (!trimmed || !user) return;

        await addDoc(collection(db, 'messages'), {
            text: trimmed,
            createdAt: serverTimestamp(),
            uid: user.uid,
            name: user.displayName || 'Anonymous'
        });

        setMsg('');
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Public Chat</h2>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                margin: '20px 0',
                padding: '15px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)'
            }}>
                {messages.map(m => (
                    <div key={m.id} style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#2196F3' }}>{m.name}:</strong> {m.text}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        fontSize: '16px'
                    }}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
