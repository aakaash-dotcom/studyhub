# 🚀 Free Deployment Guide - Auto-Deploy from GitHub

## Option 1: Vercel (Recommended - Easiest)

**Why Vercel?**
- ✅ 100% free for personal projects
- ✅ Auto-deploys when you push to GitHub
- ✅ Custom domain support (ravistuition.in)
- ✅ Fast CDN worldwide
- ✅ SSL/HTTPS included
- ✅ Zero configuration needed

### Step-by-Step Setup (5 minutes)

#### Step 1: Push to GitHub
```bash
# 1. Create .gitignore first
echo "node_modules
dist
.env
.env.local" > .gitignore

# 2. Initialize git
git init
git add .
git commit -m "Initial commit - Ravi's Tuition Study Materials"

# 3. Create GitHub repository
# Go to https://github.com/new
# Name: ravistuition-library
# Make it Public or Private (your choice)

# 4. Push to GitHub
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ravistuition-library.git
git push -u origin main
```

#### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → Sign up with GitHub
3. Click **"Add New Project"**
4. Select your repository: `ravistuition-library`
5. Vercel auto-detects Vite → Click **"Deploy"**
6. Wait 30 seconds → Your site is live!

**You'll get a URL like:** `https://ravistuition-library.vercel.app`

#### Step 3: Auto-Deploy Setup
✅ **Done!** Vercel automatically deploys every time you push to GitHub.

**Test it:**
```bash
# Make a change
echo "// test" >> src/App.tsx
git add .
git commit -m "Test auto-deploy"
git push

# Watch Vercel dashboard - it will auto-deploy in 30 seconds!
```

#### Step 4: Custom Domain (ravistuition.in)

**Option A: Subdomain (library.ravistuition.in)**
1. In Vercel dashboard → Your project → **Settings** → **Domains**
2. Add: `library.ravistuition.in`
3. Vercel gives you DNS records:
   ```
   Type: A
   Name: library
   Value: 76.76.21.21
   ```
4. Go to your domain provider (GoDaddy/Namecheap/etc.)
5. Add the A record
6. Wait 5-10 minutes → SSL auto-provisions

**Option B: Subpath (ravistuition.in/library)**
1. In Vercel → **Settings** → **Domains** → Add `ravistuition.in`
2. Update `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: '/library/',
     // ... rest of config
   })
   ```
3. Push to GitHub → Auto-deploys

---

## Option 2: Netlify (Alternative)

**Why Netlify?**
- ✅ Free tier generous
- ✅ Auto-deploy from GitHub
- ✅ Form handling built-in
- ✅ Good for beginners

### Setup Steps

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your GitHub repository
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **"Deploy site"**
7. Done! You get `https://random-name.netlify.app`

**Custom domain:** Same process as Vercel (Settings → Domain management)

---

## Option 3: GitHub Pages (Free but limited)

**Why GitHub Pages?**
- ✅ Completely free
- ✅ Integrated with GitHub
- ❌ No server-side features
- ❌ Slower than Vercel/Netlify

### Setup Steps

1. Install gh-pages:
   ```bash
   npm install -D gh-pages
   ```

2. Update `package.json`:
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. Update `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: '/ravistuition-library/',
     // ... rest
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

5. Your site: `https://YOUR_USERNAME.github.io/ravistuition-library/`

**Note:** GitHub Pages doesn't auto-deploy on push. You need to run `npm run deploy` manually.

---

## 🎯 My Recommendation: Use Vercel

**Why?**
1. **Fastest setup** - 5 minutes from zero to live
2. **Auto-deploy** - Push to GitHub → live in 30 seconds
3. **Free SSL** - HTTPS included
4. **Custom domain** - Easy to connect ravistuition.in
5. **Fast CDN** - Global edge network
6. **No configuration** - Just push and it works

---

## 📝 Complete Workflow

### Daily Workflow (After Setup)

