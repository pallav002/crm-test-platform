import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Layout, FilePlus, Users, BarChart, LogOut, Plus, Search, FileText, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('tests');
    const [tests, setTests] = useState([]);
    const [results, setResults] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [showCreateTest, setShowCreateTest] = useState(false);
    const [showCreateUser, setShowCreateUser] = useState(false);

    const [newTest, setNewTest] = useState({
        title: '',
        description: '',
        duration_minutes: 30,
        time_per_question_seconds: 60,
        total_questions_limit: 0
    });
    const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', is_admin: false });
    const { logout, user } = useAuth();

    useEffect(() => {
        fetchTests();
        fetchResults();
        fetchCandidates();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await api.get('/admin/tests');
            setTests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchResults = async () => {
        try {
            const res = await api.get('/admin/results');
            setResults(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCandidates = async () => {
        try {
            const res = await api.get('/admin/candidates');
            setCandidates(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/tests', newTest);
            setShowCreateTest(false);
            fetchTests();
            setNewTest({ title: '', description: '', duration_minutes: 30, time_per_question_seconds: 60, total_questions_limit: 0 });
        } catch (err) {
            console.error(err);
            alert('Error creating test');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            setShowCreateUser(false);
            setNewUser({ username: '', password: '', full_name: '', is_admin: false });
            fetchCandidates();
            alert('User created successfully!');
        } catch (err) {
            alert('Error creating user: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleDeleteTest = async (testId) => {
        if (window.confirm('Are you sure? This will delete the test and its questions. Results will be archived.')) {
            try {
                await api.delete(`/admin/tests/${testId}`);
                fetchTests();
            } catch (err) {
                alert('Error deleting test');
            }
        }
    };

    const handleDeleteCandidate = async (userId) => {
        if (window.confirm('Delete this candidate? Account will be removed, results preserved.')) {
            try {
                await api.delete(`/admin/candidates/${userId}`);
                fetchCandidates();
            } catch (err) {
                alert('Error deleting candidate');
            }
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Sidebar */}
            <div style={{ width: '280px', background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '2rem' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '3rem', fontSize: '1.5rem', fontWeight: '800' }}>TestFlow <span style={{ color: 'var(--text)' }}>Admin</span></h2>

                <nav className="sidebar-nav">
                    <button
                        onClick={() => setActiveTab('tests')}
                        className={`sidebar-nav-item ${activeTab === 'tests' ? 'active' : ''}`}
                    >
                        <FilePlus size={20} /> Tests
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                    >
                        <Users size={20} /> Candidates
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`sidebar-nav-item ${activeTab === 'results' ? 'active' : ''}`}
                    >
                        <BarChart size={20} /> Results
                    </button>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                            {activeTab === 'tests' ? 'Manage Tests' : activeTab === 'users' ? 'Candidate Management' : 'Detailed Analytics'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Welcome back, Administrator</p>
                    </div>
                    {activeTab === 'tests' && (
                        <button onClick={() => setShowCreateTest(true)} className="btn btn-primary">
                            <Plus size={20} /> Create New Test
                        </button>
                    )}
                    {activeTab === 'users' && (
                        <button onClick={() => setShowCreateUser(true)} className="btn btn-primary">
                            <Plus size={20} /> Create New Candidate
                        </button>
                    )}
                </header>

                {/* Tests Tab */}
                {activeTab === 'tests' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {tests.map(test => (
                            <div key={test.id} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <h3 style={{ fontSize: '1.25rem' }}>{test.title}</h3>
                                    <button onClick={() => handleDeleteTest(test.id)} style={{ color: 'var(--error)', padding: '0.5rem', opacity: 0.6 }} className="btn btn-icon">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{test.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={16} color="var(--primary)" /> {test.questions?.length || 0} Questions</span>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{test.duration_minutes}m</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{test.time_per_question_seconds}s/q</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="file"
                                        id={`pdf-${test.id}`}
                                        style={{ display: 'none' }}
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                setTests(prev => prev.map(t => t.id === test.id ? { ...t, isUploading: true } : t));
                                                try {
                                                    const res = await api.post(`/admin/tests/${test.id}/upload-pdf`, formData);
                                                    alert(`SUCCESS!\n\n${res.data.message}\n\nQuestions Added: ${res.data.question_count}`);
                                                    fetchTests();
                                                } catch (err) {
                                                    alert('Error uploading PDF');
                                                } finally {
                                                    setTests(prev => prev.map(t => t.id === test.id ? { ...t, isUploading: false } : t));
                                                }
                                            }
                                        }}
                                    />
                                    <label htmlFor={`pdf-${test.id}`} className="btn" style={{ border: '1px solid var(--border)', flex: 1, cursor: 'pointer', opacity: test.isUploading ? 0.5 : 1 }}>
                                        {test.isUploading ? 'Parsing...' : 'Update PDF Questions'}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Candidates Tab */}
                {activeTab === 'users' && (
                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1.25rem' }}>Candidate Name</th>
                                    <th style={{ padding: '1.25rem' }}>User ID</th>
                                    <th style={{ padding: '1.25rem' }}>Created At</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1.25rem', fontWeight: '500' }}>{c.full_name}</td>
                                        <td style={{ padding: '1.25rem' }}><code>{c.username}</code></td>
                                        <td style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleString()}</td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                            <button onClick={() => handleDeleteCandidate(c.id)} className="btn btn-icon" style={{ color: 'var(--error)' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1.25rem' }}>Name / ID</th>
                                    <th style={{ padding: '1.25rem' }}>Test Attempted</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'center' }}>Q (A/T)</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'center' }}>Correct</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'center' }}>Score</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'center' }}>Accuracy</th>
                                    <th style={{ padding: '1.25rem' }}>Submission Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map(res => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.95rem' }}>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: '600' }}>{res.candidate_name || 'Deleted User'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{res.candidate_username}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>{res.test_title || 'Deleted Test'}</td>
                                        <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                            {res.attempted_questions} / {res.total_questions}
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--success)', fontWeight: '700' }}>+{res.correct_answers}</td>
                                        <td style={{ padding: '1.25rem', textAlign: 'center', fontWeight: '700' }}>{res.score}</td>
                                        <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                            <div style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: res.accuracy >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: res.accuracy >= 70 ? 'var(--success)' : 'var(--warning)', display: 'inline-block' }}>
                                                {Math.round(res.accuracy)}%
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>{new Date(res.submitted_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Create Test Modal */}
                {showCreateTest && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
                        <div className="glass-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '520px' }}>
                            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Plus size={24} color="var(--primary)" /> Define New Assessment</h2>
                            <form onSubmit={handleCreateTest}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Assessment Title</label>
                                    <input className="input-field" value={newTest.title} onChange={e => setNewTest({ ...newTest, title: e.target.value })} placeholder="e.g. Python Advanced MCQ" required />
                                </div>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Brief Description</label>
                                    <textarea className="input-field" style={{ height: '80px' }} value={newTest.description} onChange={e => setNewTest({ ...newTest, description: e.target.value })} placeholder="Outline the scope of this test..." />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Duration (Mins)</label>
                                        <input type="number" className="input-field" value={newTest.duration_minutes} onChange={e => setNewTest({ ...newTest, duration_minutes: parseInt(e.target.value) })} required />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Time/Question (Sec)</label>
                                        <input type="number" className="input-field" value={newTest.time_per_question_seconds} onChange={e => setNewTest({ ...newTest, time_per_question_seconds: parseInt(e.target.value) })} required />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setShowCreateTest(false)} className="btn" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Publish Assessment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Candidate Modal */}
                {showCreateUser && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
                        <div className="glass-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '500px' }}>
                            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Users size={24} color="var(--primary)" /> Register Candidate</h2>
                            <form onSubmit={handleCreateUser}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Full Legal Name</label>
                                    <input className="input-field" value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} placeholder="John Doe" required />
                                </div>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Portal User ID (Unique)</label>
                                    <input className="input-field" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="johndoe2025" required />
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Secure Access Password</label>
                                    <input type="password" className="input-field" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" required />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setShowCreateUser(false)} className="btn" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Credentials</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
