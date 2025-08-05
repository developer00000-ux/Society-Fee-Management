-- Create monthly_fee_structures table
CREATE TABLE IF NOT EXISTS public.monthly_fee_structures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    fee_types JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_fee_structures_active ON public.monthly_fee_structures(is_active);
CREATE INDEX IF NOT EXISTS idx_monthly_fee_structures_year_month ON public.monthly_fee_structures(year, month);

-- Enable RLS
ALTER TABLE public.monthly_fee_structures ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON public.monthly_fee_structures
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for block managers and admins" ON public.monthly_fee_structures
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_profiles.id = auth.uid() 
                AND user_profiles.role IN ('block_manager', 'colony_admin', 'super_admin')
            )
        )
    );

CREATE POLICY "Enable update for block managers and admins" ON public.monthly_fee_structures
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_profiles.id = auth.uid() 
                AND user_profiles.role IN ('block_manager', 'colony_admin', 'super_admin')
            )
        )
    );

CREATE POLICY "Enable delete for block managers and admins" ON public.monthly_fee_structures
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_profiles.id = auth.uid() 
                AND user_profiles.role IN ('block_manager', 'colony_admin', 'super_admin')
            )
        )
    );

-- Insert sample data
INSERT INTO public.monthly_fee_structures (month, year, fee_types, is_active) VALUES
('January', 2024, '[
    {"fee_type_id": "1", "fee_type_name": "Maintenance", "amount": 500, "is_required": true, "description": "Monthly maintenance fee"},
    {"fee_type_id": "2", "fee_type_name": "Water", "amount": 200, "is_required": true, "description": "Water supply fee"},
    {"fee_type_id": "3", "fee_type_name": "Electricity", "amount": 300, "is_required": false, "description": "Common area electricity"}
]', true),
('February', 2024, '[
    {"fee_type_id": "1", "fee_type_name": "Maintenance", "amount": 500, "is_required": true, "description": "Monthly maintenance fee"},
    {"fee_type_id": "2", "fee_type_name": "Water", "amount": 250, "is_required": true, "description": "Water supply fee"},
    {"fee_type_id": "3", "fee_type_name": "Electricity", "amount": 350, "is_required": false, "description": "Common area electricity"}
]', true),
('March', 2024, '[
    {"fee_type_id": "1", "fee_type_name": "Maintenance", "amount": 500, "is_required": true, "description": "Monthly maintenance fee"},
    {"fee_type_id": "2", "fee_type_name": "Water", "amount": 200, "is_required": true, "description": "Water supply fee"},
    {"fee_type_id": "3", "fee_type_name": "Electricity", "amount": 300, "is_required": false, "description": "Common area electricity"}
]', true)
ON CONFLICT DO NOTHING; 