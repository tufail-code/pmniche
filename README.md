# PM Niche Discoverer Deployment Guide

This app is ready to be hosted on Netlify.

## How to Deploy

1. **Push to GitHub**
   Initialize a git repo and push these files to a new GitHub repository.

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com/).
   - Click **Add new site** > **Import from existing project**.
   - Select **GitHub** and choose your repository.

3. **Set Environment Variables (CRITICAL)**
   The app requires a Google Gemini API Key to function.
   - In your Netlify Site Dashboard, go to **Site configuration** > **Environment variables**.
   - Click **Add a variable**.
   - Key: `API_KEY`
   - Value: `YOUR_GEMINI_API_KEY_HERE`

4. **Verify Redirects**
   The included `netlify.toml` ensures that if a user refreshes the page on a sub-route, the app doesn't return a 404 error.

## Tech Stack
- **React 19**
- **Tailwind CSS**
- **Google Gemini API** (Gemini 3 Flash & 2.5 Flash Image)
- **ESM Modules** (No-build direct serving)