```bash
# 1. Make changes to your code
# Edit files in VS Code...

# 2. Test locally
npm run dev
# Open http://localhost:3000

# 3. Push to GitHub
git add .
git commit -m "Added new study materials"
git push

# 4. Vercel auto-deploys!
# Watch: https://vercel.com/dashboard
# Live in 30 seconds at: https://your-site.vercel.app
```

### First Time Setup Checklist

- [ ] Create GitHub account (if you don't have one)
- [ ] Install Git on your computer
- [ ] Push code to GitHub (see Step 1 above)
- [ ] Create Vercel account (use GitHub login)
- [ ] Import repository to Vercel
- [ ] Click "Deploy"
- [ ] Test your live site
- [ ] (Optional) Add custom domain

---

## 🔧 Adding Your Google Drive Files

### Step 1: Get Your Drive Folder ID

1. Open [Google Drive](https://drive.google.com)
2. Create folder structure:
   ```
   Ravi's Tuition Materials/
   ├── 12th Standard/
   │   ├── Maths/
   │   ├── Physics/
   │   └── Chemistry/
   ├── 11th Standard/
   │   └── ...
   ├── 10th Standard/
   │   └── ...
   └── ...
   ```

3. Right-click each class folder → **Share** → **Get link**
4. Change to **"Anyone with the link"**
5. Copy the folder ID from URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
                                        ^^^^^^^^^^^^^^^^
                                        This is the ID
   ```

### Step 2: Update catalogue.ts

Edit `src/data/catalogue.ts`:

```typescript
export const CLASSES = [
  { 
    id: '12', 
    name: '12th Standard', 
    name_ta: '12ம் வகுப்பு', 
    icon: '🎖️',
    drive_folder_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs' // ← Your folder ID
  },
  { 
    id: '11', 
    name: '11th Standard', 
    name_ta: '11ம் வகுப்பு', 
    icon: '📖',
    drive_folder_id: 'ANOTHER_FOLDER_ID_HERE'
  },
  // ... etc
]
```

### Step 3: Get File IDs for PDFs

For each PDF you want to add:

1. Right-click the PDF in Google Drive → **Share** → **Get link**
2. Make it **"Anyone with the link"**
3. Copy the file ID:
   ```
   https://drive.google.com/file/d/FILE_ID_HERE/view
                                    ^^^^^^^^^^^^^
                                    This is the ID
   ```

### Step 4: Update catalogue.json

```json
{
  "id": "10-maths-english-quarterlyimpq-2026",
  "class": "10",
  "subject": "Maths",
  "drive_file_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs", // ← Add this
  "file_pdf": "10_Maths_English_QuarterlyImpQ_2026.pdf",
  // ... rest of fields
}
```

### Step 5: Push to GitHub

```bash
git add .
git commit -m "Added Google Drive integration"
git push

# Vercel auto-deploys! Your Drive folders are now embedded!
```

---

## 🎨 What You Get

After deployment:

✅ **Live website** at `https://your-site.vercel.app`
✅ **Auto-deploy** on every git push
✅ **Google Drive folders** embedded in each class page
✅ **Real PDF preview** from Google Drive
✅ **Download button** works (opens Drive download)
✅ **Mobile-optimized** (72KB bundle)
✅ **Fast loading** (< 2s on 4G)
✅ **Free SSL/HTTPS**
✅ **Custom domain** support

---

## 📞 Need Help?

**Vercel Support:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

**Contact:**
- Email: support@ravistuition.in
- Phone: 86106 53352

---

## 🚀 Quick Start Commands

```bash
# 1. Clone your repo (after creating on GitHub)
git clone https://github.com/YOUR_USERNAME/ravistuition-library.git
cd ravistuition-library

# 2. Install dependencies
npm install

# 3. Test locally
npm run dev

# 4. Make changes, then push
git add .
git commit -m "Your changes"
git push

# 5. Vercel auto-deploys! 🎉
```

**That's it!** Your site is now live and auto-updates on every push.
