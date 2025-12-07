
-- Create equipment table
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    item_type TEXT NOT NULL,
    cost JSONB NOT NULL, -- Storing as JSONB for amount and currency
    attack_type TEXT,
    range TEXT,
    damage TEXT,
    armor TEXT,
    properties TEXT[], -- Storing as an array of text
    slot INTEGER NOT NULL DEFAULT 1,
    quantity TEXT, -- For items like "1-20" or "1 bag"
    uuid TEXT UNIQUE -- To link back to starter-data if needed
);

-- Enable Row-Level Security
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Policy for public access (read-only for authenticated and anonymous users)
CREATE POLICY "Enable read access for all users" ON equipment
FOR SELECT USING (TRUE);

-- Indexes for efficient querying
CREATE INDEX idx_equipment_name ON equipment USING GIN (to_tsvector('simple', name));
-- GIN index for properties array for efficient searching within the array
CREATE INDEX idx_equipment_properties_gin ON equipment USING GIN (properties);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON equipment
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
