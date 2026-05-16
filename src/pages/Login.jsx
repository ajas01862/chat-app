import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function Login({ onLogin, toggle }) {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !pass.trim()) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            setEmail('');
            setPass('');
            onLogin(); // Call parent handler to navigate to the next screen
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setError('No user found with this email.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password.');
            } else {
                setError('Login failed. Please try again.');
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
            overflow: 'hidden',
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
                <h2 style={{ textAlign: 'center' }}>Login</h2>

                <input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    style={inputStyle}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />

                {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginTop: '20px',
                        border: 'none',
                        borderRadius: '5px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
                <p
                    style={{ textAlign: 'center', marginTop: '15px', cursor: 'pointer', color: '#007bff' }}
                    onClick={toggle}
                >
                    No account? Register
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
