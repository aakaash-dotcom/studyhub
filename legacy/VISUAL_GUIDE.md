# 📸 Visual Setup Guide

## Step 1: Create Google Apps Script

### 1.1 Go to Apps Script
```
URL: https://script.google.com
```

**What you'll see:**
- Google Apps Script homepage
- Blue button: "+ New project"

### 1.2 Create New Project
- Click "+ New project"
- Name it: "Ravi's Tuition API"
- You'll see a code editor with default function

### 1.3 Copy the Code
- Open file: `apps-script/Code.gs` in your project
- Select all: Ctrl+A (Windows) or Cmd+A (Mac)
- Copy: Ctrl+C or Cmd+C
- Go back to Apps Script editor
- Delete default code
- Paste: Ctrl+V or Cmd+V

### 1.4 Find Your Drive Folder ID
**Open Google Drive:**
```
URL: https://drive.google.com
```

**Create folder:**
- Click "+ New" → "New folder"
- Name: "Ravi's Tuition PDFs"
- Click "Create"

**Get folder ID:**
- Open the folder
- Look at URL in browser:
  ```
  https://drive.google.com/drive/folders/1ABC123xyz456DEF789
                                      ↑
                              THIS IS YOUR FOLDER ID
  ```
- Copy the ID (everything after `/folders/`)

### 1.5 Update Code with Folder ID
In Apps Script editor, find line 15:
```javascript
DRIVE_FOLDER_ID: 'YOUR_FOLDER_ID_HERE',
```

Replace with your actual ID:
```javascript
DRIVE_FOLDER_ID: '1ABC123xyz456DEF789',
```

### 1.6 Deploy as Web App
**Click "Deploy" button** (top right, blue button)

**Select "New deployment"**

**Click gear icon ⚙️** next to "Select type"
- Choose: "Web app"

**Fill in the form:**
- Description: `Ravi's Tuition API v1`
- Execute as: `Me (your@email.com)`
- Who has access: `Anyone`

**Click "Deploy"**

### 1.7 Authorize Access
**First time deployment:**
- Popup: "Authorization required"
- Click "Review permissions"
- Select your Google account
- Popup: "Ravi's Tuition API wants to access your Google Account"
- Click "Advanced"
- Click "Go to Ravi's Tuition API (unsafe)"
- Click "Allow"

### 1.8 Copy Deployment URL
**After successful deployment:**
- You'll see: "Web app deployed"
- Copy the URL that looks like:
  ```
  https://script.google.com/macros/s/AKfycbz.../exec
  ```
- **SAVE THIS URL** - you need it next!

---

## Step 2: Configure Your App

### 2.1 Create .env File
**In your project folder:**
- Create a new file named: `.env` (no extension!)
- Open it in a text editor

**Add this line:**
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbz.../exec
```

Replace the URL with the one you copied in Step 1.8

**Save the file**

### 2.2 Verify .env File
**Your .env file should look like:**
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbzABC123xyz/exec
```

**Important:**
- No quotes around the URL
- No spaces
- Must start with `VITE_`

---

## Step 3: Upload Your PDFs

### 3.1 Open Your Drive Folder
**Go to:**
```
https://drive.google.com/drive/folders/YOUR_FOLDER_ID
```

### 3.2 Upload PDFs
**Drag and drop:**
- Select your PDF files
- Drag them into the Drive folder
- Wait for upload to complete (blue progress bar)

**Or use upload button:**
- Click "+ New" → "File upload"
- Select your PDFs
- Click "Open"

### 3.3 Get File IDs
**For each PDF:**
- Right-click on the file
- Click "Share"
- Click "Copy link" (bottom left)
- The link looks like:
  ```
  https://drive.google.com/file/d/1XYZ789abc123DEF/view?usp=sharing
                                  ↑
                          THIS IS YOUR FILE ID
  ```
- Copy the ID (everything between `/d/` and `/view`)

**Example:**
```
Link: https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view
ID:   1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs
```

### 3.4 Update catalogue.json
**Open file:** `src/data/catalogue.json`

**Find the "file_pdf" field:**
```json
{
  "id": "10-maths-english-quarterlyimpq-2026",
  ...
  "file_pdf": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",
  ...
}
```

