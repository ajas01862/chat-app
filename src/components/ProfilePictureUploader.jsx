// src/components/ProfilePictureUploader.jsx
import React, { useEffect, useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { updateProfile } from 'firebase/auth';

export default function ProfilePictureUploader() {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const uploadBtnRef = useRef(null);

    useEffect(() => {
        if (image && uploadBtnRef.current) {
            uploadBtnRef.current.style.display = "block";
        }
    }, [image]);

    const uploadImage = async () => {
        if (!image) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'unsigned_chat'); // your preset
        formData.append('folder', 'chat-avatars');

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/ddjh6iwsy/image/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            const imageUrl = data.secure_url;

            // Save to Firestore
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, { photoURL: imageUrl });
            await updateProfile(auth.currentUser, {
                photoURL: imageUrl // your Cloudinary image URL
            });

            alert('Profile picture updated!');
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input id="uploadImg" ref={fileInputRef} style={{ display: 'none' }} type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
            <button ref={uploadBtnRef} style={{ display: 'none' }} onClick={uploadImage} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
}
