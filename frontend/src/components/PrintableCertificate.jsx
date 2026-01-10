import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Shield, Award, Calendar } from 'lucide-react';

const PrintableCertificate = ({ url, score, riskLabel, date, onClose }) => {
    const certificateRef = useRef(null);

    const [isDownloading, setIsDownloading] = React.useState(true); // Start true for auto-download

    React.useEffect(() => {
        // Auto-trigger download when component mounts (after a short delay to ensure rendering)
        const timer = setTimeout(() => {
            handleDownload();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleDownload = async () => {
        if (!certificateRef.current) return;

        try {
            setIsDownloading(true);
            // Need to wait for fonts or images if any, but valid SVG icons should render fine.
            // We might need to adjust scale for better quality.
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0f172a',
                logging: false,
                ignoreElements: (element) => element.tagName === 'LINK' || element.tagName === 'STYLE', // Try to ignore external styles
                onclone: (documentClone) => {
                    // Force override body/root styles in the clone to avoid inherited oklch
                    const element = documentClone.getElementById('certificate-capture-root');
                    if (element) {
                        element.style.fontFamily = 'Arial, sans-serif';
                        element.style.color = '#e2e8f0';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');

            // Calculate PDF dimensions based on canvas
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Use a fixed standard size like A4 landscape or fit to image
            // Let's fit it to A4 Landscape: 297mm x 210mm
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate ratio to fit
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const pWidth = imgWidth * ratio;
            const pHeight = imgHeight * ratio;

            // Center it
            const x = (pdfWidth - pWidth) / 2;
            const y = (pdfHeight - pHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, pWidth, pHeight);

            // Dynamic Filename
            const cleanHost = url ? url.replace(/(^\w+:|^)\/\//, '').replace(/[\//:]/g, '_') : 'site';
            pdf.save(`QuantumShadows_Certificate_${cleanHost}.pdf`);

        } catch (err) {
            console.error("PDF generation failed:", err);
            alert(`Failed to generate PDF: ${err.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-4xl space-y-4">
                {/* Controls */}
                <div className="flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold text-slate-300">Certificate Preview</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-brand-cyan hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
                        >
                            {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Certificate Container - This is what gets captured */}
                <div className="flex justify-center">
                    <div id="certificate-capture-root" ref={certificateRef} style={{ backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'serif' }} className="p-8 rounded-xl relative overflow-hidden w-full max-w-[800px] aspect-[1.414/1] shadow-2xl shrink-0">
                        {/* Decorative corner accents */}
                        <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-brand-cyan rounded-tl-3xl m-6 opacity-80"></div>
                        <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-brand-cyan rounded-tr-3xl m-6 opacity-80"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-brand-purple rounded-bl-3xl m-6 opacity-80"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-brand-purple rounded-br-3xl m-6 opacity-80"></div>

                        {/* Watermark/Background */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.05, pointerEvents: 'none' }}>
                            {/* Large Background Logo */}
                            <Shield className="w-96 h-96" color="#cbd5e1" />
                        </div>

                        <div style={{
                            backgroundColor: '#ffffff',
                            position: 'relative',
                            zIndex: 10,
                            textAlign: 'center',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '3rem',
                            border: '10px double #1e293b',
                            outline: '2px solid #fbbf24',
                            outlineOffset: '-16px'
                        }}>
                            {/* Header */}
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <Shield style={{ width: '4rem', height: '4rem', color: '#1e293b' }} />
                                </div>
                                <h1 style={{
                                    fontSize: '3rem',
                                    fontFamily: 'serif',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: '#1e293b',
                                    marginBottom: '0.5rem',
                                    borderBottom: '2px solid #fbbf24',
                                    display: 'inline-block',
                                    paddingBottom: '0.5rem'
                                }}>
                                    Certificate of Analysis
                                </h1>
                                <p style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.85rem', fontWeight: 600, marginTop: '1rem' }}>
                                    Quantum Shadows Security Scanner
                                </p>
                            </div>

                            {/* Content */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0', alignItems: 'center' }}>
                                <p style={{ fontSize: '1.25rem', color: '#334155', fontStyle: 'italic', fontFamily: 'serif' }}>
                                    This is to certify that the website
                                </p>

                                <div style={{
                                    fontSize: '1.5rem',
                                    fontFamily: 'monospace',
                                    color: '#0f172a',
                                    backgroundColor: '#f1f5f9',
                                    padding: '0.5rem 2rem',
                                    borderRadius: '0.25rem',
                                    borderBottom: '2px solid #cbd5e1',
                                    fontWeight: 'bold'
                                }}>
                                    {url || "https://example.com"}
                                </div>

                                <p style={{ color: '#334155', maxWidth: '40rem', lineHeight: 1.6, fontSize: '1rem' }}>
                                    has been rigorously evaluated for its resistance against classical and post-quantum cryptographic threats.
                                </p>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '4rem',
                                    marginTop: '1.5rem',
                                    borderTop: '1px solid #e2e8f0',
                                    borderBottom: '1px solid #e2e8f0',
                                    padding: '1.5rem 0',
                                    width: '80%'
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Evaluation Date</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar style={{ width: '1rem', height: '1rem', color: '#475569' }} />
                                            {date || new Date().toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Security Score</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 900, color: score >= 80 ? '#15803d' : score >= 50 ? '#c2410c' : '#b91c1c' }}>
                                            {score}/100
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Risk Status</div>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 1rem',
                                            borderRadius: '99px',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            backgroundColor: score >= 80 ? '#dcfce7' : score >= 50 ? '#ffedd5' : '#fee2e2',
                                            color: score >= 80 ? '#166534' : score >= 50 ? '#9a3412' : '#991b1b',
                                            border: '1px solid currentColor'
                                        }}>
                                            {riskLabel || "Unknown"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Signature */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', width: '90%', margin: '0 auto' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '1.5rem', fontFamily: 'serif', fontWeight: 'bold', color: '#1e293b' }}>
                                        Quantum Shadows
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                        Powered by Google Quantum AI
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {/* Signature Line */}
                                    <div style={{ width: '150px', borderBottom: '1px solid #1e293b', marginBottom: '0.5rem' }}></div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Authorized Signature
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '2rem', color: '#fbbf24' }}>
                                        <Award />
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                                        ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintableCertificate;
