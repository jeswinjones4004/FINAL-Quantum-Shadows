import React, { useState } from 'react';
import PrintableCertificate from './PrintableCertificate';
import ShareableBadges from './ShareableBadges';
import { Shield, Lock, AlertTriangle, CheckCircle, Smartphone, Server, FileCode, ArrowRight, Activity, Zap, Info, Award, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Mock Scanner Logic ---
const scanWebsite = async (url) => {
    try {
        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Scan failed:", error);
        // Return a failed state object rather than getting stuck
        return {
            httpsEnabled: false,
            tls13: false,
            ecdhe: false,
            aes256: false,
            validCert: false,
            hsts: false,
            secureHeaders: false,
            weakCiphers: false,
            error: true
        };
    }
};

const calculateScore = (data) => {
    let score = 0;
    if (data.httpsEnabled) score += 20;
    if (data.tls13) score += 15;
    if (data.ecdhe) score += 15;
    if (data.aes256) score += 10;
    if (data.validCert) score += 10;
    if (data.hsts) score += 10;
    if (data.secureHeaders) score += 10;
    if (data.weakCiphers) score -= 20;

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, score));
};

const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 border-green-400 shadow-green-900/50';
    if (score >= 50) return 'text-orange-400 border-orange-400 shadow-orange-900/50';
    return 'text-red-500 border-red-500 shadow-red-900/50';
};

const getScoreLabel = (score) => {
    if (score >= 80) return 'Quantum-Ready';
    if (score >= 50) return 'At Risk';
    return 'Vulnerable';
};

// --- Components ---

function Badge({ children, className = '' }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
            {children}
        </span>
    );
}

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

// --- Data & Helper Components ---

const FINDINGS_CONFIG = [
    {
        key: 'httpsEnabled',
        label: 'HTTPS Enabled',
        good: "Secure connection established.",
        bad: "Insecure connection (HTTP).",
        suggestion: "Enable HTTPS by obtaining an SSL/TLS certificate (e.g., Let's Encrypt) and configuring a 301 redirect from HTTP to HTTPS. Consider using Google Cloud Load Balancing for managed SSL."
    },
    {
        key: 'tls13',
        label: 'TLS 1.3',
        good: "Modern protocol version.",
        bad: "Outdated TLS version detected.",
        suggestion: "Update your web server configuration to support TLS 1.3 only or as the preferred protocol. Disable TLS 1.0 and 1.1. In Nginx, use `ssl_protocols TLSv1.2 TLSv1.3;`."
    },
    {
        key: 'ecdhe',
        label: 'ECDHE Key Exchange',
        good: "Forward secrecy enabled.",
        bad: "Missing forward secrecy.",
        suggestion: "Enable Elliptic Curve Diffie-Hellman Exchange (ECDHE) suites. This ensures that past communications cannot be decrypted even if the private key is compromised in the future."
    },
    {
        key: 'aes256',
        label: 'AES-256 Encryption',
        good: "Strong encryption standard.",
        bad: "Weak or deprecated cipher preferences.",
        suggestion: "Prioritize AES-256-GCM or ChaCha20-Poly1305. Avoid RC4, DES, and 3DES. Update your cipher suite string to prioritize high-security algorithms."
    },
    {
        key: 'validCert',
        label: 'Valid Certificate',
        good: "Certificate is trusted.",
        bad: "Certificate invalid or untrusted.",
        suggestion: "Ensure your certificate is issued by a trusted CA, is not expired, and matches the domain name. Use automation tools like Certbot to handle renewals."
    },
    {
        key: 'hsts',
        label: 'HSTS Header',
        good: "Strict transport security active.",
        bad: "HSTS header missing.",
        suggestion: "Add the `Strict-Transport-Security` header (e.g., `max-age=31536000; includeSubDomains`) to tell browsers to always connect via HTTPS."
    },
    {
        key: 'secureHeaders',
        label: 'Secure Headers',
        good: "Security headers present.",
        bad: "Missing Key Security Headers.",
        suggestion: "Implement headers like `Content-Security-Policy`, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff` to prevent XSS and clickjacking."
    },
    {
        key: 'weakCiphers',
        label: 'No Weak Ciphers',
        condition: (res) => !res.weakCiphers,
        good: "No legacy ciphers detected.",
        bad: "Weak/Legacy ciphers detected!",
        suggestion: "Audit your SSL configuration. Remove references to RC4, MD5, DES, and other obsolete ciphers. They are vulnerable to attacks like POODLE and BEAST."
    }
];

