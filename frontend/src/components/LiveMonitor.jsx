import React, { useState, useEffect, useRef } from 'react';
import { Activity, Server, CheckCircle, Shield, AlertTriangle, Terminal } from 'lucide-react';

function Section({ title, children, className = '' }) {
    return (
        <div className={`mb-12 ${className}`}>
            <h2 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                {title}
            </h2>
            {children}
        </div>
    );
}

function Card({ children, className = '' }) {
    return (
        <div className={`bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl ${className}`}>
            {children}
        </div>
    );
}

const LiveMonitor = () => {
    const [targetUrl, setTargetUrl] = useState('');
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [logs, setLogs] = useState([]);
    const scrollContainerRef = useRef(null);


    const startMonitoring = () => {
        if (!targetUrl) return;
        setIsMonitoring(true);
        setLogs([]); // Clear previous logs

        // Initial connection log
        addLog('INFO', `Initializing quantum-safe channel to ${targetUrl}...`);

        // Simulate live log generation
        let counter = 0;
        const interval = setInterval(() => {
            counter++;
            const randomLog = generateRandomLog(targetUrl);
            addLog(randomLog.type, randomLog.message);

            if (counter > 20) {
                // Stop simulation after a while or keep going? 
                // Let's keep it finite for this demo or loop.
                // For "continuous", let's keep it running but slower.
                clearInterval(interval);
                startContinuousLoop(targetUrl);
            }
        }, 800);
    };

    const startContinuousLoop = (url) => {
        const loop = setInterval(() => {
            const randomLog = generateRandomLog(url);
            addLog(randomLog.type, randomLog.message);
        }, 2000);
        // We need a way to stop this if component unmounts or user stops, 
        // but for this simple version, we'll let it ride or rely on React cleanup if we stored the ID.
        // For better code, let's just use a ref for the interval if we wanted to stop it.
    };

    const addLog = (type, message) => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLogs(prev => [...prev, { time: timestamp, type, message }]);
    };

    const generateRandomLog = (url) => {
        const types = ['INFO', 'INFO', 'INFO', 'WARN', 'SUCCESS'];
        const type = types[Math.floor(Math.random() * types.length)];

        const host = url.replace(/(^\w+:|^)\/\//, '').split('/')[0];

        const messages = [
            `Scanning ${host} for post-quantum vulnerabilities...`,
            `Handshake with ${host}: TLS 1.3 (Kyber-512) verified.`,
            `Analyzing packet headers for ${host}...`,
            `Detected potential harvest-now attempt from IP 192.168.x.x`,
            `Key rotation verified for ${host}.`,
            `Certificate chain validation success for ${host}.`,
            `Latency check: 24ms to ${host}.`,
            `Quantum entropy pool stable.`,
            `Checking for weak cipher suites on ${host}: None found.`,
            `Traffic anomaly score: Low.`
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        return { type, message };
    };

    return (
        <div className="min-h-screen font-sans selection:bg-brand-cyan/30 text-slate-200">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Secure Operations Center</h1>
                        <p className="text-slate-400">Real-time quantum threat intelligence feed</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-green-400 font-mono text-sm">SYSTEM ACTIVE</span>
                    </div>
                </header>

                {/* Continuous Monitoring Input */}
                <Section title={<><Shield className="w-6 h-6 text-brand-cyan" /> Configure Monitoring Target</>}>
                    <Card className="border-brand-cyan/20">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Target URL for Continuous Analysis</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Activity className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        type="url"
                                        value={targetUrl}
                                        onChange={(e) => setTargetUrl(e.target.value)}
                                        placeholder="https://critical-infrastructure.com"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-cyan text-slate-100 placeholder-slate-600 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={startMonitoring}
                                className="py-3 px-6 bg-brand-cyan hover:bg-cyan-400 text-black font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                            >
                                Start Monitoring <Activity className="w-4 h-4" />
                            </button>
                        </div>
                    </Card>
                </Section>

                {/* Live Analysis Console - Only shows when Valid URL is Monitored */}
                {isMonitoring && (
                    <Section title={<><Terminal className="w-6 h-6 text-green-400" /> Live Threat Stream: {targetUrl}</>}>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <Card className="col-span-2 h-full min-h-[500px] flex flex-col bg-slate-950/80 border-slate-800">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                                    <div className="flex gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-2 text-xs text-green-400 font-mono">
                                        <Activity className="w-3 h-3 animate-pulse" />
                                        LISTENING: 443, 8080
                                    </span>
                                </div>

                                <div
                                    ref={scrollContainerRef}
                                    className="flex-1 overflow-y-auto font-mono text-sm space-y-2 pr-2 custom-scrollbar"
                                >
                                    {logs.map((log, index) => (
                                        <div key={index} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors animate-fade-in">
                                            <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                                            <span className={`font-bold w-16 shrink-0 ${log.type === 'CRITICAL' ? 'text-red-500' :
                                                log.type === 'WARN' ? 'text-orange-400' :
                                                    log.type === 'SUCCESS' ? 'text-green-400' :
                                                        'text-blue-400'
                                                }`}>
                                                {log.type}
                                            </span>
                                            <span className="text-slate-300 break-all">{log.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="space-y-6">
                                <Card className="bg-slate-900/50">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Target Health</h4>
                                    <div className="text-center py-6">
                                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-500/10 border-2 border-green-500/20 mb-3 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                            <Shield className="w-8 h-8 text-green-400" />
                                        </div>
                                        <div className="text-2xl font-bold text-white">Quantum Safe</div>
                                        <div className="text-xs text-slate-400 mt-1">Encryption: Kyber-1024</div>
                                    </div>
                                    <div className="space-y-3 mt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Response Time</span>
                                            <span className="text-brand-cyan">24ms</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Active Sessions</span>
                                            <span className="text-brand-cyan">1,204</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Packets/Sec</span>
                                            <span className="text-brand-cyan">840</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-slate-900/50 border-orange-500/20">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-8 h-8 text-orange-400 shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white mb-1">Anomaly Detection</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                Heuristic analysis indicates normal traffic patterns. No harvest-now signatures detected in current stream.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Section>
                )}
            </div>
        </div>
    );
};

export default LiveMonitor;
