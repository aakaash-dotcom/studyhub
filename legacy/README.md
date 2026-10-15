# Ravi's Tuition Study Library - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Google Apps Script

**Step 1: Create Apps Script Project**
1. Go to https://script.google.com
2. Click "New Project"
3. Name it "Ravi's Tuition API"
4. Delete the default code
5. Copy the entire content from `apps-script/Code.gs`
6. Paste it into the Apps Script editor

**Step 2: Configure Drive Folder**
1. Create a folder in Google Drive for your PDFs
2. Copy the folder ID from the URL:
   - URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the `FOLDER_ID_HERE` part
3. In Apps Script, replace `YOUR_FOLDER_ID_HERE` with your actual folder ID

**Step 3: Deploy as Web App**
1. Click "Deploy" → "New deployment"
2. Click gear icon → Select "Web app"
3. Configure:
   - Description: "Ravi's Tuition API v1"
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click "Deploy"
5. **Copy the deployment URL** (you'll need this next)

**Step 4: Authorize Access**
1. First time you run, Google will ask for permissions
2. Click "Review permissions"
3. Select your Google account
4. Click "Advanced" → "Go to Ravi's Tuition API (unsafe)"
5. Click "Allow"

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Apps Script URL (from Step 3)
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Optional: Base path for subpath deployment
# VITE_BASE_PATH=/library/
```

### 4. Upload Your PDFs to Google Drive

1. Open your configured Drive folder
2. Upload your PDF files
3. **Important**: The file ID in your catalogue must match the Drive file ID
   - Right-click a file in Drive → "Share" → "Copy link"
   - Extract the ID from: `https://drive.google.com/file/d/FILE_ID_HERE/view`
   - Update your `catalogue.json` with the correct `file_pdf` IDs

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 6. Build for Production

```bash
npm run build
```

The `dist/` folder contains your production build.

---

## How Preview & Download Work

### Preview Flow
1. User opens a resource page
2. App requests preview from Apps Script: `?action=preview&id=FILE_ID&page=1`
3. Apps Script checks cache → if miss, generates SVG placeholder
4. SVG is returned and displayed
5. Future requests served from cache (1 hour)

### Download Flow
1. User clicks "Download"
2. App checks if user is logged in
3. If not logged in → redirect to login
4. If logged in → request download from Apps Script: `?action=download&id=FILE_ID&user=PHONE`
5. Apps Script returns the PDF
6. Browser downloads the file

**Note**: The current Apps Script returns the original PDF. For watermarking, you'll need to:
- Use a PDF library like `pdf-lib` (requires server-side processing)
- Or use Google Cloud Functions with PDFtk
- Or use a third-party API like PDF.co

---

## Performance Optimization

### Current Bundle Size
- CSS: ~28 KB (gzipped: ~6 KB)
- JS: ~254 KB (gzipped: ~73 KB)
- Total: ~282 KB (gzipped: ~79 KB)

**This will load in <2 seconds on 4G** ✓

### Further Optimizations (Optional)

1. **Enable gzip on your server** (most hosting does this automatically)

2. **Use CDN** for static assets:
   ```html
   <!-- Add to index.html -->
   <link rel="preconnect" href="https://fonts.googleapis.com">
   ```

3. **Lazy load non-critical routes**:
   - Already implemented for recharts in AdminFunnel
   - Can add for other heavy components

4. **Optimize images**:
   - Use WebP format for preview tiles
   - Generate thumbnails at build time

---

## Troubleshooting

### Preview Shows "Unable to Open File"

**Problem**: The preview iframe is trying to load from Google Drive but failing.

**Solution**:
1. Make sure your PDFs are shared publicly in Drive
2. Or use the Apps Script endpoint (recommended)
3. Check browser console for errors
4. Verify `VITE_APPS_SCRIPT_URL` is set correctly

### Download Button Doesn't Work

**Problem**: Download fails or returns error.

**Solution**:
1. Check Apps Script logs: Apps Script → "Executions"
2. Verify the file ID in catalogue matches Drive file ID
3. Make sure the file exists in your configured Drive folder
4. Check rate limiting (30 requests/minute per user)

### Apps Script Deployment Fails

**Problem**: "Authorization required" or deployment fails.

**Solution**:
1. Go to Apps Script → "Executions"
2. Find the failed execution
3. Click on it to see the error
4. Re-authorize if needed: Run → "testSetup" function
5. Approve all permissions

### Classes Not in Reverse Order

**Problem**: Classes showing 1-12 instead of 12-1.

**Solution**: Already fixed! Classes are now ordered 12→8 in `src/data/catalogue.ts`.

---

## File Structure

```
ravistuition-app/
├── apps-script/
│   └── Code.gs              # Google Apps Script code
├── src/
│   ├── components/
│   │   ├── ResourceReader.tsx  # PDF preview + download
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── BottomNav.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ClassPage.tsx
│   │   ├── CategoryPage.tsx
│   │   ├── SubjectPage.tsx
│   │   ├── ResourcePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── AdminFunnel.tsx
│   ├── data/
│   │   ├── catalogue.json   # Your content (edit this!)
│   │   └── catalogue.ts     # Data loader + validation
│   ├── lib/
│   │   ├── tileGenerator.ts # SVG preview tiles
│   │   └── events.ts        # Analytics tracking
│   └── context/
│       └── AuthContext.tsx   # Phone OTP auth
├── .env                     # Your environment variables
├── INTEGRATION.md           # How to mount into ravistuition.in
└── README.md               # This file
```

---

## Next Steps

### Immediate
1. ✅ Deploy Apps Script
2. ✅ Upload PDFs to Drive
3. ✅ Update catalogue.json with real file IDs
4. ✅ Test preview and download

### Future Enhancements
1. **PDF Watermarking**: Use pdf-lib or Cloud Functions
2. **Real OTP**: Integrate Supabase or Firebase Auth
3. **Image Previews**: Generate WebP tiles at build time
4. **Analytics Dashboard**: Build admin UI for funnel data
5. **Payment Gateway**: Integrate Razorpay for paid content

---

## Support

**Phone**: 86106 53352  
**Email**: support@ravistuition.in  
**Website**: ravistuition.in

---

## License

© 2026 Ravi's Tuition, Madurai. All rights reserved.
