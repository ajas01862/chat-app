import React, { useEffect, useState, useMemo } from 'react';
import { db, auth } from '../firebase/config';
import { collection, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import usePresence from '../hooks/usePresence';
import './useList.css';
import UserBubble from './userBubble.jsx';
import ProfilePictureUploader from './ProfilePictureUploader';

import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';

export default function UserList({ onSelect, cUser }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    // const [isHovered, setIsHovered] = useState(false);
    const [userName, setUserName] = useState('');
    const [emailId, setEmailId] = useState('');

    useEffect(() => {
        const fetchName = async () => {
            try {
                const uid = auth.currentUser?.uid;
                if (!uid) return;

                const docRef = doc(db, 'users', uid);
                const userSnap = await getDoc(docRef);

                if (userSnap.exists()) {
                    setUserName(userSnap.data().name);
                    setEmailId(userSnap.data().email);
                } else {
                    console.log('User not found in Firestore');
                }
            } catch (err) {
                console.error('Error fetching user name:', err);
            }
        };

        fetchName();
    }, []);

    // useEffect(() => {
    //     const usersRef = collection(db, 'users');
    //     const unsub = onSnapshot(usersRef, snapshot => {
    //         const list = snapshot.docs
    //             .map(doc => doc.data())
    //             .filter(u => u.uid !== auth.currentUser?.uid);
    //         setUsers(list);
    //         setLoading(false);
    //     }, err => {
    //         console.error('Error fetching users:', err);
    //         setLoading(false);
    //     });

    //     return () => unsub();
    // }, []);
    // 👇 At top of component

    const cld = new Cloudinary({ cloud: { cloudName: 'ddjh6iwsy' } });

    function extractPublicId(URL) {
        if (!URL) return null;

        const match = URL.match(/upload\/(?:v\d+\/)?(.+?)(?:\.(jpg|png|jpeg|webp|gif))?$/i);
        return match ? match[1] : null;
    }

    const publicId = extractPublicId(cUser.photoURL) ||
        extractPublicId('https://res.cloudinary.com/ddjh6iwsy/image/upload/v1750707336/avatar_dxq7yw.png');

    // console.log("Uid" + cUser.uid + "URL: " + cUser.photoURL);

    const img = cld.image(publicId)
        .format('auto')
        .quality('auto')
        .resize(auto().gravity(autoGravity()).width(55).height(55));

    function getChatId(a, b) {
        return a < b ? a + b : b + a;
    }

    useEffect(() => {
        const usersRef = collection(db, 'users');
        const unsub = onSnapshot(usersRef, async (snapshot) => {
            const allUsers = snapshot.docs
                .map(doc => doc.data())
                .filter(u => u.uid !== auth.currentUser?.uid);

            const currentUid = auth.currentUser?.uid;
            const filtered = [];

            for (const user of allUsers) {
                const chatId = getChatId(currentUid, user.uid);
                const messagesSnap = await getDocs(collection(db, 'chats', chatId, 'messages'));
                if (!messagesSnap.empty) {
                    filtered.push(user);
                }
            }

            // const publicId = extractPublicId(auth.currentUser.photoURL) ||
            //     extractPublicId('https://res.cloudinary.com/ddjh6iwsy/image/upload/v1750707336/avatar_dxq7yw.png');

            // console.log("Id: " + publicId + " url: " + auth.currentUser.photoURL);
            // img = cld.image(publicId)
            //     .format('auto')
            //     .quality('auto')
            //     .resize(auto().gravity(autoGravity()).width(100).height(100));

            setUsers(filtered);
            setLoading(false);
        }, err => {
            console.error('Error fetching users:', err);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            const usersRef = collection(db, 'users');
            const unsub = onSnapshot(usersRef, async (snapshot) => {
                const allUsers = snapshot.docs
                    .map(doc => doc.data())
                    .filter(u => u.uid !== auth.currentUser?.uid);

                const currentUid = auth.currentUser?.uid;
                const filtered = [];

                for (const user of allUsers) {
                    const chatId = getChatId(currentUid, user.uid);
                    const messagesSnap = await getDocs(collection(db, 'chats', chatId, 'messages'));
                    if (!messagesSnap.empty) {
                        filtered.push(user);
                    }
                }

                // const publicId = extractPublicId(auth.currentUser.photoURL) ||
                //     extractPublicId('https://res.cloudinary.com/ddjh6iwsy/image/upload/v1750707336/avatar_dxq7yw.png');

                // console.log("Id: " + publicId + " url: " + auth.currentUser.photoURL);
                // img = cld.image(publicId)
                //     .format('auto')
                //     .quality('auto')
                //     .resize(auto().gravity(autoGravity()).width(100).height(100));

                setUsers(filtered);
                setLoading(false);
            }, err => {
                console.error('Error fetching users:', err);
                setLoading(false);
            });
            // setUsers([]);
            return;
        }

        const usersRef = collection(db, 'users');
        const unsub = onSnapshot(usersRef, snapshot => {
            const list = snapshot.docs
                .map(doc => doc.data())
                .filter(u =>
                    u.uid !== auth.currentUser?.uid &&
                    (
                        u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase())
                    )
                );
            setUsers(list);
            setLoading(false);
        }, err => {
            console.error('Error fetching users:', err);
            setLoading(false);
        });

        return () => unsub();
    }, [search]);


    // Live presence for current user
    usePresence();

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );

    // if (loading) return <p style={{ color: '#fff', padding: '20px' }}>Loading users...</p>;

    return (
        <div style={{
            padding: '20px',
            // maxWidth: '500px',
            width: '100vw',
            height: '100vh',
            margin: '0 auto',
            color: '#fff',
            backgroundColor: '#1e1e1e',
            borderRadius: '10px'
        }}>
            {/* ✅ Show Cloudinary avatar */}
            <div style={{
                padding: 5,
                display: 'flex',
                alignItems: 'center',
                gap: 10
            }}>
                <div style={{
                    width: 55,
                    height: 55,
                    borderRadius: '50%',
                    overflow: 'hidden'
                }}>
                    <AdvancedImage onClick={() => document.getElementById("uploadImg").click()} cldImg={img} style={{ width: '100%', height: '100%', borderRadius: '50%', cursor: 'pointer' }} />
                </div>

                {/* <h4 style={{ color: '#fff', margin: 0 }}>{userName}</h4><br />
                <p style={{ fontSize: '0.85em' }}>{emailId}</p> */}

                {/* 👇 Stack name and message vertically */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ color: '#fff', margin: 0 }}>{userName || "User"}</h4>
                    <p style={{ color: '#bbb', fontSize: '0.85em', margin: 0 }}>{emailId}</p>
                </div>
                {/* {showUploader && <ProfilePictureUploader />} */}
            </div>
            <div>
                <ProfilePictureUploader />
            </div>
            <h3 style={{ marginLeft: '5%', marginBottom: '10px' }}>People</h3>

            <input
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                    width: '30%',
                    position: 'relative',
                    left: '4%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    marginBottom: '15px',
                    backgroundColor: '#2a2a2a',
                    color: '#fff'
                }}
            />

            {filteredUsers.length === 0 ? (
                <p style={{ marginLeft: '5%', color: '#aaa' }}>No users found.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {filteredUsers.map(user => (
                        <li key={user.uid} style={{ marginBottom: '10px' }}>
                            {/* (() => { */}
                            {/* return( */}
                            <UserBubble key={user.uid} userId={user} pic={user.photoURL} name={user.name} email={user.email} online={user.online} select={onSelect} />
                            {/* ); */}
                            {/* // }) */}

                            {/* <button
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                onClick={() => onSelect(user)}
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
                                        src={user.photoURL || '../src/assets/avatar.png'}
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
                                            backgroundColor: user.online ? 'green' : 'gray',
                                            borderRadius: '50%',
                                            border: '2px solid #333'
                                        }}
                                    />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{user.name || 'Unnamed User'}</div>
                                    <div style={{ fontSize: '0.85em', color: '#bbb' }}>{user.email || 'No email'}</div>
                                </div>
                            </button> */}
                        </li>
                    ))}
                </ul>
            )}
            <div className='signOut'>
                <button onClick={() => auth.signOut()}>Logout</button>
            </div>
        </div>
    );
}
