# Aether Nexus Deployment Guide

This guide covers how to build Aether Nexus as a standalone Android app (APK/AAB) for your phone or the Play Store, and how to export it as a static website for PCs.

## Prerequisites
- Node.js installed on your computer.
- An Expo account (free) to use their build servers.

## 1. Building for Android (APK or Play Store AAB)

We use Expo Application Services (EAS) to build the app in the cloud so you don't need Android Studio.

### Setup EAS
1. Open a terminal in your project folder (`c:\antigravity folder\aether`).
2. Login to your Expo account using `npx`:
   ```bash
   npx eas-cli login
   ```
3. Configure the project for EAS:
   ```bash
   npx eas-cli build:configure
   ```

### Build an APK (For direct installation on your phone)
If you just want to install it on your phone offline:
1. Check your `eas.json` file (created after the configure step). You should have a profile like this:
   ```json
   "build": {
     "preview": {
       "android": {
         "buildType": "apk"
       }
     }
   }
   ```
2. Run the build command for the APK:
   ```bash
   npx eas-cli build -p android --profile preview
   ```
3. Once the build finishes, EAS will provide a link/QR code to download the `.apk` file.
4. Download it on your Android phone, allow "Install from Unknown Sources", and install it.

### Build an AAB (For Google Play Store)
If you want to publish to the Play Store:
1. Run the production build command:
   ```bash
   npx eas-cli build -p android
   ```
2. EAS will generate an `.aab` file. Download this file.
3. Upload the `.aab` to your Google Play Console developer account.

---

## 2. Building for Web (PCs)

Aether Nexus can be exported as a static website that you can host anywhere (Vercel, Netlify, GitHub Pages, or a standard web host).

1. In your project folder, run the web export command:
   ```bash
   npx expo export -p web
   ```
2. This will generate a `dist` folder containing standard HTML, CSS, and JS files.
3. Upload the contents of the `dist` folder to any web host. You can now access Aether Nexus from any PC browser.
