import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { LogOut, Users, ShieldAlert, CheckCircle, Crown, Trash2, Plus, UploadCloud, X, BellRing, Send, AlertTriangle, Battery, BatteryCharging, Wifi, Signal } from 'lucide-react';
import LiveMap from '../components/LiveMap';
import { sendBroadcast } from '../services/NotificationService';

const SUPER_ADMIN_EMAIL = "letterchats@gmail.com";

export default function DashboardScreen() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [words, setWords] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(false);
    const [sosAlert, setSosAlert] = useState<any>(null);

    const [newWord, setNewWord] = useState('');
    const [bulkList, setBulkList] = useState('');
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastBody, setBroadcastBody] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userList);
            userList.forEach((user: any) => {
                if (user.lastLocation?.status === 'SOS') {
                    const timeDiff = new Date().getTime() - (user.lastLocation.timestamp?.toMillis() || 0);
                    if (timeDiff < 5 * 60 * 1000) {
                        setSosAlert({ email: user.email, ...user.lastLocation });
                    }
                }
            });
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (activeTab === 'words') {
            const q = query(collection(db, 'banned_words'), orderBy('createdAt', 'desc'));
            const unsub = onSnapshot(q, (snap) => setWords(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
            return () => unsub();
        }
    }, [activeTab]);

    const handleLogout = () => { signOut(auth); navigate('/'); };
    const handleRoleChange = async (id: string, email: string, newRole: string) => { if (email === SUPER_ADMIN_EMAIL) { alert("⛔ HATA: Patron hesabı değiştirilemez!"); return; } await updateDoc(doc(db, 'users', id), { role: newRole }); };
    
    // 🔥 GÜNCELLENEN ONAY FONKSİYONU (MAİL ATAR)
    const approveUser = async (id: string, email: string) => {
        if (window.confirm('Bu kullanıcıyı onaylıyor musun?')) {
            await updateDoc(doc(db, 'users', id), { isApproved: true });
            
            // 🔥 MAİL GÖNDERME PENCERESİNİ AÇAR
            if (window.confirm('Kullanıcıya "Giriş Yapabilirsin" maili gönderilsin mi?')) {
                const subject = "LetterChat Hesap Onayı";
                const body = "Hesabınız başarıyla onaylandı. Uygulamaya giriş yapabilirsiniz.";
                window.open(`mailto:${email}?subject=${subject}&body=${body}`);
            }
        }
    };

    const togglePremium = async (id: string, email: string, status: boolean) => { if (email === SUPER_ADMIN_EMAIL) { alert("⛔ Patron zaten sonsuz Premium'dur!"); return; } await updateDoc(doc(db, 'users', id), { isPremium: !status }); };
    const deleteUser = async (id: string, email: string) => { if (email === SUPER_ADMIN_EMAIL) { alert("⛔ SAKIN! Patron hesabı silinemez!"); return; } if (window.confirm('DİKKAT: Kullanıcı tamamen silinecek! Emin misin?')) { await deleteDoc(doc(db, 'users', id)); } };
    const addSingleWord = async (e: React.FormEvent) => { e.preventDefault(); if (!newWord.trim()) return; try { await addDoc(collection(db, 'banned_words'), { word: newWord.toLowerCase().trim(), createdAt: serverTimestamp() }); setNewWord(''); } catch (error) { alert('Hata oluştu'); } };
    const deleteWord = async (id: string) => { await deleteDoc(doc(db, 'banned_words', id)); };
    const handleBulkUpload = async () => { if (!bulkList) return; if (!window.confirm(`Yüklemek istiyor musun?`)) return; setLoading(true); try { const rawWords = bulkList.split(/[\n,]+/).map(w => w.trim().toLowerCase()).filter(w => w.length > 0); const batch = writeBatch(db); const wordsToUpload = rawWords.slice(0, 450); wordsToUpload.forEach(word => { const ref = doc(collection(db, 'banned_words')); batch.set(ref, { word, createdAt: serverTimestamp() }); }); await batch.commit(); alert(`${wordsToUpload.length} kelime eklendi!`); setBulkList(''); } catch (e: any) { alert('Hata: ' + e.message); } finally { setLoading(false); } };
    const handleSendBroadcast = async () => { if (!broadcastTitle || !broadcastBody) { alert("Başlık ve mesaj giriniz."); return; } if (!window.confirm("TÜM kullanıcılara gönderilecek?")) return; const tokens = users.map(u => u.pushToken).filter(t => t); if (tokens.length === 0) { alert("Token yok."); return; } await sendBroadcast(tokens, broadcastTitle, broadcastBody); alert("📢 Gönderildi!"); setBroadcastTitle(''); setBroadcastBody(''); };

    const totalUsers = users.length;
    const pendingUsers = users.filter(u => !u.isApproved).length;
    const premiumUsers = users.filter(u => u.isPremium).length;

    return (
        <div style={styles.container}>
            {sosAlert && (
                <div style={styles.sosOverlay}>
                <div style={styles.sosBox}>
                    <AlertTriangle size={60} color="white" />
                    <h1>ACİL DURUM / SOS!</h1>
                    <p style={{fontSize: '20px', color: 'white'}}><b>{sosAlert.email}</b> Panik Butonuna Bastı!</p>
                    <p style={{color: '#ffebee'}}>Konum: {sosAlert.latitude}, {sosAlert.longitude}<br />Hız: {sosAlert.speed} m/s</p>
                    <div style={{display:'flex', gap:'10px', marginTop:'20px', justifyContent:'center'}}>
                    <button onClick={() => window.open(`https://www.google.com/maps?q=${sosAlert.latitude},${sosAlert.longitude}`, '_blank')} style={styles.btnMap}>Harita</button>
                    <button onClick={() => setSosAlert(null)} style={styles.btnCloseSOS}>Kapat</button>
                    </div>
                </div>
                </div>
            )}

            <div style={styles.sidebar}>
                <div>
                    <h2 style={{ color: 'white', padding: '20px', borderBottom: '1px solid #34495e' }}>Admin Panel</h2>
                    <ul style={styles.menu}>
                        <li style={activeTab === 'users' ? styles.activeItem : styles.menuItem} onClick={() => setActiveTab('users')}><Users size={18} /> Kullanıcılar & Yetki</li>
                        <li style={activeTab === 'words' ? styles.activeItem : styles.menuItem} onClick={() => setActiveTab('words')}><ShieldAlert size={18} /> Yasaklı Kelimeler</li>
                        <li style={activeTab === 'broadcast' ? styles.activeItem : styles.menuItem} onClick={() => setActiveTab('broadcast')}><BellRing size={18} /> Duyuru Yap</li>
                    </ul>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}> <LogOut size={18} /> Çıkış Yap</button>
            </div>

            <div style={styles.content}>
                {activeTab === 'users' && (
                    <>
                        <div style={styles.header}>
                            <LiveMap users={users} />
                            <h1 style={{marginTop: '20px'}}>Kullanıcılar ve Yetkiler 🛡️</h1>
                            <div style={styles.statsGrid}>
                                <div style={styles.statCard}><h3>Toplam Üye</h3><h1>{totalUsers}</h1></div>
                                <div style={{ ...styles.statCard, borderLeft: '5px solid orange' }}><h3>Onay Bekleyen</h3><h1>{pendingUsers}</h1></div>
                                <div style={{ ...styles.statCard, borderLeft: '5px solid gold' }}><h3>Premium Üye</h3><h1>{premiumUsers}</h1></div>
                            </div>
                        </div>
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                                        <th style={styles.th}>Kullanıcı</th>
                                        <th style={styles.th}>Cihaz Durumu 📱</th>
                                        <th style={styles.th}>Rol</th>
                                        <th style={styles.th}>Durum</th>
                                        <th style={styles.th}>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => {
                                        const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
                                        const battery = user.lastLocation?.battery;
                                        const isCharging = user.lastLocation?.isCharging;
                                        const connection = user.lastLocation?.connection;
                                        
                                        return (
                                            <tr key={user.id} style={{ borderBottom: '1px solid #eee', backgroundColor: isSuperAdmin ? '#f3e8ff' : 'white' }}>
                                                <td style={styles.td}>
                                                    <div style={{ fontWeight: 'bold' }}>{user.email} {isSuperAdmin && "👑"}</div>
                                                    <div style={{ fontSize: '12px', color: '#888' }}>{user.uid}</div>
                                                    <div style={{ fontSize: '11px', color: '#666' }}>{user.lastLocation?.device || 'Bilinmiyor'}</div>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                                        <div title={isCharging ? "Şarj Oluyor" : "Pil"} style={{display:'flex', alignItems:'center', gap:'5px', color: battery < 20 ? 'red' : 'green'}}>
                                                            {isCharging ? <BatteryCharging size={18}/> : <Battery size={18}/>} 
                                                            <b>%{battery || '?'}</b>
                                                        </div>
                                                        <div title="İnternet" style={{display:'flex', alignItems:'center', gap:'5px', color: '#3498db'}}>
                                                            {connection === 'WIFI' ? <Wifi size={18}/> : <Signal size={18}/>}
                                                            <span style={{fontSize:'12px'}}>{connection || '?'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <select style={styles.select} value={user.role || 'user'} onChange={(e) => handleRoleChange(user.id, user.email, e.target.value)} disabled={isSuperAdmin}>
                                                        <option value="user">Kullanıcı</option>
                                                        <option value="admin">Yönetici</option>
                                                    </select>
                                                </td>
                                                <td style={styles.td}>{user.isApproved ? <span style={{ color: 'green' }}>Aktif</span> : <span style={{ color: 'orange' }}>Bekliyor</span>}</td>
                                                <td style={styles.td}>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        {/* 🔥 BURASI GÜNCELLENDİ: ARTIK EMAİL DE GÖNDERİYOR */}
                                                        {!user.isApproved && <button onClick={() => approveUser(user.id, user.email)} style={styles.btnGreen}><CheckCircle size={16} /></button>}
                                                        
                                                        <button onClick={() => togglePremium(user.id, user.email, user.isPremium)} style={{ ...styles.btnGold, opacity: isSuperAdmin ? 0.5 : 1 }} disabled={isSuperAdmin}><Crown size={16} /></button>
                                                        <button onClick={() => deleteUser(user.id, user.email)} style={{ ...styles.btnRed, opacity: isSuperAdmin ? 0.5 : 1 }} disabled={isSuperAdmin}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {/* Diğer Tablar (Words, Broadcast) kodun devamında aynı... */}
                {activeTab === 'words' && (
                    <>
                        <div style={styles.header}><h1>Sansür Sistemi 🤬</h1></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={styles.tableContainer}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <h3>Aktif Kelimeler ({words.length})</h3>
                                    <form onSubmit={addSingleWord} style={{ display: 'flex', gap: '5px' }}>
                                        <input style={styles.input} placeholder="Kelime ekle..." value={newWord} onChange={e => setNewWord(e.target.value)} />
                                        <button type="submit" style={styles.btnGreen}><Plus size={18} /></button>
                                    </form>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                                    {words.map(w => (
                                        <div key={w.id} style={styles.wordChip}>
                                            {w.word}
                                            <X size={14} style={{ cursor: 'pointer' }} onClick={() => deleteWord(w.id)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={styles.tableContainer}>
                                <h3>🚀 Toplu Yükleme</h3>
                                <textarea style={styles.textarea} rows={10} placeholder="Virgülle ayırarak girin..." value={bulkList} onChange={e => setBulkList(e.target.value)} />
                                <button onClick={handleBulkUpload} style={{ ...styles.btnBlue, width: '100%', marginTop: '10px' }} disabled={loading}>{loading ? '...' : <><UploadCloud size={18} /> Yükle</>}</button>
                            </div>
                        </div>
                    </>
                )}
                {activeTab === 'broadcast' && (
                    <>
                         <div style={styles.header}><h1>📢 Toplu Duyuru Merkezi</h1></div>
                         <div style={styles.tableContainer}>
                            <p style={{marginBottom: '15px', color: '#555'}}>Bu alandan göndereceğiniz mesaj, uygulaması yüklü olan <b>{users.length}</b> kullanıcının telefonuna "Bildirim" olarak gidecektir.</p>
                            <label style={{fontWeight: 'bold', display:'block', marginBottom:'5px'}}>Başlık</label>
                            <input style={{...styles.input, width: '100%', marginBottom: '15px'}} placeholder="Örn: Sistem Bakımı" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} />
                            <label style={{fontWeight: 'bold', display:'block', marginBottom:'5px'}}>Mesaj İçeriği</label>
                            <textarea style={styles.textarea} rows={5} placeholder="Duyurunuzu buraya yazın..." value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)} />
                            <button style={{...styles.btnBlue, marginTop: '20px', width: '100%', fontSize: '18px'}} onClick={handleSendBroadcast}><Send size={20} /> GÖNDER</button>
                         </div>
                    </>
                )}
            </div>
        </div>
    );
}

const styles: any = {
    container: { display: 'flex', height: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f8' },
    sidebar: { width: '260px', backgroundColor: '#2c3e50', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#ecf0f1' },
    menu: { listStyle: 'none', padding: 0, margin: 0 },
    menuItem: { padding: '15px 20px', display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #34495e', transition: '0.3s' },
    activeItem: { padding: '15px 20px', display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', backgroundColor: '#34495e', borderLeft: '4px solid #3498db' },
    logoutBtn: { backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px', width: '100%' },
    content: { flex: 1, padding: '30px', overflowY: 'auto' },
    header: { marginBottom: '30px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' },
    statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center', borderLeft: '5px solid #7b13d1' },
    tableContainer: { backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '15px', color: '#555', borderBottom: '2px solid #eee' },
    td: { padding: '15px', color: '#333' },
    btnGreen: { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    btnGold: { backgroundColor: '#f1c40f', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    btnRed: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    btnBlue: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' },
    input: { padding: '8px', borderRadius: '5px', border: '1px solid #ddd', outline: 'none' },
    textarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', resize: 'vertical' as 'vertical' },
    wordChip: { backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' },
    select: { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' },
    sosOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
    sosBox: { backgroundColor: '#c0392b', padding: '40px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: 'white' },
    btnMap: { padding: '15px 30px', fontSize: '18px', cursor: 'pointer', border: 'none', borderRadius: '10px', backgroundColor: 'white', color: '#c0392b', fontWeight: 'bold' },
    btnCloseSOS: { padding: '15px 30px', fontSize: '18px', cursor: 'pointer', border: '2px solid white', borderRadius: '10px', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold' }
};
