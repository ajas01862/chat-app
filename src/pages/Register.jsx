import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { setDoc, doc } from 'firebase/firestore';

export default function Register({ toggle }) {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !pass.trim()) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(res.user, { displayName: name });

            await setDoc(doc(db, 'users', res.user.uid), {
                uid: res.user.uid,
                name,
                email,
                photoURL: res.user.photoURL || 'https://res.cloudinary.com/ddjh6iwsy/image/upload/v1750707336/avatar_dxq7yw.png',
                online: true,
                typingTo: ""
            });

            alert('Registered successfully!');
            setEmail('');
            setName('');
            setPass('');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already in use.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f7f7f7',
            color: '#333'
        }}>
            <div style={{
                padding: '30px',
                maxWidth: '400px',
                width: '100%',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ textAlign: 'center' }}>Register</h2>

                <input
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={inputStyle}
                />
                <input
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    type="email"
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    style={inputStyle}
                />
                <input
                    onKeyDown={e => e.key === 'Enter' && handleSignup()}
                />


                {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

                <button
                    onClick={handleSignup}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginTop: '20px',
                        border: 'none',
                        borderRadius: '5px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
                <p
                    style={{ textAlign: 'center', marginTop: '15px', cursor: 'pointer', color: '#007bff' }}
                    onClick={toggle}
                >
                    Already have an account?
                </p>

            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px'
};
