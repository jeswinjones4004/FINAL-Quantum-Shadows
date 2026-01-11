import React, { useState, useEffect } from 'react';
import { Network, Activity, Cpu, Lock, AlertTriangle, Play, HelpCircle, Variable, ShieldAlert } from 'lucide-react';

const ATTACK_MODELS = [
    {
        id: 'sycamore',
        name: 'Noisy Intermediate (NISQ)',
        description: 'Current era technology (e.g., Sycamore). High error rates, limited qubits.',
        efficiencyMultiplier: 0.0001 // Very slow / impossible for large keys
    },
    {
        id: 'google_day_one',
        name: 'Gen-1 Fault Tolerant',
        description: 'Hypothetical first-gen error-corrected quantum computer (approx. 1M physical qubits).',
        efficiencyMultiplier: 1.0 // Baseline
    },
    {
        id: 'future_opt',
        name: 'Optimized Future State',
        description: 'Mature quantum internet & distributed computing grid (2035+).',
        efficiencyMultiplier: 100.0 // Very fast
    }
];

const ALGORITHMS = [
    { id: 'rsa', name: 'RSA (Legacy)', sizes: [1024, 2048, 4096] },
    { id: 'ecc', name: 'ECC (Legacy)', sizes: [256, 384, 521] } // ECDSA
];

