export const handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { url } = JSON.parse(event.body);
    const https = await import('node:https'); // Use dynamic import or require
    const { URL } = await import('node:url');

    if (!url) {
        return { statusCode: 400, body: JSON.stringify({ error: 'URL is required' }) };
    }

    const analyzeUrl = (targetUrl) => {
        return new Promise((resolve, reject) => {
            let finalUrl = targetUrl;
            if (!/^https?:\/\//i.test(finalUrl)) {
                finalUrl = 'https://' + finalUrl;
            }

            try {
                const parsedUrl = new URL(finalUrl);
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
                    const cipher = socket.getCipher();
                    const cert = socket.getPeerCertificate();
                    const protocol = socket.getProtocol();
                    const headers = res.headers;

                    const hsts = !!(headers['strict-transport-security']);
                    const csp = !!(headers['content-security-policy']);
                    const xFrame = !!(headers['x-frame-options']);
                    const xContentType = !!(headers['x-content-type-options']);
                    const secureHeaders = csp || xFrame || xContentType;

                    const now = new Date();
                    const validFrom = new Date(cert.valid_from);
                    const validTo = new Date(cert.valid_to);
                    const isCertTimeValid = now >= validFrom && now <= validTo;
                    const validCert = isCertTimeValid && !socket.authorizationError;

                    const cipherName = cipher.name || '';
                    const tls13 = protocol === 'TLSv1.3';
                    const ecdhe = cipherName.includes('ECDHE') || (tls13);
                    const aes256 = cipherName.includes('256');
                    const weakCiphers = /RC4|DES|3DES|MD5|NULL|EXPORT|anon/.test(cipherName);

                    resolve({
                        httpsEnabled: true,
                        tls13,
                        ecdhe,
                        aes256,
                        validCert,
                        hsts,
                        secureHeaders,
                        weakCiphers,
                        details: {
                            protocol,
                            cipher: cipherName
                        }
                    });
                });

                req.on('error', (e) => reject(e));
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

    try {
        const result = await analyzeUrl(url);
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(result),
        };
    } catch (error) {
        return {
            statusCode: 200, // Return 200 but with error payload so frontend handles it gracefully
            body: JSON.stringify({
                httpsEnabled: false,
                error: error.message
            })
        };
    }
};
