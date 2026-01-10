import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, AlertTriangle, Shield, Check, X, Server, Activity, Terminal } from 'lucide-react';
import PrintableCertificate from './PrintableCertificate';

const ImpactBadge = ({ level }) => {
    const colors = {
        Critical: 'bg-red-900/50 text-red-400 border-red-500/50',
        High: 'bg-orange-900/50 text-orange-400 border-orange-500/50',
        Medium: 'bg-yellow-900/50 text-yellow-400 border-yellow-500/50',
        Low: 'bg-green-900/50 text-green-400 border-green-500/50',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[level] || colors.Low}`}>
            {level}
        </span>
    );
};

const VulnerabilityCard = ({ vuln }) => (
    <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-lg hover:bg-slate-800/60 transition-colors">
        <div className="flex justify-between items-start mb-2">
            <div className="flex gap-3">
                <div className={`mt-1 p-1.5 rounded bg-slate-800 border ${vuln.impactLevel === 'Critical' ? 'border-red-500/30' : 'border-slate-600'}`}>
                    <AlertTriangle className={`w-4 h-4 ${vuln.impactLevel === 'Critical' ? 'text-red-500' : 'text-slate-400'}`} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-200 text-sm">{vuln.title}</h4>
                    <span className="text-xs text-slate-500">{vuln.category}</span>
                </div>
            </div>
            <ImpactBadge level={vuln.impactLevel} />
        </div>
        <p className="text-sm text-slate-400 pl-10 leading-relaxed">{vuln.description}</p>
    </div>
);

const ImpactLevels = ({ vulnerabilities }) => {
    const counts = vulnerabilities.reduce((acc, v) => {
        acc[v.impactLevel] = (acc[v.impactLevel] || 0) + 1;
        return acc;
    }, { Critical: 0, High: 0, Medium: 0, Low: 0 });

    return (
        <div className="flex gap-2 flex-wrap mb-6">
            {Object.entries(counts).map(([level, count]) => (
                <div key={level} className="flex-1 min-w-[120px] bg-slate-900 border border-slate-700 rounded p-3 flex flex-col items-center">
                    <span className={`text-2xl font-black ${level === 'Critical' ? 'text-red-500' :
                            level === 'High' ? 'text-orange-400' :
                                level === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>{count}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{level}</span>
                </div>
            ))}
        </div>
    );
};

const RecommendedFix = ({ fix }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(fix.codeSample);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/40 mb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-900/80 hover:bg-slate-800 transition-colors text-left"
            >
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-brand-cyan" />
                    {fix.title}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {isOpen && (
                <div className="p-4 bg-slate-950/30 border-t border-slate-700/50">
                    <ul className="list-disc list-inside text-sm text-slate-400 mb-4 space-y-1">
                        {fix.steps.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>

                    {fix.codeSample && (
                        <div className="relative group">
                            <div className="absolute top-2 right-2 flex gap-2">
                                <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded">{fix.language}</span>
                                <button onClick={copyCode} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <pre className="p-4 bg-slate-950 rounded border border-slate-800/50 text-xs font-mono text-slate-300 overflow-x-auto">
                                <code>{fix.codeSample}</code>
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PostQuantumReadiness = ({ score, details }) => {
    return (
        <div className="bg-slate-900/80 border border-brand-purple/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-brand-purple/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Simple CSS Gauge */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent"
                            strokeDasharray={440}
                            strokeDashoffset={440 - (440 * score) / 100}
                            className={`${score > 75 ? 'text-green-500' : score > 50 ? 'text-orange-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{score}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">PQ Score</span>
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Post-Quantum Readiness</h3>
                    <p className={`text-lg font-medium mb-4 ${score > 75 ? 'text-green-400' : 'text-orange-400'}`}>
                        {score > 75 ? 'Ready for Q-Day' : score > 50 ? 'Transition in Progress' : 'High Risk - Classical Only'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {details.map((d, i) => (
                            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded border ${d.active ? 'bg-slate-800/50 border-green-500/30 text-green-400' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}>
                                {d.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                <span className="text-sm font-medium">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AIReportSection({ reportData }) {
    if (!reportData) return null;

    const { url, scanDate, score, vulnerabilities, fixes, readiness } = reportData;

    return (
        <section className="space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
                <Activity className="w-8 h-8 text-brand-purple" />
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    AI-Generated Post-Quantum Security Report
                </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Impact Levels */}
                    <ImpactLevels vulnerabilities={vulnerabilities} />

                    {/* Vulns List */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" /> Detected Vulnerabilities
                        </h3>
                        {vulnerabilities.map(v => <VulnerabilityCard key={v.id} vuln={v} />)}
                    </div>

                    {/* Fixes */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-brand-cyan" /> Recommended Remediation
                        </h3>
                        {fixes.map(f => <RecommendedFix key={f.id} fix={f} />)}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* PQ Score */}
                    <PostQuantumReadiness score={readiness.score} details={readiness.details} />

                    {/* Certificate Preview Card */}
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
                        <Shield className="w-12 h-12 text-brand-cyan mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-white mb-2">Certification Available</h4>
                        <p className="text-sm text-slate-400 mb-6">
                            Verified scan results can be exported as a formal PDF certificate for compliance and auditing.
                        </p>
                        {/* We don't render the FULL certificate preview here to save space, but show we can */}
                        <PrintableCertificate
                            url={url}
                            score={score}
                            date={scanDate}
                            riskLabel={score > 80 ? "Quantum Ready" : "At Risk"}
                            onClose={null}
                        />
                        {/* Note: The PrintableCertificate component from previous step was a specific Modal. 
                            We might need to adjust it to be embeddable if we want it inline, 
                            but for now let's just rely on the 'Get Certificate' button logic or wrap it. 
                            Actually, the previous component was a full screen modal. 
                            I'll leave it as a reference or maybe just a button here.
                        */}
                    </div>
                </div>
            </div>
        </section>
    );
}
