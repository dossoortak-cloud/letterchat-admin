import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';

function App() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Yükleniyor...</div>;

    return (
        <Router>
            <Routes>
                <Route path="/" element={!user ? <LoginScreen /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={user ? <DashboardScreen /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;