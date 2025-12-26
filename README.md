# PM Niche Discoverer

A professional tool for Product Managers to define their unique market positioning using the 3-question niche formula. This app uses **Gemini 3** for text refinement and **Nano Banana** models for avatar generation.

## 🚀 How to Host (GitHub + Netlify)

The recommended way to host this application is to push the code to **GitHub** and connect it to **Netlify**. This allows you to securely manage your Google Gemini API Key.

### 1. Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Initialize and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### 2. Connect to Netlify (Free)
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** > **"Import from existing project"**.
3. Select **GitHub** and authorize it.
4. Choose the repository you just created.

### 3. Configure Deployment Settings
Netlify might try to auto-detect a build command. **You must override this** because this is a build-free ESM app.

*   **Build Command:** `echo 'No build'` (or leave blank)
*   **Publish Directory:** `.` (just a dot, representing the root folder)

### 4. Set Environment Variables (Crucial!)
Your app needs an API key to work.

1. On the Netlify deploy screen (or in Site Settings > Environment variables), click **"Add variable"**.
2. **Key:** `API_KEY`
3. **Value:** Your Google Gemini API Key (Get one from [Google AI Studio](https://aistudio.google.com/)).
4. Click **Deploy Site**.

### 5. Access Your App
Netlify will give you a URL (e.g., `https://your-site-name.netlify.app`). Your app is now live!

## ⚠️ Why not GitHub Pages?
GitHub Pages is designed for static content and public repositories. It does not provide a secure way to inject server-side environment variables like `API_KEY` into a client-side application without exposing them in your code. Using Netlify allows you to keep your code on GitHub while keeping your API keys secure.

## Project Structure
- `index.html`: Entry point with ESM imports.
- `index.tsx`: React application root.
- `netlify.toml`: Configuration for SPA routing and deployment.
- `services/geminiService.ts`: AI logic using Google GenAI SDK.
