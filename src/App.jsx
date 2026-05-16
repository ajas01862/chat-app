import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Login from './pages/Login';
import Register from './pages/Register';
import UserList from './components/UserList';
import PrivateChat from './components/PrivateChat';



function generateChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentView, setCurrentView] = useState('userList');



  useEffect(() => {
    onAuthStateChanged(auth, setUser);
  }, []);

  if (!user) {
    return showRegister ? (
      <>
        <Register toggle={() => setShowRegister(false)} />
        {/* <Register />
        <p onClick={() => setShowRegister(false)}>Already have an account?</p> */}
      </>
    ) : (
      <>
        <Login toggle={() => setShowRegister(true)} />
        {/* <Login />
        <p style={{ cursor: 'pointer' }} onClick={() => setShowRegister(true)}>No account? Register</p> */}
      </>
    );
  }

  return (
    <>


      {currentView === 'userList' && (
        <UserList
          onSelect={(otherUser) => {
            setSelectedUser(otherUser);
            setCurrentView('chat');
          }}
          cUser={user}
        />
      )}

      {currentView === 'chat' && selectedUser && (
        <PrivateChat
          chatId={generateChatId(user.uid, selectedUser.uid)}
          otherUser={selectedUser}
          onBack={() => {
            setCurrentView('userList');
            setSelectedUser(null);
          }}
        />
      )}
    </>
  );
}

export default App;
