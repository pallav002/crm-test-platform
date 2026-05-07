import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Home, CheckCircle, ShieldCheck, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Results = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const score = location.state?.score ?? 0;
    const totalMarks = location.state?.totalMarks ?? 0;
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            padding: '2rem'
        }}>
            <div className="glass-card animate-fade-in" style={{
                padding: '4rem 3rem',
                textAlign: 'center',
                maxWidth: '600px',
                width: '100%',
                position: 'relative'
            }}>
                <div style={{
                    width: '90px',
                    height: '90px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2.5rem',
                    color: 'var(--success)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                    <Trophy size={45} strokeWidth={1.5} />
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', fontWeight: '700' }}>Assessment Complete</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
                        Thank you, {user?.full_name || 'Candidate'}. Your performance data has been securely synchronized with the **TestFlow** database.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem',
                    marginBottom: '3.5rem'
                }}>
                    <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Final Score</p>
                        <h3 style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary)' }}>
                            {score}<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '400' }}>/{totalMarks}</span>
                        </h3>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Accuracy</p>
                        <h3 style={{ fontSize: '3rem', fontWeight: '700', color: percentage >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                            {Math.round(percentage)}<span style={{ fontSize: '1.25rem', fontWeight: '400', opacity: 0.6 }}>%</span>
                        </h3>
                    </div>
                </div>

                <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    marginBottom: '3.5rem',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                        <ShieldCheck size={20} />
                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>Electronic Submission Verified</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
                        Certificate verification ID has been generated. You may now safely exit the examination environment.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-primary"
                        style={{ flex: 1, height: '3.75rem', fontSize: '1.1rem' }}
                    >
                        <Home size={22} /> Return to Portal
                    </button>
                </div>

                <div style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.5 }}>
                    &copy; 2025 TestFlow &bull; Professional Assessment Series
                </div>
            </div>
        </div>
    );
};

export default Results;
