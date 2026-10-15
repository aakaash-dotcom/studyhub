# Architecture Diagram

## How Preview & Download Work

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Mobile Browser)                    │
│                                                                  │
│  1. Opens resource page                                         │
│  2. Sees preview tiles (SVG images)                             │
│  3. Scrolls to page 3 → hits login gate                         │
│  4. Logs in with phone OTP                                      │
│  5. Clicks "Download" button                                    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT APP (Your Website)                      │
│                                                                  │
│  ResourceReader.tsx                                              │
│  ├─ getTileUrl(pageNum)                                         │
│  │  └─ Calls Apps Script: ?action=preview&id=X&page=Y          │
│  │                                                               │
│  └─ handleDownload()                                            │
│     ├─ Checks if user is logged in                             │
│     ├─ If not → redirect to /login                             │
│     └─ If yes → Calls Apps Script: ?action=download&id=X       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              GOOGLE APPS SCRIPT (Your API)                       │
│              https://script.google.com/macros/s/.../exec         │
│                                                                  │
│  doGet(e)                                                        │
│  ├─ action=preview                                              │
│  │  ├─ Check cache (1 hour)                                    │
│  │  ├─ If miss → Generate SVG placeholder                      │
│  │  ├─ Cache result                                            │
│  │  └─ Return SVG image                                        │
│  │                                                               │
│  ├─ action=download                                             │
│  │  ├─ Get file from Drive by ID                               │
│  │  ├─ (Optional) Add watermark                                │
│  │  └─ Return PDF blob                                         │
│  │                                                               │
│  └─ action=info                                                 │
│     └─ Return file metadata                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE DRIVE (Your Storage)                   │
│                                                                  │
│  Folder: "Ravi's Tuition PDFs"                                  │
│  ├─ 10_Maths_English_QuarterlyImpQ_2026.pdf                    │
│  ├─ 10_Science_English_QuarterlyImpQ_2026.pdf                  │
│  ├─ 12_Maths_English_Quarterly_2026.pdf                        │
│  └─ ... (all your PDFs)                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Preview

```
User opens page
    ↓
React calls: Apps Script ?action=preview&id=123&page=1
    ↓
Apps Script checks cache
    ↓
    ├─ Cache HIT → Return cached SVG
    │
    └─ Cache MISS → Generate SVG placeholder
                      ↓
                   Cache for 1 hour
                      ↓
                   Return SVG
    ↓
React displays SVG as <img> tag
    ↓
User sees preview tile
```

---

## Data Flow: Download

```
User clicks "Download"
    ↓
React checks: Is user logged in?
    ↓
    ├─ NO → Redirect to /login
    │         ↓
    │      User enters phone
    │         ↓
    │      Apps Script sends OTP (simulated)
    │         ↓
    │      User enters OTP
    │         ↓
    │      User is now logged in
    │         ↓
    │      Return to resource page
    │
    └─ YES → Call Apps Script: ?action=download&id=123&user=9876543210
              ↓
           Apps Script gets file from Drive
              ↓
           (Optional) Add watermark
              ↓
           Return PDF blob
              ↓
           React creates download link
              ↓
           Browser downloads PDF
```

---

## File ID Mapping

```
catalogue.json                    Google Drive
─────────────────                 ─────────────
{
  "id": "10-maths-quarterly",     
  "file_pdf": "1BxiMVs0XRA5..."  ←→  File ID: 1BxiMVs0XRA5...
}                                    (from Drive URL)

Drive URL: https://drive.google.com/file/d/1BxiMVs0XRA5.../view
                                      ↑
                                 This is the ID
```

---

## Environment Variables

```bash
# .env file
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
                      ↑
                 From Apps Script deployment
```

---

## Authentication Flow

```
User enters phone: 9876543210
    ↓
Apps Script generates OTP: 123456
    ↓
OTP shown in browser console (demo mode)
    ↓
User enters OTP: 123456
    ↓
Apps Script verifies OTP
    ↓
User is logged in (stored in localStorage)
    ↓
User can now download PDFs
```

---

## Rate Limiting

```
User makes request
    ↓
Apps Script checks: How many requests in last 60 seconds?
    ↓
    ├─ < 30 requests → Allow
    │
    └─ ≥ 30 requests → Block (429 error)
```

---

## Caching Strategy

```
Preview request
    ↓
Check cache key: preview_123_p1
    ↓
    ├─ Found → Return cached SVG (fast!)
    │
    └─ Not found → Generate SVG
                    ↓
                 Store in cache for 1 hour
                    ↓
                 Return SVG
```

---

## Performance on 4G Mobile

```
Initial page load:
├─ HTML: 3.6 KB
├─ CSS: 28 KB (gzipped: 6 KB)
├─ JS: 254 KB (gzipped: 73 KB)
└─ Total: ~79 KB gzipped

On 4G (10 Mbps):
└─ Load time: ~0.06 seconds ✅

Preview tile (SVG):
├─ Size: ~2 KB
└─ Load time: < 0.01 seconds ✅

PDF download:
├─ Depends on file size
├─ Typical: 1-5 MB
└─ Load time: 1-5 seconds on 4G ✅
```

---

## Security Layers

```
1. Apps Script Access
   └─ Set to "Anyone" (public API)

2. Drive Folder Access
   └─ Only Apps Script can access (via your account)

3. Rate Limiting
   └─ 30 requests/minute per user

4. Authentication
   └─ Phone OTP required for download

5. Watermarking (future)
   └─ PDF stamped with user info
```

---

## Deployment Options

### Option 1: Root Domain
```
ravistuition.in/
├─ Main site (existing)
└─ Study library (this app)
```

### Option 2: Subpath
```
ravistuition.in/library/
└─ Study library (this app)
```

### Option 3: Subdomain
```
library.ravistuition.in/
└─ Study library (this app)
```

See `INTEGRATION.md` for details.

---

## Tech Stack

```
Frontend:
├─ React 18
├─ Vite (build tool)
├─ Tailwind CSS (styling)
├─ React Router (navigation)
└─ Lucide React (icons)

Backend:
├─ Google Apps Script (API)
├─ Google Drive (storage)
└─ Cache Service (caching)

Auth:
├─ Phone OTP (simulated)
└─ localStorage (session)

Analytics:
├─ Custom event tracking
└─ localStorage (event storage)
```

---

**Questions?** See `README.md` or contact: 86106 53352
