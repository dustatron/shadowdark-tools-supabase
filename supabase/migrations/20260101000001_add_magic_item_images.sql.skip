-- Add image_url column to user_magic_items
-- This enables users to add images to their custom magic items

-- Add the image_url column
ALTER TABLE public.user_magic_items
ADD COLUMN image_url TEXT NULL;

-- Add constraint for URL length (if provided)
ALTER TABLE public.user_magic_items
ADD CONSTRAINT user_magic_item_image_url_length
CHECK (image_url IS NULL OR LENGTH(image_url) <= 500);

-- Add comment for documentation
COMMENT ON COLUMN public.user_magic_items.image_url IS 'Cloudinary URL or default icon public_id for item image';

-- Drop and recreate view with new column (column order matters in PostgreSQL views)
DROP VIEW IF EXISTS public.all_magic_items;

CREATE VIEW public.all_magic_items AS
SELECT
    id,
    name,
    slug,
    description,
    traits,
    'official'::text AS item_type,
    NULL::uuid AS user_id,
    NULL::text AS creator_name,
    NULL::text AS image_url,  -- Official items have no images
    true AS is_public,
    created_at,
    updated_at
FROM official_magic_items

UNION ALL

SELECT
    umi.id,
    umi.name,
    umi.slug,
    umi.description,
    umi.traits,
    'custom'::text AS item_type,
    umi.user_id,
    up.display_name AS creator_name,
    umi.image_url,  -- Include image_url for user items
    umi.is_public,
    umi.created_at,
    umi.updated_at
FROM user_magic_items umi
JOIN user_profiles up ON umi.user_id = up.id
WHERE umi.is_public = true;
