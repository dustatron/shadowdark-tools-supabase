-- Add image_url column to equipment (official) table
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to user_equipment table with length constraint
ALTER TABLE user_equipment
ADD COLUMN IF NOT EXISTS image_url TEXT
CONSTRAINT user_equipment_image_url_length CHECK (image_url IS NULL OR length(image_url) <= 500);

-- Add comment for documentation
COMMENT ON COLUMN user_equipment.image_url IS 'Cloudinary URL or default icon public_id for equipment image';
