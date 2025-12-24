# PM Niche Discoverer Deployment Guide

This app is ready to be hosted on Netlify.

## How to Deploy to Netlify

1. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com/).
   - Click **Add new site**.
   - You can deploy by dragging and dropping this folder into the Netlify UI, or by connecting a git provider.

2. **Set Environment Variables (CRITICAL)**
   The app requires a Google Gemini API Key to function.
   - In your Netlify Site Dashboard, go to **Site configuration** > **Environment variables**.
   - Click **Add a variable**.
   - Key: `API_KEY`
   - Value: `YOUR_GEMINI_API_KEY_HERE`

3. **Routing Configuration**
   The included `netlify.toml` automatically ensures that if a user refreshes the page on a sub-route, the app doesn't return a 404 error by redirecting all traffic to `index.html`.

## Tech Stack
- **React 19**
- **Tailwind CSS**
- **Google Gemini API** (Gemini 3 Flash & 2.5 Flash Image)
- **ESM Modules** (No-build direct serving)
