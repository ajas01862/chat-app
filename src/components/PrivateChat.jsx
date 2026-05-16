import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/config';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    doc,
    writeBatch,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import usePresence from '../hooks/usePresence';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import MessageBubble from './MessageBubble';

function getChatId(a, b) {
    return a < b ? a + b : b + a;
}

export default function PrivateChat({ otherUser, onBack }) {
    const currentUser = auth.currentUser;
    if (!currentUser || !otherUser) return null;


    usePresence(); // ✅ Safe hook call

    const chatId = getChatId(currentUser.uid, otherUser.uid);
    const msgRef = collection(db, 'chats', chatId, 'messages');
    const metaRef = doc(db, 'chats', chatId, 'meta', currentUser.uid);

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [liveUser, setLiveUser] = useState(otherUser);
    const [lastSeen, setLastSeen] = useState(null);
    const [prevLastSeen, setPrevLastSeen] = useState(null);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    // const hasScrolledInitially = useRef(false);

    // Listen to presence
    useEffect(() => {
        return onSnapshot(doc(db, 'users', otherUser.uid), (snap) => {
            if (snap.exists()) {
                setLiveUser(snap.data());
                inputRef.current?.focus()
            }
        });
    }, [otherUser.uid]);

    // Get lastSeen meta
    useEffect(() => {
        return onSnapshot(metaRef, snap => {
            const data = snap.data();
            if (snap.exists() && data?.lastSeen?.toMillis) {
                const newLastSeen = data.lastSeen.toMillis();

                setLastSeen(prev => {
                    if (prev !== newLastSeen) {
                        setPrevLastSeen(prev); // ✅ Use previous safely
                        return newLastSeen;
                    }
                    return prev;
                });
            }
        });
    }, []);



    // Load messages + mark unread as read
    useEffect(() => {
        const q = query(msgRef, orderBy('createdAt', 'asc'));
        let previousLastSeen = lastSeen;

        return onSnapshot(q, async snap => {
            const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setMessages(msgs);

            const unread = msgs.filter(
                m => !m.readBy?.includes(currentUser.uid) &&
                    m.senderId !== currentUser.uid
            );

            if (unread.length > 0) {
                const batch = writeBatch(db);
                unread.forEach(m => {
                    const ref = doc(db, 'chats', chatId, 'messages', m.id);
                    batch.update(ref, {
                        readBy: [...new Set([...(m.readBy || []), currentUser.uid])]
                    });
                });
                batch.set(metaRef, { lastSeen: serverTimestamp() }, { merge: true });
                await batch.commit();
            }
        });
    }, [lastSeen]); // added dependency



    useEffect(() => {
        // if (!hasScrolledInitially.current && messages.length > 0) {
        //     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        //     hasScrolledInitially.current = true;
        // }
        bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }, [messages]);

    useEffect(() => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'users', currentUser.uid);

        const delay = 2000;
        let typingTimeout;

        if (text.trim()) {
            updateDoc(userDocRef, { typingTo: otherUser.uid });
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                updateDoc(userDocRef, { typingTo: null });
            }, delay);
        } else {
            updateDoc(userDocRef, { typingTo: null });
        }

        return () => clearTimeout(typingTimeout);
    }, [text]);


    const send = async () => {
        if (!text.trim()) return;
        const msg = {
            text: text.trim(),
            senderId: currentUser.uid,
            createdAt: serverTimestamp(),
            readBy: [currentUser.uid]
        };
        await addDoc(msgRef, msg);
        setText('');
        setShowEmoji(false);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('new-msg-divider').style.display = 'none';
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1e1e1e',
            color: '#fff',
        }}>
            {/* Header */}
            <div style={{
                height: 60,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#2e2e2e',
                padding: '0 15px',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100,
            }}>
                <button onClick={onBack} style={{ fontSize: 24, color: '#fff', background: 'none', border: 'none' }}>←</button>
                <img src={liveUser.photoURL || '../src/assets/avatar.png'} alt="" style={{ width: 35, height: 35, borderRadius: 20, marginLeft: 10 }} />
                <div style={{ marginLeft: 10 }}>
                    <div>{liveUser.name}</div>
                    <small style={{ color: liveUser.online ? 'lime' : 'gray' }}>
                        {liveUser.online ? 'Online' : 'Offline'}
                    </small>
                </div>
            </div>

            {/* Chat Body */}
            <div style={{
                flex: 1,
                marginTop: 60,
                marginBottom: 80,
                overflowY: 'auto',
                padding: '20px 0',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
            }}>
                <div style={{ padding: '0 20px' }}>
                    {
                        (() => {
                            let insertedDivider = false;
                            // {
                                return messages.map(m => {
                                    const isSender = m.senderId === currentUser.uid;
                                    const ts = m.createdAt?.toDate?.().getTime?.();
                                    const isNew = !insertedDivider && !!prevLastSeen && !!ts && ts > prevLastSeen && !isSender;

                                    if (isNew) insertedDivider = true;

                                    return (
                                        <MessageBubble
                                            key={m.id}
                                            message={m}
                                            isSender={isSender}
                                            isNew={isNew}
                                            otherUser={otherUser}
                                        />
                                    );
                                })
                            // }

                            // return messages.map((m) => {
                            //     const isSender = m.senderId === currentUser.uid;
                            //     const ts = m.createdAt?.toDate?.().getTime?.();
                            //     const isNew = !insertedDivider && !!prevLastSeen && !!ts && ts > prevLastSeen && !isSender;

                            //     if (isNew) insertedDivider = true;
                            //     // console.log('Msg:', m.text, 'CreatedAt:', ts, 'LastSeen:', lastSeen, 'Prev:', prevLastSeen, 'IsNew:', isNew);

                            //     return (
                            //         <React.Fragment key={m.id}>
                            //             {isNew && (
                            //                 <div id="new-msg-divider" style={{
                            //                     textAlign: 'center', margin: '30px 0 10px',
                            //                     color: '#bbb', fontSize: 13, fontStyle: 'italic'
                            //                 }}>
                            //                     — New Messages —
                            //                 </div>
                            //             )}
                            //             <div style={{
                            //                 display: 'flex',
                            //                 justifyContent: isSender ? 'flex-end' : 'flex-start',
                            //                 marginBottom: 10
                            //             }}>
                            //                 <div style={{
                            //                     background: isSender ? '#DCF8C6' : '#fff',
                            //                     color: '#000',
                            //                     padding: 10,
                            //                     borderRadius: 15,
                            //                     maxWidth: '75%',
                            //                     wordBreak: 'break-word'
                            //                 }}>
                            //                     <div>{typeof m.text === 'string' && m.text.trim() ? m.text : ''}</div>
                            //                     <div style={{ fontSize: 10, textAlign: 'right', marginTop: 5 }}>
                            //                         {m.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            //                         {isSender && (
                            //                             <span style={{ marginLeft: 5 }}>
                            //                                 {m.readBy?.includes(otherUser.uid) ? '✔✔' : '✔'}
                            //                             </span>
                            //                         )}
                            //                     </div>
                            //                 </div>
                            //             </div>
                            //         </React.Fragment>
                            //     );
                            // });
                        })()
                    }
                    <div ref={bottomRef}></div>
                </div>
            </div>

            {/* Typing */}
            {liveUser.typingTo === currentUser.uid && (
                <div style={{
                    position: 'absolute',
                    bottom: 70,
                    left: 20,
                    fontSize: 13,
                    color: '#ccc',
                }}>Typing...</div>
            )}

            {/* Emoji Picker */}
            {showEmoji && (
                <div style={{ position: 'absolute', bottom: 80, zIndex: 99 }}>
                    <Picker data={data} theme="dark" onEmojiSelect={e => setText(prev => prev + e.native)} />
                </div>
            )}

            {/* Input */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#2c2c2c',
                padding: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                zIndex: 10,
            }}>
                <button onClick={() => {
                    setShowEmoji(!showEmoji);
                    setTimeout(() => inputRef.current?.focus(), 100);
                }} style={{ fontSize: 20, background: 'none', border: 'none', color: '#fff' }}>😊</button>
                <input
                    ref={inputRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={e => e.key === 'Enter' && send()}
                    style={{
                        flex: 1, padding: 10, borderRadius: 20,
                        border: 'none', outline: 'none',
                        background: '#444', color: '#fff'
                    }}
                />
                <button onClick={send} style={{
                    background: '#4CAF50', color: '#fff',
                    border: 'none', padding: '10px 20px',
                    borderRadius: 20
                }}>
                    Send
                </button>
            </div>
        </div>
    );
}
