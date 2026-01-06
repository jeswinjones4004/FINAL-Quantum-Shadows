const express = require('express');
const cors = require('cors');
const https = require('https');
const { URL } = require('url');

const app = express();
app.use(cors());
app.use(express.json());

const analyzeUrl = (url) => {
    return new Promise((resolve, reject) => {
        let targetUrl = url;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }

        try {
            const parsedUrl = new URL(targetUrl);

            // Allow self-signed certs to be inspected rather than just rejecting connection
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                rejectUnauthorized: false,
                agent: new https.Agent({ keepAlive: false })
            };

            const req = https.request(options, (res) => {
                const socket = res.socket;

                // Get TLS info
                const cipher = socket.getCipher(); // { name: 'TLS_AES_256_GCM_SHA384', version: 'TLSv1.3' }
                const cert = socket.getPeerCertificate();
                const protocol = socket.getProtocol(); // 'TLSv1.3' or 'TLSv1.2'

                // Check Headers
                const headers = res.headers;
                const hsts = !!(headers['strict-transport-security']);
                const csp = !!(headers['content-security-policy']);
                const xFrame = !!(headers['x-frame-options']);
                const xContentType = !!(headers['x-content-type-options']);
                const secureHeaders = csp || xFrame || xContentType;

                // Validate Certificate Time
                const now = new Date();
                const validFrom = new Date(cert.valid_from);
                const validTo = new Date(cert.valid_to);
                const isCertTimeValid = now >= validFrom && now <= validTo;
                // Since we set rejectUnauthorized: false, we check socket.authorizationError for trust issues
                const validCert = isCertTimeValid && !socket.authorizationError;

                // Cipher Suite Analysis
                const cipherName = cipher.name || '';
                const tls13 = protocol === 'TLSv1.3';
                const ecdhe = cipherName.includes('ECDHE') || (tls13); // TLS 1.3 implies good key exchange usually
                const aes256 = cipherName.includes('256'); // Simple heuristic

                // Weak Cipher Heuristic (RC4, 3DES, CBC in some contexts, but GCM is preferred)
                // If it's not GCM and not Poly1305, it might be older CBC which is okay but less ideal.
                // Definitely flag RC4, DES, 3DES, MD5.
                const weakCiphers = /RC4|DES|3DES|MD5|NULL|EXPORT|anon/.test(cipherName);

                resolve({
                    httpsEnabled: true, // We successfully connected via HTTPS
                    tls13,
                    ecdhe,
                    aes256,
                    validCert,
                    hsts,
                    secureHeaders,
                    weakCiphers,
                    details: {
                        protocol,
                        cipher: cipherName,
                        server: headers['server'],
                        certSubject: cert.subject ? cert.subject.CN : 'Unknown'
                    }
                });
            });

            req.on('error', (e) => {
                reject(e);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error("Connection timeout"));
            });

            req.end();

        } catch (e) {
            reject(e);
        }
    });
};

app.post('/api/scan', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        console.log(`Analyzing: ${url}`);
        const result = await analyzeUrl(url);
        res.json(result);
    } catch (error) {
        console.error("Scan error:", error.message);
        // Fallback for errors (e.g. host not found, not HTTPS)
        res.json({
            httpsEnabled: false,
            tls13: false,
            ecdhe: false,
            aes256: false,
            validCert: false,
            hsts: false,
            secureHeaders: false,
            weakCiphers: false,
            error: error.message
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
