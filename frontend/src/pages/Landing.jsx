import React, { useState } from 'react';
import { Shield, Lock, Activity, CheckCircle, ArrowRight, Server, FileCode, Zap, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();
    const [url, setUrl] = useState('');

    const handleScan = (e) => {
        e.preventDefault();
        if (url) {
            // In a real router setup we might pass this via state or query param
            navigate('/dashboard', { state: { initialUrl: url } });
        }
    };

    return (
        <div className="min-h-screen font-sans selection:bg-brand-cyan/30 flex flex-col">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-cyan/20 rounded-full blur-[100px]" />
            </div>

            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-brand-cyan" />
                    <span className="font-bold text-white tracking-wide text-lg">Quantum Shadows</span>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/login')} className="bg-slate-800 text-white px-5 py-2 rounded-full font-medium border border-slate-700 hover:border-brand-purple transition-all">Sign In</button>
                    <button onClick={() => navigate('/login')} className="bg-brand-purple text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-brand-purple/20 hover:bg-purple-600 transition-all">Start Monitoring</button>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
                <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
                    <Shield className="w-5 h-5 text-brand-cyan mr-2" />
                    <span className="text-brand-cyan font-semibold tracking-wide uppercase text-xs">Official G-Hacks Hackathon Submission</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6 tracking-tight max-w-5xl leading-tight">
                    Quantum Security Monitoring<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple glow-text">as a Service</span>
                </h1>

                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Continuous threat detection for the Post-Quantum Era. Get real-time alerts on vulnerabilities, cryptographic weakness, and "Harvest Now, Decrypt Later" attacks.
                </p>

                <div className="w-full max-w-2xl mx-auto relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <form onSubmit={handleScan} className="relative flex gap-2 p-2 bg-slate-900/80 backdrop-blur rounded-xl border border-slate-700 shadow-2xl">
                        <input
                            type="url"
                            placeholder="Enter your domain to scan..."
                            className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder-slate-500 text-lg"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button type="submit" className="bg-gradient-to-r from-brand-cyan to-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
                            Scan Now
                        </button>
                    </form>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-20 text-left max-w-5xl">
                    <div className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-brand-purple/50 transition-all">
                        <Activity className="w-10 h-10 text-brand-purple mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Continuous Monitoring</h3>
                        <p className="text-slate-400">Automated daily scans to detect new vulnerabilities and configuration drifts before attackers do.</p>
                    </div>
                    <div className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-brand-cyan/50 transition-all">
                        <Zap className="w-10 h-10 text-brand-cyan mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Live Threat Feed</h3>
                        <p className="text-slate-400">Real-time alerts on active exploit attempts targeting your assets, powered by AI threat intelligence.</p>
                    </div>
                    <div className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-green-400/50 transition-all">
                        <FileCode className="w-10 h-10 text-green-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">PQC Migration Plans</h3>
                        <p className="text-slate-400">Actionable roadmaps to upgrade your cryptography stack to NIST-standard post-quantum algorithms.</p>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-800 py-8 text-center text-slate-500 bg-slate-950">
                <p>
                    Quantum Shadows &copy; 2025. Powered by Google Quantum & Cryptography Technologies.
                </p>
            </footer>
        </div>
    );
}

export default Landing;