function FindingCard({ item, isPass }) {
    return (
        <Card className={`border-l-4 ${isPass ? 'border-l-green-500' : 'border-l-red-500'} hover:bg-slate-800/50 transition-colors`}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-slate-200">{item.label}</h4>
                {isPass ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />}
            </div>
            <p className="text-sm text-slate-400 mb-3">
                {isPass ? item.good : item.bad}
            </p>

        </Card>
    );
}

// --- Main App Component ---

function ScannerHome() {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const navigate = useNavigate();

    // Initial Mock Data
    const [scanResult, setScanResult] = useState({
        httpsEnabled: true,
        tls13: false,
        ecdhe: true,
        aes256: true,
        validCert: true,
        hsts: false,
        secureHeaders: false,
        weakCiphers: true,
    });
    const [score, setScore] = useState(65);
    const [migrationDepth, setMigrationDepth] = useState('Basic');
    const [showCertificate, setShowCertificate] = useState(false);
    const [showBadge, setShowBadge] = useState(false);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!url) return;

        setIsScanning(true);
        setScanResult(null);

        // Simulate API call
        const result = await scanWebsite(url);
        const computedScore = calculateScore(result);

        setScanResult(result);
        setScore(computedScore);
        setIsScanning(false);
    };

    return (
        <div className="min-h-screen font-sans selection:bg-brand-cyan/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-cyan/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12">

                {/* Header / Hero */}
                <div className="fixed top-6 right-6 z-40 flex gap-3">
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-brand-cyan hover:bg-cyan-400 text-black px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg text-sm font-bold group"
                    >
                        <Activity className="w-4 h-4" />
                        <span>Live Monitor</span>
                    </button>

                    <button
                        onClick={() => setShowBadge(true)}
                        className="bg-slate-800/80 backdrop-blur border border-slate-600 hover:border-brand-cyan text-slate-300 hover:text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg text-sm font-medium group"
                    >
                        <Shield className="w-4 h-4 text-brand-cyan group-hover:scale-110 transition-transform" />
                        <span>Get Badge</span>
                    </button>

                    <button
                        onClick={() => setShowCertificate(true)}
                        className="bg-slate-800/80 backdrop-blur border border-slate-600 hover:border-brand-purple text-slate-300 hover:text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg text-sm font-medium group"
                    >
                        <Award className="w-4 h-4 text-brand-purple group-hover:scale-110 transition-transform" />
                        <span>Get Certificate</span>
                    </button>
                </div>

                <header className="text-center mb-16 relative">
                    <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
                        <Shield className="w-6 h-6 text-brand-cyan mr-2" />
                        <span className="text-brand-cyan font-semibold tracking-wide uppercase text-sm">Quantum Shadows</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6 tracking-tight">
                        Securing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple glow-text">Post-Quantum World</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                        By ~2030, quantum computers could break today's encryption.
                        "Harvest Now, Decrypt Later" attacks are happening <span className="text-slate-200 font-medium">today</span>.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-brand-purple" /> Scan TLS Weaknesses</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-brand-purple" /> Get Migration Tips</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-brand-purple" /> Powered by Google Tech</span>
                    </div>
                </header>

                {/* URL Scanner Panel */}
                <section className="mb-16">
                    <Card className="max-w-2xl mx-auto relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/5 to-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <form onSubmit={handleScan} className="relative z-10 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    className="w-full pl-10 pr-4 py-4 bg-slate-950/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-cyan focus:border-transparent text-slate-100 placeholder-slate-500 transition-all"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isScanning}
                                className={`py-4 px-8 rounded-lg font-bold text-white shadow-lg shadow-brand-cyan/20 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2
                  ${isScanning
                                        ? 'bg-slate-700 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-brand-cyan to-blue-600 hover:shadow-brand-cyan/40'}`}
                            >
                                {isScanning ? (
                                    <>
                                        <Activity className="w-5 h-5 animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Scan Now <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </Card>
                </section>

                {/* Results Section */}
                {scanResult && (
                    <div className="animate-fade-in-up space-y-12">

                        {/* Score & Badge */}
                        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                            <div className={`relative px-10 py-8 rounded-2xl border-2 bg-slate-900/80 backdrop-blur box-glow flex flex-col items-center ${getScoreColor(score)}`}>
                                <span className="text-6xl font-black tabular-nums tracking-tighter">{score}</span>
                                <span className="text-sm font-bold uppercase tracking-widest mt-2 opacity-80">Security Score</span>
                            </div>

                            <div className="text-center md:text-left">
                                <h3 className={`text-3xl font-bold mb-2 ${score >= 80 ? 'text-green-400' : score >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                                    {getScoreLabel(score)}
                                </h3>
                                <p className="text-slate-400 max-w-sm">
                                    {score >= 80
                                        ? "Great job! Your site is using modern encryption standards. Prepare for the post-quantum era."
                                        : "Attention needed. Vulnerabilities detected that could be exploited by harvest-now attacks."}
                                </p>
                                <div className="mt-4 h-2 w-full max-w-xs bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${score >= 80 ? 'bg-green-400' : score >= 50 ? 'bg-orange-400' : 'bg-red-500'}`}
                                        style={{ width: `${score}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Findings & Fixes */}
                        <Section title={<><FileCode className="w-6 h-6 text-brand-purple" /> Scan Findings</>}>
                            <div className="grid gap-4 md:grid-cols-2">
                                {FINDINGS_CONFIG.map((item, idx) => {
                                    const isPass = typeof item.condition === 'function' ? item.condition(scanResult) : scanResult[item.key];
                                    return (
                                        <FindingCard key={idx} item={item} isPass={isPass} />
                                    );
                                })}
                            </div>
                        </Section>

                        {/* Security Recommendations - Only shown if there are issues */}
                        {FINDINGS_CONFIG.some(item => {
                            const res = typeof item.condition === 'function' ? item.condition(scanResult) : scanResult[item.key];
                            return !res;
                        }) && (
                                <Section title={<><Info className="w-6 h-6 text-brand-cyan" /> Security Recommendations</>}>
                                    <div className="space-y-4">
                                        {FINDINGS_CONFIG.map((item, idx) => {
                                            const isPass = typeof item.condition === 'function' ? item.condition(scanResult) : scanResult[item.key];
                                            if (isPass) return null;

                                            return (
                                                <Card key={idx} className="border-l-4 border-l-orange-400 border-l-orange-400 bg-slate-900/80">
                                                    <h4 className="font-bold text-slate-200 flex items-center gap-2 mb-2">
                                                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                                                        Fix: {item.label}
                                                    </h4>
                                                    <p className="text-sm text-slate-300 mb-2">{item.bad}</p>
                                                    <div className="p-3 bg-slate-950/50 rounded border border-slate-700/50 text-sm text-slate-400">
                                                        <strong className="text-brand-cyan block mb-1">Action:</strong>
                                                        {item.suggestion}
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </Section>
                            )}

                        {/* Quantum Safe Advisor */}
                        <Section title={<><Zap className="w-6 h-6 text-brand-cyan" /> Quantum-Safe Upgrade Path</>}>
                            <Card className="border-brand-purple/30 bg-slate-900/80">
                                <div className="flex justify-end mb-6">
                                    <div className="bg-slate-950 p-1 rounded-lg border border-slate-700 flex text-sm">
                                        {['Basic', 'Intermediate', 'Expert'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setMigrationDepth(level)}
                                                className={`px-3 py-1.5 rounded-md transition-all ${migrationDepth === level ? 'bg-brand-purple text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <ul className="space-y-4">
                                    <li className="flex gap-4 items-start">
                                        <div className="mt-1 bg-brand-cyan/20 p-1 rounded text-brand-cyan"><Server className="w-4 h-4" /></div>
                                        <div>
                                            <h4 className="font-semibold text-slate-200">Adopt NIST-Standardized PQC</h4>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Use Google Cloud PQC resources to plan migration of RSA/ECC certs to ML-KEM (Kyber) and ML-DSA.
                                                {migrationDepth !== 'Basic' && <span className="text-slate-500 block mt-1">Audit your inventory for all asymmetric crypto usage. Prioritize high-value long-lived data.</span>}
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="mt-1 bg-brand-purple/20 p-1 rounded text-brand-purple"><Lock className="w-4 h-4" /></div>
                                        <div>
                                            <h4 className="font-semibold text-slate-200">Google Cloud KMS & Tink</h4>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Experiment with Google Cloud KMS quantum-safe digital signatures. Leverage Google Tink libraries for hybrid key-exchange.
                                                {migrationDepth === 'Expert' && <span className="text-slate-500 block mt-1">Implement hybrid modes combining classical (ECDH) and post-quantum (Kyber) algorithms for defense-in-depth during the transition period.</span>}
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="mt-1 bg-blue-500/20 p-1 rounded text-blue-400"><Smartphone className="w-4 h-4" /></div>
                                        <div>
                                            <h4 className="font-semibold text-slate-200">Web & Mobile Protocols</h4>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Monitor Chrome/Android PQC rollouts. Enable hybrid key exchanges (X25519 + Kyber) on your endpoints.
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </Card>
                        </Section>

                    </div>
                )}

                {/* Live Analysis Console (Mock Preview) */}
                <Section title={<><Activity className="w-6 h-6 text-orange-400" /> Live Threat Monitor</>}>
                    <div className="grid lg:grid-cols-2 gap-8">
                        <Card className="h-full">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                                <span className="text-sm font-semibold text-slate-200">Real-Time Threat Feed</span>
                                <span className="flex items-center gap-2 text-xs text-green-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Live
                                </span>
                            </div>
                            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar text-xs font-mono text-slate-400">
                                {/* Mock items */}
                                <div className="flex gap-3 items-start animate-fade-in">
                                    <span className="text-slate-600 shrink-0">21:24:05</span>
                                    <span className="text-red-400 font-bold w-16 shrink-0">CRITICAL</span>
                                    <span>Harvest-now attack detected on Server-US-East-4. Payload analysis initiated.</span>
                                </div>
                                <div className="flex gap-3 items-start animate-fade-in delay-75">
                                    <span className="text-slate-600 shrink-0">21:23:58</span>
                                    <span className="text-blue-400 font-bold w-16 shrink-0">INFO</span>
                                    <span>Scanning TLS configuration for endpoint 192.168.1.105...</span>
                                </div>
                                <div className="flex gap-3 items-start animate-fade-in delay-100">
                                    <span className="text-slate-600 shrink-0">21:23:42</span>
                                    <span className="text-orange-400 font-bold w-16 shrink-0">WARN</span>
                                    <span>Weak cipher suite (RC4) detected on Legacy-Gateway-02.</span>
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <Server className="w-4 h-4 text-slate-500" />
                                    Global PQC Readiness
                                </h4>
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-300">NIST Algorithm Adoption</span>
                                        <span className="text-brand-cyan font-bold">12%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-cyan w-[12%] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-300">Vulnerable Legacy Systems</span>
                                        <span className="text-red-400 font-bold">68%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 w-[68%] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                    </div>
                                </div>
                            </Card>
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="text-center py-5 flex flex-col justify-center items-center group hover:bg-slate-800/80 transition-colors">
                                    <CheckCircle className="w-8 h-8 text-green-400 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                                    <div className="text-2xl font-black text-slate-100">1,240</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Sites Secured</div>
                                </Card>
                                <Card className="text-center py-5 flex flex-col justify-center items-center group hover:bg-slate-800/80 transition-colors border-brand-purple/20">
                                    <Shield className="w-8 h-8 text-brand-purple mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                                    <div className="text-2xl font-black text-brand-purple">4.5M</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Threats Blocked</div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </Section>
                <section className="mb-20">
                    <h2 className="text-2xl font-bold mb-8 text-center text-slate-100">Why Quantum Matters</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="hover:border-brand-cyan/50 transition-colors">
                            <h3 className="font-bold text-lg mb-3 text-brand-cyan">What is Q-Day?</h3>
                            <p className="text-sm text-slate-400">
                                The hypothetical future date when quantum computers become powerful enough to break currently used public-key encryption algorithms (RSA, ECC), leaving most of the internet vulnerable.
                            </p>
                        </Card>
                        <Card className="hover:border-brand-purple/50 transition-colors">
                            <h3 className="font-bold text-lg mb-3 text-brand-purple">Harvest Now, Decrypt Later</h3>
                            <p className="text-sm text-slate-400">
                                Attackers are stealing encrypted data today and storing it. Once Q-Day arrives, they will retroactively decrypt this sensitive information using quantum computers.
                            </p>
                        </Card>
                        <Card className="hover:border-green-400/50 transition-colors">
                            <h3 className="font-bold text-lg mb-3 text-green-400">NIST PQC Algorithms</h3>
                            <p className="text-sm text-slate-400">
                                New mathematical problems (like Lattice-based cryptography) that are resistant to both quantum and classical attacks. NIST has standardized ML-KEM (Kyber) for encryption.
                            </p>
                        </Card>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-800 pt-8 pb-12 text-center text-slate-500">
                    <p className="mb-4">
                        Built for hackers, builders, and defenders. <br />
                        Powered by <span className="text-slate-300">Google Quantum & Cryptography Technologies</span>.
                    </p>
                    <div className="flex justify-center gap-6 text-sm">
                        <a href="#" className="hover:text-brand-cyan transition-colors">Google Cloud PQC</a>
                        <a href="#" className="hover:text-brand-purple transition-colors">NIST PQC Project</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub Repo</a>
                    </div>
                </footer>

            </div>

            {showCertificate && (
                <PrintableCertificate
                    url={url}
                    score={score}
                    riskLabel={getScoreLabel(score)}
                    date={new Date().toLocaleDateString()}
                    onClose={() => setShowCertificate(false)}
                />
            )}

            {showBadge && (
                <ShareableBadges
                    score={score}
                    url={url}
                    onClose={() => setShowBadge(false)}
                />
            )}
        </div>
    );
}

export default ScannerHome;
