import React, { useState } from 'react';
import { Copy, Check, Code, Github, Shield } from 'lucide-react';

const ShareableBadges = ({ score, url, onClose }) => {
    const [copiedType, setCopiedType] = useState(null);

    // Determine badge properties based on score
    let badgeLabel = "High Risk";
    let badgeColor = "red";
    let badgeMessage = "Fix Now";

    if (score >= 80) {
        badgeLabel = "Quantum-Safe";
        badgeColor = "success"; // brightgreen on shields.io
        badgeMessage = "Certified";
    } else if (score >= 50) {
        badgeLabel = "Legacy Crypto";
        badgeColor = "orange";
        badgeMessage = "Detected";
    }

    // Generate Shields.io URL
    // Format: https://img.shields.io/badge/Quantum_Shadows_--_Label-Message-Color?style=for-the-badge&logo=googlecloud
    // We use underscores for spaces in the LABEL section to ensure safe parsing
    const safeLabel = badgeLabel.replace(/ /g, '_');
    const safeMessage = badgeMessage.replace(/ /g, '_');
    const badgeUrl = `https://img.shields.io/badge/Quantum_Shadows--${safeLabel}-${safeMessage}-${badgeColor}?style=for-the-badge&logo=googlecloud&logoColor=white`;

    // Snippets
    const markdownSnippet = `[![Quantum Shadows Security Badge](${badgeUrl})](https://quantum-shadows-scanner.vercel.app)`;
    const htmlSnippet = `<a href="https://quantum-shadows-scanner.vercel.app"><img src="${badgeUrl}" alt="Quantum Shadows Security Badge" /></a>`;

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2000);
    };

    const renderBadgeSVG = () => {
        const colorHex = score >= 80 ? '#22c55e' : score >= 50 ? '#f97316' : '#ef4444';
        const bgColor = '#0f172a';
        return `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="400" height="120" rx="15" fill="url(#grad1)" stroke="${colorHex}" stroke-width="2"/>
            
            <!-- Logo Section -->
            <circle cx="50" cy="60" r="30" fill="${colorHex}" opacity="0.1"/>
            <path d="M50 35 L70 45 L70 75 L50 85 L30 75 L30 45 Z" fill="none" stroke="${colorHex}" stroke-width="3"/>
            <text x="50" y="68" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${colorHex}" text-anchor="middle">Q</text>

            <!-- Text Content -->
            <text x="100" y="45" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">Quantum Shadows</text>
            <text x="100" y="75" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8">Scan Score:</text>
            <text x="190" y="75" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${colorHex}">${score}/100</text>
            
            <!-- Badge Label -->
            <rect x="260" y="85" width="120" height="24" rx="5" fill="${colorHex}" opacity="0.2"/>
            <text x="320" y="102" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${colorHex}" text-anchor="middle">${badgeLabel.toUpperCase()}</text>
            
            <!-- Date -->
            <text x="380" y="20" font-family="Arial, sans-serif" font-size="10" fill="#64748b" text-anchor="end">${new Date().toISOString().split('T')[0]}</text>
        </svg>`;
    };

    // Create data URI for preview
    const svgString = renderBadgeSVG();
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

    const handleDownloadImage = async () => {
        try {
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const blobUrl = window.URL.createObjectURL(blob);

            const cleanHost = url ? url.replace(/(^\w+:|^)\/\//, '').replace(/[\//:]/g, '_') : 'site';

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `QuantumShadows-Badge-${cleanHost}-${safeLabel}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
            console.error("Download failed", e);
            alert("Could not download badge.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-3xl w-full relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-2">
                    <Shield className="w-6 h-6 text-brand-cyan" />
                    Shareable Security Badge
                </h3>
                <p className="text-slate-400 mb-8">
                    Export your status for GitHub, LinkedIn, or your personal website.
                </p>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Preview Section */}
                    <div className="flex-1 bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-800 relative group">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">Live Preview</span>

                        <div className="mb-6 transform hover:scale-105 transition-transform">
                            <img src={svgDataUrl} alt="Badge Preview" className="shadow-lg shadow-brand-cyan/20 w-full max-w-[300px]" />
                        </div>

                        <button
                            onClick={handleDownloadImage}
                            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" /> Download SVG Badge
                        </button>
                    </div>

                    {/* Snippets Section */}
                    <div className="flex-[1.5] space-y-6">

                        {/* Markdown Snippet */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                    <Github className="w-4 h-4" /> GitHub Markdown
                                </label>
                                {copiedType === 'md' && <span className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>}
                            </div>
                            <div className="relative group">
                                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap break-all pr-12">
                                    {markdownSnippet}
                                </pre>
                                <button
                                    onClick={() => handleCopy(markdownSnippet, 'md')}
                                    className="absolute top-2 right-2 p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* HTML Snippet */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                    <Code className="w-4 h-4" /> HTML Embed
                                </label>
                                {copiedType === 'html' && <span className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>}
                            </div>
                            <div className="relative group">
                                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap break-all pr-12">
                                    {htmlSnippet}
                                </pre>
                                <button
                                    onClick={() => handleCopy(htmlSnippet, 'html')}
                                    className="absolute top-2 right-2 p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* LinkedIn / Social Snippet */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                    <span className="bg-[#0A66C2] rounded px-1 py-0.5 text-white text-[10px]">in</span> LinkedIn Post
                                </label>
                                {copiedType === 'linkedin' && <span className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>}
                            </div>
                            <div className="relative group">
                                <textarea
                                    readOnly
                                    className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 font-mono resize-none focus:outline-none focus:border-slate-600"
                                    value={`🚀 I just scanned my project with Quantum Shadows!

🛡️ Security Score: ${score}/100
📊 Status: ${badgeMessage}

Quantum Shadows analyzes websites for post-quantum cryptographic vulnerabilities using Google's Quantum Intelligence.

Check your own site's readiness: https://quantum-shadows-scanner.vercel.app

#CyberSecurity #QuantumComputing #PostQuantum #GoogleQuantumAI`}
                                />
                                <button
                                    onClick={() => handleCopy(`🚀 I just scanned my project with Quantum Shadows!

🛡️ Security Score: ${score}/100
📊 Status: ${badgeMessage}

Quantum Shadows analyzes websites for post-quantum cryptographic vulnerabilities using Google's Quantum Intelligence.

Check your own site's readiness: https://quantum-shadows-scanner.vercel.app

#CyberSecurity #QuantumComputing #PostQuantum #GoogleQuantumAI`, 'linkedin')}
                                    className="absolute top-2 right-2 p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareableBadges;
