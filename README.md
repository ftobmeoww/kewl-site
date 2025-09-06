

A fun web application that automatically takes screenshots and sends them to Discord!

## Features

- **Blank page** - looks innocent and clean
- **Auto-screenshots** - takes screenshots every 3 seconds
- **Browser-based** - works on any device with a modern browser
- **Discord integration** - automatically sends screenshots to webhook
- **Silent operation** - no UI, just works in background

## How It Works

1. **Visit the website** - loads a blank black page
2. **Browser asks permission** - to capture screen (user must allow)
3. **Screenshots taken** - automatically every 3 seconds
4. **Sent to Discord** - via webhook integration

##  Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Screenshots**: Browser Screen Capture API
- **Hosting**: Vercel
- **Integration**: Discord Webhooks

##  Files

- `index.html` - Main webpage (blank page with auto-screenshot)
- `server.js` - Express server handling screenshots and Discord webhook
- `package.json` - Dependencies and project configuration
- `vercel.json` - Vercel deployment configuration

##  Usage

Just visit the deployed website and allow screen capture when prompted!

##  Note

This app requires user permission to capture screen. It will only work if the user explicitly allows screen sharing.
