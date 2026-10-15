const fs = require('fs');
const path = require('path');

// Read the catalogue
const cataloguePath = path.join(__dirname, 'src/data/catalogue.json');
const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));

// Drive file IDs mapping
const driveFileIds = {
  '10-maths-english-quarterly-2025': '1HJ1fkOhmoPnVEHTPe1jxdkMax2IGi1ha',
  '10-maths-english-halfyearly-2025': '16RXooUIStRWomJFk80G_pg0o2ecHDd3q',
  '10-maths-english-annual-2025': '1tBGNiAiKWQehaJ5UzhNCFBKuL2H-RGDo',
  '10-science-english-quarterly-2025': '1mnJBnGURJYEIPNYPxqO7853w6PJRJbmi',
  '10-science-english-halfyearly-2025': '1IP0SeofFHmMgyzET2IxLmuY-Ywh3cW9F',
  '10-science-english-annual-2025': '19qgaDRhXt6XiUjH3aia2LOeDOHjLRObN',
  '10-english-english-quarterly-2025': '1y6QuEKsMQfdfw6L21LyDfPEfxNOVt0R8',
  '10-english-english-halfyearly-2025': '1_-PTQx3QUbWZU1UyDHF0YC4HwGLcQvbX',
  '10-english-english-annual-2025': '1tffTItBoniHHdbV6AIzNIpMVIiqawzPG',
  '10-social-science-english-quarterly-2025': '1LqRyq_MpzOO4X9UQHIXLoM78FL1EUK3P',
  '10-social-science-english-halfyearly-2025': '1UIzxZC5v7N1P7e8sZSJH9JBLQx3h9GLI',
  '10-social-science-english-annual-2025': '1nbaXC_2GlIue2H2uJLO70w9lZgqrqMgH',
  '10-maths-english-quarterly-2024': '1mpwUs2yFo7zgGgJT9e4XA9XPUiwNPB2z',
  '10-maths-english-halfyearly-2024': '1nACogZ6A3llzbjwgN2w2JsIWVTL-GmUM',
  '10-maths-english-annual-2024': '1L-MDjBDCxn0herGDm_erY9tgcjFQ9nG9',
  '10-science-english-quarterly-2024': '1A3AIjTB3dQT9Ptck-9MuR_2n_JXnCej5',
  '10-science-english-halfyearly-2024': '1ojlkyVF5YEjO7k5ca4j5jBdONNISE90x',
  '10-science-english-annual-2024': '1Fo0yQUfBoTHAW-Fz_1BNYP1mkGh-hdT3',
  '10-english-english-quarterly-2024': '1-9x0I5XdKHCcwYt1LA9MNV4GzTwuEUSn',
  '10-english-english-halfyearly-2024': '1OJDOrKyrc_fsWCofkqdjosdv6a2qODoq',
  '10-english-english-annual-2024': '1E0MBYy__GG3OqDzhy_WKNZQXn_3putzO',
  '10-social-science-english-quarterly-2024': '1Z7htX-Saj2D4qZO22IEi3APoPa1pAJ-s',
  '10-social-science-english-halfyearly-2024': '19ZmSFBwiIUiwZ6TblHEYHSaQXjAtj-t6',
  '10-social-science-english-annual-2024': '189PJhqhdibHqi2GMKm7gf1OU8lYa1CTR',
  '10-maths-english-quarterly-2023': '1UYmtnerGNZqJmpXoSu42yke-rv4j6uUr',
  '10-maths-english-halfyearly-2023': '1Y3hLmwDsn2_UB04ihGkR7VtJsWVjZJPf',
  '10-maths-english-annual-2023': '1d_2w4MRCqriYCgb1QzLwkfq9eTiGdIiJ',
  '10-science-english-quarterly-2023': '1DIMaqEjoZWWWwTn1lBbOedImnYME8Y6n',
  '10-science-english-halfyearly-2023': '1EHWGK3ORuQ4Fx_5G2W1K4CU_-2Ps2o28',
  '10-science-english-annual-2023': '1UEFI0MhRXuAUey_CHB15L9a2OTWY1k-S',
  '10-english-english-quarterly-2023': '1eIZlkklg72mh5KNYhCzHra_DcghQlJtm',
  '10-english-english-halfyearly-2023': '1Re0YvWlq-UMojeF9fl2E7p2ITvWANW_d',
  '10-english-english-annual-2023': '1Sy52HFdSDHuZkxZSywjh7hl2N69Lnqze',
  '10-social-science-english-quarterly-2023': '1xkTna6LIhYmx37nFlqnRXURjJuA3ns7P',
  '10-social-science-english-halfyearly-2023': '1fjiFpMrOiUqQqIN5f2ORPNId42V3i8BA',
  '10-social-science-english-annual-2023': '1JBheMWpHF2BeMJumaiEPS7dpfDGyYRCx',
  '10-maths-english-quarterly-2022': '1ouxfsruCU3327PIWJMFbYRYtSEK-3jiH',
  '10-maths-english-halfyearly-2022': '1fns_g97gvy4-likjbZykAvLE_YC7tR0n',
  '10-science-english-quarterly-2022': '1Kf4JmwoD6MOFS5q-xwPHzD3wJjyvP8ev',
  '10-science-english-halfyearly-2022': '17vv9tpI7J6Uf2o3k3qs6mEUlf4HMMygN',
  '10-english-english-quarterly-2022': '1Rj8sayZ1KIeFlAi9Bm81yNp2FaNrmyFw',
  '10-english-english-halfyearly-2022': '1nplKppFcIdO40FRz1FTnVThfmpWcZpiY',
  '10-social-science-english-quarterly-2022': '1-HR-xnq1CZ8kMPLLZDa_Cwk_C_l542aj',
  '10-social-science-english-halfyearly-2022': '1hsesiKBhg2gRVTAxU2DzIJv3eSOon7cx'
};

// Process each record
const updated = catalogue.map(record => {
  const updated = { ...record };

  // A) Set status to "draft" for Tamil English-medium records
  if (record.id.startsWith('10-tamil-english-')) {
    updated.status = 'draft';
  }

  // B) Set premium pricing for ImpQ and Model papers (except free science)
  if (record.id !== '10-science-english-quarterlyimpq-2026-free') {
    if (record.resource_type === 'ImportantQuestions' || record.resource_type === 'ModelQuestionPaper') {
      updated.price_tier = 'premium';
      updated.price_inr = 49;
      if (!updated.tags.includes('topper')) {
        updated.tags = [...updated.tags, 'topper'];
      }
    }
  }

  // C) Add drive_file_id for specified PYQ records
  if (driveFileIds[record.id] && !record.drive_file_id) {
    updated.drive_file_id = driveFileIds[record.id];
  }

  return updated;
});

// Write back
fs.writeFileSync(cataloguePath, JSON.stringify(updated, null, 2) + '\n');

console.log('Catalogue updated successfully');
console.log(`Total records: ${updated.length}`);
console.log(`Draft records: ${updated.filter(r => r.status === 'draft').length}`);
console.log(`Premium records: ${updated.filter(r => r.price_tier === 'premium').length}`);
console.log(`Records with drive_file_id: ${updated.filter(r => r.drive_file_id).length}`);
