import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Giriş Yap
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Admin Kontrolü (Şimdilik mail ile, sonra veritabanı rolüyle yapacağız)
            if (user.email === "letterchats@gmail.com") {
                navigate('/dashboard'); // Başarılıysa Panele git
            } else {
                setError("Yetkisiz Giriş! Sadece Admin girebilir.");
                await auth.signOut();
            }
        } catch (err: any) {
            setError("Giriş başarısız. Bilgileri kontrol et.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>LetterChat Admin</h1>
                <p style={styles.subtitle}>Yönetim Paneli Girişi</p>

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <Mail size={20} color="#666" />
                        <input
                            type="email"
                            placeholder="Admin Maili"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <Lock size={20} color="#666" />
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    {error && <p style={styles.error}>{error}</p>}

                    <button type="submit" style={styles.button}>GİRİŞ YAP</button>
                </form>
            </div>
        </div>
    );
}

// Basit CSS (Web için)
const styles = {
    container: {
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3e8ff', fontFamily: 'Arial, sans-serif'
    },
    card: {
        backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' as 'center'
    },
    title: { color: '#7b13d1', marginBottom: '10px' },
    subtitle: { color: '#666', marginBottom: '30px' },
    form: { display: 'flex', flexDirection: 'column' as 'column', gap: '15px' },
    inputGroup: {
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9'
    },
    input: { border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '16px' },
    button: {
        backgroundColor: '#7b13d1', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
    },
    error: { color: 'red', fontSize: '14px' }
};