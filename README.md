<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1B_j3Rg4bgMVplt3Qhc7UDGB4XrmBeQf6

## Features

✨ **User Authentication** - Sign up and login with email/password
📁 **Project History** - All generated projects are automatically saved
🔍 **Search Projects** - Quickly find your past projects
💾 **Auto-save** - Projects are saved automatically after generation
🎨 **Dark Mode** - Toggle between light and dark themes
🚀 **AI-Powered** - Generate complete project structures using Gemini 2.5 Pro

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## New in This Version

- **Authentication System**: Users must sign up/login to use the app
- **Project History**: Browse, search, and reload your previously generated projects
- **Persistent Storage**: All projects are saved locally in your browser
- **Toast Notifications**: Get feedback when projects are saved or loaded
- **Enhanced UX**: Improved navigation with user profile and project management buttons