**Replace with your actual Drive file ID:**
```json
{
  "id": "10-maths-english-quarterlyimpq-2026",
  ...
  "file_pdf": "YOUR_ACTUAL_DRIVE_FILE_ID_HERE",
  ...
}
```

**Repeat for all resources in the catalogue.**

---

## Step 4: Test Everything

### 4.1 Start Development Server
**Open terminal in your project folder:**
```bash
npm run dev
```

**You'll see:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 4.2 Open Browser
**Go to:**
```
http://localhost:3000
```

**You should see:**
- Ravi's Tuition homepage
- Classes in order: 12th → 11th → 10th → 9th → 8th
- Brand colors (blue #17528C)

### 4.3 Test Preview
**Click on "10th Standard"**
- You'll see categories: Important Questions, Model Papers, etc.

**Click on "Important Questions"**
- You'll see subjects: Maths, Science, etc.

**Click on "Maths"**
- You'll see list of resources

**Click on first resource**
- You should see preview tiles (SVG images)
- Each tile shows "Ravi's Tuition" watermark
- Page counter at bottom

**If preview works:** ✅ Great!
**If preview shows error:** Check browser console (F12) for errors

### 4.4 Test Login
**Scroll down to see login gate**
- You'll see: "Login to download the full paper"

**Click "Login to Download"**
- You'll see login page
- Enter phone: `9876543210` (any 10 digits)
- Click "Send OTP"

**Check browser console (F12):**
- You'll see: `[DEMO] OTP for 9876543210: 123456`
- Copy the OTP number

**Enter the OTP**
- Click "Verify & Login"
- You should be redirected back to resource page

### 4.5 Test Download
**After login:**
- You'll see: "You've unlocked the full paper!"
- Click "Download Full Paper"

**What happens:**
- Browser downloads the PDF
- File opens in your PDF viewer
- You should see the actual PDF content

**If download works:** ✅ Perfect!
**If download fails:** Check:
1. File ID in catalogue.json matches Drive file ID
2. PDF is in your configured Drive folder
3. Apps Script is deployed and accessible

---

## Troubleshooting

### Problem: "Unable to open file" in preview
**Solution:**
1. Check `.env` file has `VITE_APPS_SCRIPT_URL`
2. Restart dev server: `npm run dev`
3. Clear browser cache: Ctrl+Shift+R
4. Check Apps Script deployment is set to "Anyone"

### Problem: Download button does nothing
**Solution:**
1. Open browser console (F12)
2. Look for errors
3. Check file ID in `catalogue.json`
4. Verify PDF exists in Drive folder
5. Check Apps Script logs: Apps Script → "Executions"

### Problem: Apps Script shows "Authorization required"
**Solution:**
1. Go to Apps Script
2. Click "Run" → select "testSetup" function
3. Click "Review permissions"
4. Approve all permissions
5. Try again

### Problem: Preview shows placeholder instead of real PDF
**Solution:**
- This is normal! The Apps Script returns SVG placeholders
- To show real PDF pages, you need to implement PDF-to-image conversion
- See README.md for details

---

## Success Checklist

✅ Apps Script deployed and accessible
✅ `.env` file created with Apps Script URL
✅ PDFs uploaded to Drive folder
✅ File IDs updated in `catalogue.json`
✅ Dev server running (`npm run dev`)
✅ Homepage loads with correct brand
✅ Classes in reverse order (12→8)
✅ Preview tiles display correctly
✅ Login flow works (phone + OTP)
✅ Download button works after login
✅ PDF downloads successfully

**If all checked:** 🎉 You're ready to deploy!

---

## Deploy to Production

### Build for production:
```bash
npm run build
```

**You'll see:**
```
dist/index.html                   3.65 kB
dist/assets/index-XXX.css        28.30 kB
dist/assets/index-XXX.js        253.66 kB
```

### Deploy `dist/` folder:
- Upload to your hosting
- Or deploy to Netlify/Vercel
- Or mount into ravistuition.in (see INTEGRATION.md)

---

## Need Help?

**Phone:** 86106 53352  
**Email:** support@ravistuition.in

**Check these files:**
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick start guide
- `ARCHITECTURE.md` - How it works
- `SUMMARY.md` - What's been done

---

**Made with ❤️ for Ravi's Tuition, Madurai · Since 1999**
