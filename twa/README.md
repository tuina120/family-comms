# Android TWA Packaging

This wraps the PWA into an Android app using Trusted Web Activity (TWA).

## Prerequisites
- A deployed HTTPS URL for this site.
- Android Studio + Java 17.
- Node.js installed.

## Steps (Bubblewrap)
1. Install Bubblewrap CLI:
```
npm install -g @bubblewrap/cli
```

2. Initialize from the live manifest:
```
bubblewrap init --manifest https://YOUR_DOMAIN/manifest.webmanifest
```

3. Replace the generated manifest with `twa/manifest.json` if you want a
   prefilled template, and update:
- `host` (your domain)
- `startUrl`
- `iconUrl` (PNG recommended)
- `packageId`

4. Build the Android project:
```
bubblewrap build
```

5. Open the generated `app/` folder in Android Studio, then build the APK/AAB.

## Notes
- TWA requires HTTPS and a valid Digital Asset Links file.
- Bubblewrap can generate the asset links and a keystore for you.
- Replace `public/icon.svg` with PNG icons for Play Store submission.
