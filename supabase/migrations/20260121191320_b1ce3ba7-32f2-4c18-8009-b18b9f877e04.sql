-- Set all categories as featured on homepage
UPDATE categories SET is_featured = true WHERE is_featured = false;
