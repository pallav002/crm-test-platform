import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Clock, ChevronRight, Send, AlertTriangle, Maximize, Shield } from 'lucide-react';

const TestExecution = () => {
    const { testId } = useParams();
    const [test, setTest] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await api.get(`/candidate/tests/${testId}`);
                if (!res.data.questions || res.data.questions.length === 0) {
                    alert("This test has no questions yet.");
                    navigate('/dashboard');
                    return;
                }
                setTest(res.data);
                setQuestionTimeLeft(res.data.time_per_question_seconds || 60);
                setLoading(false);
            } catch (err) {
                console.error(err);
                navigate('/dashboard');
            }
        };
        fetchTest();
    }, [testId, navigate]);

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }
    };

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    useEffect(() => {
        if (questionTimeLeft > 0) {
            const timer = setTimeout(() => setQuestionTimeLeft(questionTimeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (questionTimeLeft === 0 && !loading) {
            handleAutoNext();
        }
    }, [questionTimeLeft, loading]);

    const handleAutoNext = () => {
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setQuestionTimeLeft(test.time_per_question_seconds || 60);
        } else {
            handleSubmit(true);
        }
    };

    const handleManualNext = () => {
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setQuestionTimeLeft(test.time_per_question_seconds || 60);
        } else {
            handleSubmit(false);
        }
    };

    const handleOptionSelect = (questionId, option) => {
        setAnswers({ ...answers, [questionId]: option });
    };

    const handleSubmit = async (isAuto = false) => {
        try {
            if (isAuto || window.confirm('Finalize and submit your assessment?')) {
                const res = await api.post(`/candidate/tests/${testId}/submit`, answers);
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                navigate('/results', {
                    state: {
                        score: res.data.score,
                        totalMarks: test.questions.length
                    }
                });
            }
        } catch (err) {
            alert('Error submitting test. Please contact staff.');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Preparing Examination Environment...</p>
        </div>
    );

    const currentQuestion = test.questions[currentQuestionIndex];
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
            {!isFullscreen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    background: 'var(--background)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <Maximize size={80} style={{ color: 'var(--primary)', marginBottom: '2.5rem', opacity: 0.8 }} />
                    <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Action Required</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '540px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        To maintain a distraction-free and secure testing environment for <strong style={{ color: 'var(--text)' }}>TestFlow</strong>, this assessment requires full-screen mode.
                    </p>
                    <button onClick={enterFullscreen} className="btn btn-primary" style={{ padding: '1.25rem 4rem', fontSize: '1.2rem' }}>
                        Initialize Full-Screen
                    </button>
                    <div style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Shield size={16} /> Secure Examination Protocol v1.4
                    </div>
                </div>
            )}

            <nav style={{
                padding: '1.25rem 5vw',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                        TestFlow
                    </div>
                    <div style={{ height: '24px', width: '1px', background: 'var(--border)' }}></div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{test.title}</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Attempt In Progress</p>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '0.6rem 1.5rem',
                    background: questionTimeLeft < 10 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                    borderRadius: '50px',
                    color: questionTimeLeft < 10 ? 'var(--error)' : 'var(--primary)',
                    border: '1px solid var(--border)',
                    fontWeight: '700'
                }}>
                    <Clock size={20} />
                    <span style={{ fontSize: '1.4rem', fontVariantNumeric: 'tabular-nums' }}>{formatTime(questionTimeLeft)}</span>
                </div>
            </nav>

            <div style={{ maxWidth: '840px', margin: '4rem auto', padding: '0 2rem' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Section 1: Question {currentQuestionIndex + 1} of {test.questions.length}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Progress: {Math.round((currentQuestionIndex / test.questions.length) * 100)}%</span>
                </div>

                <div className="glass-card animate-fade-in" key={currentQuestionIndex} style={{ padding: '3.5rem' }}>
                    <h3 style={{ fontSize: '1.75rem', lineHeight: '1.5', fontWeight: '500', marginBottom: '3rem' }}>
                        {currentQuestion.question_text}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['A', 'B', 'C', 'D'].map((opt) => (
                            <label
                                key={opt}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    padding: '1.5rem',
                                    borderRadius: '1rem',
                                    background: answers[currentQuestion.id] === opt ? 'rgba(139, 92, 246, 0.05)' : 'var(--surface)',
                                    border: `1.5px solid ${answers[currentQuestion.id] === opt ? 'var(--primary)' : 'var(--border)'}`,
                                    boxShadow: answers[currentQuestion.id] === opt ? '0 4px 12px rgba(139, 92, 246, 0.15)' : '0 2px 5px rgba(0,0,0,0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <input
                                    type="radio"
                                    name={`q-${currentQuestion.id}`}
                                    checked={answers[currentQuestion.id] === opt}
                                    onChange={() => handleOptionSelect(currentQuestion.id, opt)}
                                    style={{ width: '22px', height: '22px', accentColor: 'var(--primary)' }}
                                />
                                <span style={{ fontSize: '1.1rem' }}>
                                    <strong style={{ opacity: 0.5, marginRight: '0.75rem' }}>{opt}</strong> {currentQuestion[`option_${opt.toLowerCase()}`]}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        {currentQuestionIndex < test.questions.length - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={handleManualNext}
                                style={{ padding: '0.85rem 3rem' }}
                            >
                                Next Question <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                className="btn"
                                onClick={() => handleSubmit(false)}
                                style={{ background: 'var(--success)', color: 'white', padding: '0.85rem 3rem' }}
                            >
                                <Send size={20} /> Finalize Submission
                            </button>
                        )}
                    </div>
                </div>

                <p style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Shield size={14} /> Powered by TestFlow Security Engine
                </p>
            </div>
        </div>
    );
};

export default TestExecution;