export default function QuantumThreatSimulator() {
    const [algo, setAlgo] = useState(ALGORITHMS[0]);
    const [keySize, setKeySize] = useState(2048);
    const [model, setModel] = useState(ATTACK_MODELS[1]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [crackingTime, setCrackingTime] = useState(null);

    // Helper to calculate "educational" cracking time
    const calculateTime = () => {
        // Baseline: Shor's algorithm efficiency on a "Gen-1 Fault Tolerant" machine
        // RSA 2048 ~ 8 hours (28800 seconds) in some optimistic estimates for 20M noisy qubits -> 4k logical
        // This is purely for demonstration/education.

        let baseSeconds = 0;

        if (algo.id === 'rsa') {
            // Rough exponential scaling for classical, but Shor is polynomial (approx O(log N)^3)
            // We'll just use a simple visually distinct scale for the demo.
            if (keySize === 1024) baseSeconds = 2 * 60 * 60; // 2 hours
            if (keySize === 2048) baseSeconds = 8 * 60 * 60; // 8 hours
            if (keySize === 4096) baseSeconds = 24 * 60 * 60; // 24 hours (usually much longer but we want it 'threat' scale)
        } else {
            // ECC is generally "weaker" to quantum attack per bit than RSA
            if (keySize === 256) baseSeconds = 30 * 60; // 30 mins
            if (keySize === 384) baseSeconds = 2 * 60 * 60; // 2 hours
            if (keySize === 521) baseSeconds = 6 * 60 * 60; // 6 hours
        }

        // Apply Model Multiplier
        // If model is 'Optimized', time is faster (divide by multiplier)
        // If model is 'NISQ', time is infinitely slower (divide by small number -> huge time)

        let finalSeconds = baseSeconds / model.efficiencyMultiplier;

        // Manual override for NISQ to show "Infinite/Safe" essentially
        if (model.id === 'sycamore') {
            return "Decades (Safe currently)";
        }

        return formatTime(finalSeconds);
    };

    const formatTime = (seconds) => {
        if (seconds < 60) return `${Math.round(seconds)} seconds`;
        if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
        return `${(seconds / 3600).toFixed(1)} hours`;
    };

    const handleSimulate = () => {
        setIsSimulating(true);
        setProgress(0);
        setCrackingTime(null);

        // Animation duration logic
        let duration = 2000; // 2 seconds animation for UI
        let startTime = Date.now();

        const interval = setInterval(() => {
            let elapsed = Date.now() - startTime;
            let p = (elapsed / duration) * 100;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setIsSimulating(false);
                setCrackingTime(calculateTime());
            }
            setProgress(p);
        }, 16);
    };

    return (
        <div className="w-full relative group">
            <div className="absolute inset-0 bg-brand-cyan/5 rounded-xl blur-lg group-hover:bg-brand-cyan/10 transition-all duration-500"></div>

            <div className="relative bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 md:p-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <Cpu className="w-6 h-6 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Quantum Threat Simulator</h2>
                        <p className="text-xs text-slate-400">Estimate coherence times against your encryption</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        {/* Algorithm Selection */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Encryption Standard</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ALGORITHMS.map((a) => (
                                    <button
                                        key={a.id}
                                        onClick={() => { setAlgo(a); setKeySize(a.sizes[1]); }}
                                        className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2
                                            ${algo.id === a.id
                                                ? 'bg-slate-800 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                                : 'bg-slate-950/50 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                    >
                                        {a.id === 'rsa' || a.id === 'ecc' ? <Lock className="w-3 h-3" /> : null}
                                        {a.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Key Size Selection */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Key Length (Bits)</label>
                            <div className="flex gap-2">
                                {algo.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setKeySize(size)}
                                        className={`flex-1 py-2 px-3 rounded text-xs font-mono border transition-all
                                            ${keySize === size
                                                ? 'bg-red-500/20 border-red-500 text-red-400'
                                                : 'bg-slate-950/30 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Model Selection */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Quantum Hardware Model</label>
                            <div className="space-y-2">
                                {ATTACK_MODELS.map((m) => (
                                    <div
                                        key={m.id}
                                        onClick={() => setModel(m)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group/item
                                            ${model.id === m.id
                                                ? 'bg-slate-800 border-brand-cyan/50'
                                                : 'bg-slate-950/30 border-slate-700 hover:border-slate-600'}`}
                                    >
                                        <div>
                                            <div className={`text-sm font-bold ${model.id === m.id ? 'text-brand-cyan' : 'text-slate-300'}`}>{m.name}</div>
                                            <div className="text-[10px] text-slate-500 mt-1">{m.description}</div>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full border ${model.id === m.id ? 'bg-brand-cyan border-brand-cyan' : 'border-slate-600'}`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSimulate}
                            disabled={isSimulating}
                            className={`w-full py-4 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                ${isSimulating ? 'bg-slate-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 hover:shadow-red-500/20'}`}
                        >
                            {isSimulating ? <Activity className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            {isSimulating ? 'Running Simulation...' : 'Run Attack Simulation'}
                        </button>
                    </div>

                    {/* Visualization / Output */}
                    <div className="flex flex-col">
                        <div className="flex-1 bg-black/40 rounded-lg border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                            {/* Grid Background */}
                            <div className="absolute inset-0"
                                style={{
                                    backgroundImage: 'linear-gradient(rgba(50, 50, 50, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(50, 50, 50, 0.1) 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}
                            ></div>

                            {!crackingTime && !isSimulating && (
                                <div className="text-center z-10 opacity-50">
                                    <variable className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                                    <p className="text-slate-400 text-sm">Configure parameters and run simulation<br />to calculate theoretical break time.</p>
                                </div>
                            )}

                            {isSimulating && (
                                <div className="z-10 w-full max-w-xs text-center">
                                    <div className="text-red-500 font-mono text-xl mb-4 animate-pulse">FACTORIZING KEYS...</div>
                                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
                                        <span>Shor's Algorithm</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                </div>
                            )}

                            {crackingTime && !isSimulating && (
                                <div className="text-center z-10 animate-fade-in-up">
                                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                                        <ShieldAlert className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Estimated Time to Break</h3>
                                    <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-4">
                                        {crackingTime}
                                    </div>
                                    <div className="bg-slate-900/80 border border-slate-700 p-3 rounded text-xs text-slate-400 max-w-xs mx-auto text-left">
                                        <div className="flex gap-2 mb-1">
                                            <span className="font-bold text-slate-300">Target:</span>
                                            <span>{algo.name} ({keySize}-bit)</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-bold text-slate-300">Attacker:</span>
                                            <span>{model.name}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-300/80 leading-relaxed">
                                <strong>Reality Check:</strong> values are educational estimates based on Shor's algorithm scaling.
                                Real-world factors like qubit connectivity, error correction overhead (surface codes), and gate speeds will vary.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
