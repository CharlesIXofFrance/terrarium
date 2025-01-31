-- Fix the stored URLs to be just paths
UPDATE communities 
SET 
  logo_url = CASE 
    WHEN logo_url LIKE 'https://%' THEN 
      regexp_replace(logo_url, '^.*?community-assets/(.*?)\?.*$', '\1')
    ELSE logo_url 
  END,
  banner_url = CASE 
    WHEN banner_url LIKE 'https://%' THEN 
      regexp_replace(banner_url, '^.*?community-assets/(.*?)\?.*$', '\1')
    ELSE banner_url 
  END,
  favicon_url = CASE 
    WHEN favicon_url LIKE 'https://%' THEN 
      regexp_replace(favicon_url, '^.*?community-assets/(.*?)\?.*$', '\1')
    ELSE favicon_url 
  END
WHERE 
  logo_url IS NOT NULL OR 
  banner_url IS NOT NULL OR 
  favicon_url IS NOT NULL;
