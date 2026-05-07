import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, AlertCircle, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(username, password);
            if (user.is_admin) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again or contact your administrator.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            // Light, colorful gradient background as requested
            background: 'linear-gradient(135deg, #f3e7e9 0%, #e3eeff 50%, #fef5f5 100%)',
            color: '#1e293b',
            fontFamily: 'var(--font-main)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Top Navigation */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 4rem',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'var(--primary)', color: 'white'
                    }}>
                        <ShieldCheck size={20} />
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                        Test<span style={{ color: 'var(--primary)' }}>Flow</span>
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {!showLogin && (
                        <button 
                            onClick={() => setShowLogin(true)}
                            style={{
                                padding: '0.6rem 1.75rem',
                                borderRadius: '2rem',
                                border: '2px solid var(--text-muted)',
                                background: 'transparent',
                                color: '#1e293b',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
                            onMouseOut={(e) => { e.target.style.borderColor = 'var(--text-muted)'; e.target.style.color = '#1e293b'; }}
                        >
                            Log in
                        </button>
                    )}
                    <button 
                        onClick={() => setShowLogin(true)}
                        style={{
                            padding: '0.6rem 1.75rem',
                            borderRadius: '2rem',
                            border: 'none',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        Try for free
                    </button>
                </div>
            </header>

            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                {!showLogin ? (
                    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ 
                            fontSize: '4.25rem', 
                            fontWeight: '800', 
                            lineHeight: '1.1',
                            marginBottom: '1.5rem',
                            color: '#111827',
                            letterSpacing: '-0.03em'
                        }}>
                            Streamline your hiring with <span style={{ color: 'var(--primary)' }}>secure online assessments</span>
                        </h2>
                        <p style={{
                            fontSize: '1.3rem',
                            color: '#475569',
                            marginBottom: '3rem',
                            lineHeight: '1.5',
                            maxWidth: '700px',
                            margin: '0 auto 3rem auto'
                        }}>
                            Effortlessly create targeted tests, manage candidates, ensure a secure exam environment, and instantly access real-time results to hire the best talent faster.
                        </p>
                        <button 
                            onClick={() => setShowLogin(true)}
                            style={{
                                padding: '1.2rem 3rem',
                                fontSize: '1.1rem',
                                borderRadius: '3rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, var(--accent), var(--secondary))',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 10px 25px rgba(236, 72, 153, 0.3)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            Create test
                        </button>
                    </div>
                ) : (
                    /* The exact same login card from the previous version! */
                    <div className="animate-fade-in" style={{
                        padding: '3.5rem 2.5rem',
                        width: '100%',
                        maxWidth: '440px',
                        background: '#ffffff',
                        borderRadius: '1.25rem',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        color: '#111827'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827' }}>Welcome Back</h2>
                            <p style={{ color: '#64748b' }}>Enter your credentials to access TestFlow</p>
                        </div>
                        
                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                color: 'var(--error)',
                                marginBottom: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '0.9rem',
                                textAlign: 'left'
                            }}>
                                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Candidate ID</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        style={{ 
                                            width: '100%', padding: '0.85rem 1.25rem 0.85rem 3.25rem', 
                                            background: '#ffffff', border: '1px solid #cbd5e1', 
                                            borderRadius: '0.75rem', color: '#0f172a',
                                            outline: 'none', transition: 'all 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                                        placeholder="Enter your User ID"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Safe Password</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        style={{ 
                                            width: '100%', padding: '0.85rem 1.25rem 0.85rem 3.25rem', 
                                            background: '#ffffff', border: '1px solid #cbd5e1', 
                                            borderRadius: '0.75rem', color: '#0f172a',
                                            outline: 'none', transition: 'all 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{ 
                                    width: '100%', height: '3.5rem', fontSize: '1.1rem', display: 'flex', 
                                    justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                    background: 'var(--primary)', color: 'white', border: 'none',
                                    borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '600',
                                    transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(99,102,241,0.2)'
                                }}
                                onMouseOver={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 16px rgba(99,102,241,0.3)'; }}
                                onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(99,102,241,0.2)'; }}
                                disabled={loading}
                            >
                                {loading ? 'Authenticating...' : (
                                    <>
                                        <LogIn size={20} />
                                        Log in
                                    </>
                                )}
                            </button>
                        </form>
                        
                        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                            <button 
                                type="button" 
                                onClick={() => setShowLogin(false)} 
                                style={{ 
                                    background: 'none', border: 'none', color: '#64748b', 
                                    fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' 
                                }}
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Login;
