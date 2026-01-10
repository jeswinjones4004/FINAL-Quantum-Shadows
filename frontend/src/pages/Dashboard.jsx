import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { LayoutDashboard, Plus, Trash2, PauseCircle, PlayCircle, ShieldAlert, Activity, BarChart, Bell } from 'lucide-react';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [domains, setDomains] = useState([]);
    const [newDomain, setNewDomain] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // CONTINUOUS MONITORING SIMULATION
    // In a real app, this would be a backend job. Here we continuously 'monitor' the threat feed
    const [threatFeed, setThreatFeed] = useState([]);

    useEffect(() => {
        // Simulate real-time threat feed updates
        const interval = setInterval(() => {
            const types = ['DDoS Attempt', 'SQL Injection', 'MITM detected', 'Quantum Decrypt Probe'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            const randomDomain = domains.length > 0 ? domains[Math.floor(Math.random() * domains.length)].url : 'demo-site.com';

            const newThreat = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                type: randomType,
                domain: randomDomain,
                severity: Math.random() > 0.7 ? 'Critical' : 'Medium'
            };

            setThreatFeed(prev => [newThreat, ...prev].slice(0, 10));
        }, 5000); // New threat every 5 seconds

        return () => clearInterval(interval);
    }, [domains]);

    // Mock domain fetching logic (replace with Firestore real listener if config valid)
    useEffect(() => {
        if (currentUser?.uid === 'mock-user-123') {
            setDomains([
                { id: '1', url: 'https://myshop.com', label: 'E-Commerce Main', status: 'active', score: 85, lastScan: '2025-05-10' },
                { id: '2', url: 'https://api.myshop.com', label: 'Backend API', status: 'paused', score: 45, lastScan: '2025-05-08' },
            ]);
        } else if (currentUser) {
            // Real firestore logic placeholder
            // const q = query(collection(db, "domains"), where("userId", "==", currentUser.uid));
            // const unsub = onSnapshot(q, (snapshot) => {
            //    setDomains(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
            // });
            // return unsub;
        }
    }, [currentUser]);

    const handleAddDomain = (e) => {
        e.preventDefault();
        // Add to mock state
        const newItem = { id: Date.now().toString(), url: newDomain, label: 'New Asset', status: 'active', score: 0, lastScan: 'Pending' };
        setDomains([...domains, newItem]);
        setNewDomain('');
    };

    const deleteDomain = (id) => {
        setDomains(domains.filter(d => d.id !== id));
    };

    const toggleStatus = (id) => {
        setDomains(domains.map(d => d.id === id ? { ...d, status: d.status === 'active' ? 'paused' : 'active' } : d));
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">Command Center</h1>
                        <p className="text-slate-400">Welcome back, <span className="text-brand-cyan">{currentUser?.email}</span></p>
                    </div>
                    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>Overview</button>
                        <button onClick={() => setActiveTab('domains')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'domains' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>My Domains</button>
                        <button onClick={() => setActiveTab('monitor')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'monitor' ? 'bg-slate-700 text-white shadow shadow-brand-purple/20' : 'text-slate-400 hover:text-white'}`}>
                            Live Monitor <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        </button>
                    </div>
                </div>

                {/* Content Switch */}
                {activeTab === 'monitor' && (
                    <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
                        <div className="lg:col-span-2">
                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-brand-cyan" /> Network Traffic Analysis
                                </h2>
                                <div className="h-64 flex items-end justify-between gap-1 px-4 py-2 bg-slate-950/50 rounded border border-slate-800">
                                    {/* Fake bar chart visualization */}
                                    {Array.from({ length: 40 }).map((_, i) => (
                                        <div
                                            key={i}
                                            style={{ height: `${Math.random() * 100}%` }}
                                            className={`w-full rounded-t ${Math.random() > 0.9 ? 'bg-red-500' : 'bg-brand-cyan/40'}`}
                                        />
                                    ))}
                                </div>
                                <div className="mt-4 flex gap-6 text-sm text-slate-400">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-brand-cyan rounded-full"></div> Normal Traffic</span>
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Anomaly Detected</span>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-brand-purple" /> Threat Log (Real-time)
                                </h2>
                                <div className="space-y-2">
                                    {threatFeed.map((threat) => (
                                        <div key={threat.id} className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800 animate-fade-in-left">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded ${threat.severity === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-200">{threat.type}</div>
                                                    <div className="text-xs text-slate-500">{threat.domain}</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-slate-500">{threat.timestamp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                <h3 className="font-bold text-slate-200 mb-4">Active Protections</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm p-3 bg-slate-950 rounded border border-slate-800">
                                        <span className="text-slate-400">PQC Encryption</span>
                                        <span className="text-green-400 font-bold">Enabled</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-3 bg-slate-950 rounded border border-slate-800">
                                        <span className="text-slate-400">WAF Status</span>
                                        <span className="text-green-400 font-bold">Filtering</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-3 bg-slate-950 rounded border border-slate-800">
                                        <span className="text-slate-400">Threat Intel</span>
                                        <span className="text-brand-purple font-bold">Connected (Google)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-brand-purple/20 to-slate-900 border border-brand-purple/30 rounded-xl p-6">
                                <h3 className="font-bold text-white mb-2">Upgrade to Pro</h3>
                                <p className="text-sm text-slate-400 mb-4">Get unlimited domain monitoring and 1-hour PQC forecast reports.</p>
                                <button className="w-full py-2 bg-brand-purple hover:bg-purple-600 text-white rounded font-bold transition-colors">View Plans</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'domains' && (
                    <div className="animate-fade-in-up">
                        <form onSubmit={handleAddDomain} className="flex gap-4 mb-8">
                            <input
                                type="url"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                placeholder="https://example.com"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-cyan outline-none"
                            />
                            <button className="bg-brand-cyan text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-cyan-400 transition-colors">
                                <Plus className="w-5 h-5" /> Add Domain
                            </button>
                        </form>

                        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4">Domain</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">PQ Score</th>
                                        <th className="p-4">Last Scan</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {domains.map(d => (
                                        <tr key={d.id} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-200">{d.label}</div>
                                                <div className="text-xs text-slate-500 font-mono">{d.url}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${d.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div style={{ width: `${d.score}%` }} className={`h-full ${d.score > 70 ? 'bg-brand-cyan' : 'bg-red-500'}`}></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-300">{d.score}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">{d.lastScan}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => toggleStatus(d.id)} className="p-2 hover:bg-slate-700 rounded text-slate-400">
                                                        {d.status === 'active' ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                                    </button>
                                                    <button onClick={() => deleteDomain(d.id)} className="p-2 hover:bg-slate-700 rounded text-red-400">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {domains.length === 0 && (
                                <div className="p-12 text-center text-slate-500">
                                    No domains added yet. Monitor your first asset now.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="text-center py-20">
                        <div className="inline-flex p-4 rounded-full bg-slate-900 mb-6 border border-slate-700">
                            <BarChart className="w-12 h-12 text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-200 mb-2">Overview Dashboard</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                            Your unified view for all monitored assets, certificate expiries, and aggregate security postures is being provisioned.
                        </p>
                        <p className="mt-4 text-sm text-brand-purple animate-pulse">
                            Connecting to Quantum Shadows Analyzer Node...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
