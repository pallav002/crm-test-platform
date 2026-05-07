import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Clock, Play, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CandidateDashboard = () => {
    const [tests, setTests] = useState([]);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await api.get('/candidate/available-tests');
            setTests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Available Assessments</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Hello, {user?.full_name}. Ready for your test?</p>
                </div>
                <button onClick={logout} className="btn" style={{ border: '1px solid var(--border)' }}>
                    <LogOut size={18} /> Logout
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {tests.length === 0 ? (
                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                        <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                        <h3>No Tests Available</h3>
                        <p style={{ color: 'var(--text-muted)' }}>You have completed all assigned assessments or none are active.</p>
                    </div>
                ) : (
                    tests.map(test => (
                        <div key={test.id} className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem' }}>{test.title}</h2>
                                <div style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    color: 'var(--primary)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}>
                                    <Clock size={14} /> {test.duration_minutes}m
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', height: '3rem', overflow: 'hidden' }}>
                                {test.description || 'No description provided for this assessment.'}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Questions</p>
                                    <p style={{ fontWeight: '600' }}>{test.questions?.length || 0} Total</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/test/${test.id}`)}
                                    className="btn btn-primary"
                                    style={{ flex: 2 }}
                                >
                                    <Play size={18} /> Start Test
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CandidateDashboard;
