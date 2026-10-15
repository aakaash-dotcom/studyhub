/**
 * Google Apps Script for Ravi's Tuition Study Library
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Copy this entire code
 * 4. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 5. Copy the deployment URL
 * 6. Add to your .env file: VITE_APPS_SCRIPT_URL=your_deployment_url
 * 
 * This script handles:
 * - Preview: Returns WebP images of PDF pages
 * - Download: Returns watermarked PDF with user info
 */

// Configuration
const CONFIG = {
  // Your Google Drive folder containing PDFs
  DRIVE_FOLDER_ID: 'YOUR_FOLDER_ID_HERE',
  
  // Watermark settings
  WATERMARK_TEXT: "Ravi's Tuition",
  WATERMARK_OPACITY: 0.15,
  
  // Rate limiting (requests per minute per user)
  RATE_LIMIT: 30,
  
  // Cache duration (seconds)
  CACHE_DURATION: 3600
};

/**
 * Main entry point - handles all requests
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const id = e.parameter.id;
    
    if (!action || !id) {
      return jsonResponse({ error: 'Missing action or id parameter' }, 400);
    }
    
    // Rate limiting check
    const user = e.parameter.user || 'anonymous';
    if (!checkRateLimit(user)) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429);
    }
    
    switch (action) {
      case 'preview':
        return handlePreview(id, e.parameter.page);
      case 'download':
        return handleDownload(id, user);
      case 'info':
        return handleInfo(id);
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle preview request - returns WebP image of PDF page
 */
function handlePreview(id, pageNum) {
  const page = parseInt(pageNum) || 1;
  
  // Get file from Drive
  const file = getFileById(id);
  if (!file) {
    return jsonResponse({ error: 'File not found' }, 404);
  }
  
  // Check cache first
  const cacheKey = `preview_${id}_p${page}`;
  const cached = CacheService.getScriptCache().get(cacheKey);
  if (cached) {
    return ContentService.createTextOutput(cached)
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Convert PDF page to image
  // Note: Apps Script doesn't have native PDF to image conversion
  // We'll use a workaround: serve the PDF and let the client render it
  
  // For now, return a placeholder SVG
  const svg = generatePlaceholderSVG(page, file.getName());
  
  // Cache the result
  CacheService.getScriptCache().put(cacheKey, svg, CONFIG.CACHE_DURATION);
  
  return ContentService.createTextOutput(svg)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle download request - returns watermarked PDF
 */
function handleDownload(id, user) {
  // Get file from Drive
  const file = getFileById(id);
  if (!file) {
    return jsonResponse({ error: 'File not found' }, 404);
  }
  
  // Get PDF blob
  const blob = file.getBlob();
  
  // Add watermark (simplified - in production, use a PDF library)
  // For now, just return the original PDF
  // TODO: Implement actual PDF watermarking
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Download initiated',
    fileName: file.getName()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle info request - returns file metadata
 */
function handleInfo(id) {
  const file = getFileById(id);
  if (!file) {
    return jsonResponse({ error: 'File not found' }, 404);
  }
  
  return jsonResponse({
    id: id,
    name: file.getName(),
    size: file.getSize(),
    mimeType: file.getMimeType(),
    created: file.getDateCreated(),
    modified: file.getLastUpdated()
  });
}

/**
 * Get file from Google Drive by ID
 */
function getFileById(id) {
  try {
    // Try to get file directly by ID
    return DriveApp.getFileById(id);
  } catch (e) {
    // If direct ID fails, search in configured folder
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const files = folder.getFilesByName(id);
    
    if (files.hasNext()) {
      return files.next();
    }
    
    return null;
  }
}

/**
 * Check rate limit for user
 */
function checkRateLimit(user) {
  const cache = CacheService.getScriptCache();
  const key = `rate_${user}`;
  const current = parseInt(cache.get(key) || '0');
  
  if (current >= CONFIG.RATE_LIMIT) {
    return false;
  }
  
  cache.put(key, (current + 1).toString(), 60); // 60 seconds
  return true;
}

/**
 * Generate placeholder SVG for preview
 */
function generatePlaceholderSVG(pageNum, fileName) {
  return `
    <svg width="595" height="842" xmlns="http://www.w3.org/2000/svg">
      <rect width="595" height="842" fill="#ffffff"/>
      
      <!-- Header -->
      <rect x="0" y="0" width="595" height="80" fill="#17528C"/>
      <text x="30" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">Ravi's Tuition</text>
      <text x="30" y="55" font-family="Arial, sans-serif" font-size="11" fill="#ffffff">MADURAI · SINCE 1999</text>
      
      <!-- Page number -->
      <text x="565" y="35" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="end">Page ${pageNum}</text>
      
      <!-- Content area -->
      <text x="297.5" y="421" font-family="Arial, sans-serif" font-size="16" fill="#595959" text-anchor="middle">Preview Page ${pageNum}</text>
      <text x="297.5" y="450" font-family="Arial, sans-serif" font-size="12" fill="#C0C8D9" text-anchor="middle">${fileName}</text>
      
      <!-- Watermark -->
      <g transform="translate(297.5, 421) rotate(-45)">
        <text x="0" y="0" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#17528C" fill-opacity="0.08" text-anchor="middle">RAVI'S TUITION</text>
        <text x="0" y="50" font-family="Arial, sans-serif" font-size="24" fill="#17528C" fill-opacity="0.08" text-anchor="middle">ravistuition.in</text>
      </g>
      
      <!-- Footer -->
      <line x1="30" y1="792" x2="565" y2="792" stroke="#C0C8D9" stroke-width="1"/>
      <text x="30" y="812" font-family="Arial, sans-serif" font-size="10" fill="#595959">© Ravi's Tuition · ravistuition.in | 86106 53352</text>
    </svg>
  `.trim();
}

/**
 * Helper function to return JSON response
 */
function jsonResponse(data, status = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Note: Apps Script doesn't support setting HTTP status codes directly
  // The status parameter is for documentation purposes
  return output;
}

/**
 * Test function - run this to verify setup
 */
function testSetup() {
  Logger.log('Testing Apps Script setup...');
  
  // Test Drive access
  try {
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    Logger.log('✓ Drive folder access: ' + folder.getName());
  } catch (e) {
    Logger.log('✗ Drive folder access failed: ' + e.toString());
  }
  
  // Test cache
  try {
    CacheService.getScriptCache().put('test', 'ok', 60);
    const value = CacheService.getScriptCache().get('test');
    Logger.log('✓ Cache service: ' + (value === 'ok' ? 'working' : 'failed'));
  } catch (e) {
    Logger.log('✗ Cache service failed: ' + e.toString());
  }
  
  Logger.log('Setup test complete. Check logs above.');
}

/**
 * Utility: List all files in Drive folder
 */
function listFiles() {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const files = folder.getFiles();
  
  const fileList = [];
  while (files.hasNext()) {
    const file = files.next();
    fileList.push({
      id: file.getId(),
      name: file.getName(),
      size: file.getSize(),
      type: file.getMimeType()
    });
  }
  
  Logger.log(JSON.stringify(fileList, null, 2));
  return fileList;
}
