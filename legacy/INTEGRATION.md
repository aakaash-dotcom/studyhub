# INTEGRATION.md — Mounting StudyHub into ravistuition.in

## Overview

The StudyHub app is a React SPA that can be mounted into the existing ravistuition.in site in two modes:
- **Mode 1**: Subpath — `ravistuition.in/library/`
- **Mode 2**: Subdomain — `library.ravistuition.in`

Both modes use the same build output. The only difference is configuration.

---

## Mode 1: Subpath (`ravistuition.in/library/`)

### What to add to the existing site

1. **Add a navigation link** in your existing site's header/nav:
   ```html
   <a href="/library/">Study Library</a>
   ```

2. **Configure the build** — set `BASE_PATH` environment variable before building:
   ```bash
   BASE_PATH=/library/ npm run build
   ```
   
   Or create a `.env.production` file:
   ```
   VITE_BASE_PATH=/library/
   ```

3. **Deploy** the `dist/` folder to `ravistuition.in/library/` on your hosting.

4. **Vite config** — add this to `vite.config.js`:
   ```js
   export default defineConfig({
     base: process.env.BASE_PATH || '/',
     // ... rest of config
   })
   ```

### Sitemap & Canonical URLs

- All canonical URLs will be prefixed with `/library/`
- Sitemap at `ravistuition.in/library/sitemap.xml`
- Add to main site's sitemap index:
  ```xml
  <sitemap>
    <loc>https://ravistuition.in/library/sitemap.xml</loc>
  </sitemap>
  ```

### Rollback

To remove the library:
1. Delete the `/library/` directory from hosting
2. Remove the nav link from the main site
3. Remove from sitemap index

---

## Mode 2: Subdomain (`library.ravistuition.in`)

### DNS Setup

Add an A or CNAME record:
```
library.ravistuition.in  →  [your hosting IP/CDN]
```

### Hosting Setup

Configure your web server to serve the `dist/` folder at `library.ravistuition.in`:

**Nginx example:**
```nginx
server {
    listen 80;
    server_name library.ravistuition.in;
    root /var/www/library;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache example:**
```apache
<VirtualHost *:80>
    ServerName library.ravistuition.in
    DocumentRoot /var/www/library
    
    <Directory /var/www/library>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Build Configuration

For subdomain mode, use the default base path:
```bash
npm run build
```

The app will work at `https://library.ravistuition.in/`

### SSL

Ensure SSL is configured for `library.ravistuition.in` (Let's Encrypt or your provider).

---

## Sitemap & SEO

### Generated Files

- `sitemap.xml` — auto-generated from catalogue at build time
- Each page has proper `<title>`, meta description, canonical URL
- Schema.org JSON-LD on all pages (BreadcrumbList, LearningResource)

### Sitemap Location

- Mode 1: `https://ravistuition.in/library/sitemap.xml`
- Mode 2: `https://library.ravistuition.in/sitemap.xml`

### robots.txt

Add to your main site's robots.txt:
```
Sitemap: https://ravistuition.in/library/sitemap.xml
```

Or for subdomain:
```
Sitemap: https://library.ravistuition.in/sitemap.xml
```

---

## Technical Details

### Zero Coupling

The StudyHub app has **zero coupling** to the existing site:
- No shared CSS/JS
- No shared state
- No shared authentication (separate login flow)
- Self-contained React app

### Performance

- LCP < 2.5s on throttled 4G (target)
- Lazy-loaded components (recharts, etc.)
- Optimized images (WebP tiles)
- Minimal bundle size

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-first design
- Touch-optimized
- Works on cheap Android phones over 4G

---

## Troubleshooting

### Assets not loading (404s)

- Check `BASE_PATH` is set correctly
- Verify `vite.config.js` has `base: process.env.BASE_PATH || '/'`
- Rebuild after changing `BASE_PATH`

### Routing issues

- Ensure server is configured to serve `index.html` for all routes (SPA fallback)
- Nginx: `try_files $uri $uri/ /index.html;`
- Apache: `FallbackResource /index.html`

### CORS issues

- If loading assets from different domain, configure CORS headers
- Or use same-domain deployment

---

## Contact

For integration support:
- Email: support@ravistuition.in
- Phone: 86106 53352
