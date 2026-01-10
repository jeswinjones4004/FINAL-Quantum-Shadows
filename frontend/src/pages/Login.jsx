import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Login() {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isSignup) {
                await signup(email, password);
            } else {
                await login(email, password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to ' + (isSignup ? 'create account' : 'log in'));
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Backgroud */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[120px]" />
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-800 border border-slate-600 shadow-lg">
                        <Shield className="w-8 h-8 text-brand-cyan" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-2">
                    {isSignup ? 'Join the Resistance' : 'Welcome Back'}
                </h2>
                <p className="text-center text-slate-400 mb-8 text-sm">
                    Quantum-safe monitoring for your digital assets.
                </p>

                {error && <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs uppercase font-bold mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:ring-2 focus:ring-brand-purple outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs uppercase font-bold mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:ring-2 focus:ring-brand-purple outline-none"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-bold rounded-lg hover:shadow-lg hover:shadow-brand-purple/25 transition-all">
                        {isSignup ? 'Create Account' : 'Access Dashboard'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-slate-400 hover:text-white text-sm hover:underline"
                    >
                        {isSignup ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}
