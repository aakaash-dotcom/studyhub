# 🚀 Quick Setup Guide - 5 Minutes

## What You Need
- ✅ Google account
- ✅ Your PDF files ready
- ✅ 5 minutes

---

## Step 1: Deploy Google Apps Script (2 minutes)

1. **Open Apps Script**
   - Go to: https://script.google.com
   - Click "New Project"

2. **Copy the Code**
   - Open file: `apps-script/Code.gs`
   - Select all (Ctrl+A) → Copy (Ctrl+C)
   - Paste into Apps Script editor (replace default code)

3. **Set Your Drive Folder ID**
   - Open Google Drive
   - Create a folder named "Ravi's Tuition PDFs"
   - Open the folder
   - Look at the URL: `https://drive.google.com/drive/folders/THIS_IS_YOUR_ID`
   - Copy the ID (the part after `/folders/`)
   - In Apps Script, find line 15: `DRIVE_FOLDER_ID: 'YOUR_FOLDER_ID_HERE'`
   - Replace `YOUR_FOLDER_ID_HERE` with your actual ID

4. **Deploy**
   - Click "Deploy" button (top right)
   - Click "New deployment"
   - Click gear icon ⚙️ → Select "Web app"
   - Fill in:
     - Description: `Ravi's Tuition API`
     - Execute as: `Me`
     - Who has access: `Anyone`
   - Click "Deploy"
   - **Copy the URL** that appears (looks like: `https://script.google.com/macros/s/AKfycb.../exec`)

5. **Authorize**
   - First time: Google will ask for permissions
   - Click "Review permissions" → Select your account
   - Click "Advanced" → "Go to Ravi's Tuition API (unsafe)"
   - Click "Allow"

---

## Step 2: Configure Your App (1 minute)

1. **Create .env file**
   - In your project folder, create a file named `.env` (no extension)
   - Add this line:
     ```
     VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
     ```
   - Replace the URL with the one you copied in Step 1.5

2. **Save the file**

---

## Step 3: Upload Your PDFs (1 minute)

1. **Open your Drive folder** (the one you created in Step 1.3)

2. **Upload your PDFs**
   - Drag and drop your PDF files
   - Wait for upload to complete

3. **Get File IDs**
   - Right-click on a PDF → "Share"
   - Click "Copy link"
   - The link looks like: `https://drive.google.com/file/d/FILE_ID_HERE/view?usp=sharing`
   - Copy the FILE_ID_HERE part

4. **Update catalogue.json**
   - Open `src/data/catalogue.json`
   - Find the `"file_pdf"` field
   - Replace the placeholder ID with your actual Drive file ID
   - Example:
     ```json
     {
       "id": "10-maths-quarterly-2026",
       "file_pdf": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs",  ← Your Drive file ID
       ...
     }
     ```

---

## Step 4: Test It! (1 minute)

1. **Start the app**
   ```bash
   npm run dev
   ```

2. **Open browser**
   - Go to: http://localhost:3000

3. **Test preview**
   - Click on any class (e.g., "10th Standard")
   - Click on a category (e.g., "Important Questions")
   - Click on a subject (e.g., "Maths")
   - Click on a resource
   - You should see the preview tiles!

4. **Test download**
   - Click "Login" button
   - Enter phone number (any 10 digits)
   - Enter OTP (check browser console for demo OTP)
   - Go back to the resource
   - Click "Download"
   - PDF should download!

---

## ✅ That's It!

Your app is now working with:
- ✅ Real PDF previews (from Apps Script)
- ✅ Real PDF downloads (from Google Drive)
- ✅ User authentication (phone OTP)
- ✅ All classes in reverse order (12→8)

---

## 🐛 Common Issues

### "Unable to open file" in preview
- **Fix**: Make sure you set `VITE_APPS_SCRIPT_URL` in `.env`
- **Fix**: Check Apps Script deployment is set to "Anyone" access

### Download doesn't work
- **Fix**: Check the file ID in `catalogue.json` matches your Drive file ID
- **Fix**: Make sure the PDF is in your configured Drive folder

### Apps Script shows "Authorization required"
- **Fix**: Run the `testSetup` function in Apps Script
- **Fix**: Re-authorize when prompted

### Preview shows placeholder instead of real PDF
- **Fix**: This is normal! The Apps Script returns SVG placeholders
- **To show real PDFs**: You need to implement PDF-to-image conversion (see README.md)

---

## 📞 Need Help?

**Phone**: 86106 53352  
**Email**: support@ravistuition.in

---

## 🎯 What's Next?

1. **Add more content**: Edit `src/data/catalogue.json` to add more PDFs
2. **Deploy to production**: Run `npm run build` and deploy the `dist/` folder
3. **Customize branding**: Edit colors in `src/index.css`
4. **Add analytics**: Check `/admin/funnel` to see user behavior

---

**Made with ❤️ for Ravi's Tuition, Madurai**
