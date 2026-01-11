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

// --- Live Monitor Endpoints ---
const THREAT_TYPES = ['CRITICAL', 'WARN', 'INFO'];
const THREAT_MESSAGES = [
    "Harvest-now attack detected on Server-US-East-4. Payload analysis initiated.",
    "Scanning TLS configuration for endpoint 192.168.1.105...",
    "Weak cipher suite (RC4) detected on Legacy-Gateway-02.",
    "Quantum-ready handshake initiated from 10.0.0.5 via Kyber-512.",
    "Certificate expiry warning for subdomain api.test.com. Renew immediately.",
    "Unusual traffic spike detected on port 443 (potential probing).",
    "Post-Quantum transition check: FAILED for node-cluster-alpha."
];

app.get('/api/threats', (req, res) => {
    // Generate 3-5 random recent threats
    const count = 3 + Math.floor(Math.random() * 3);
    const threats = Array.from({ length: count }).map((_, i) => {
        const type = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
        return {
            id: Date.now() + i,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            type: type,
            message: THREAT_MESSAGES[Math.floor(Math.random() * THREAT_MESSAGES.length)]
        };
    });
    res.json(threats);
});

app.get('/api/stats', (req, res) => {
    // Return mock global stats that change slightly
    res.json({
        securedSites: 1240 + Math.floor(Math.random() * 25), // Mock live counter
        threatsBlocked: "4.5M",
        nistAdoption: 12, // 12%
        legacyVuln: 68    // 68%
    });
});


// --- Authentication & Persistence ---
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

// Initialize Database
const dbPath = path.resolve(__dirname, 'kv.sqlite');
const db = new Database(dbPath);

// Create Users Table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )
`);

app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const insert = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
        const info = insert.run(email, hashedPassword);
        res.status(201).json({ success: true, userId: info.lastInsertRowid });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!row) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, row.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        res.json({ success: true, email: row.email });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
