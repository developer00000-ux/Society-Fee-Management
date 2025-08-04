-- WARNING: This will permanently delete the specified users and related data
-- Make sure to backup your data before running this query

-- User IDs to delete
-- 'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e'  -- blockmanager@example.com
-- 'b7619d9c-06ea-4340-9df5-839639765212'  -- colonyadmin@example.com
-- '23b05656-eaa7-42d2-88be-9858d4e865b9'  -- resident1@example.com

-- Step 1: Check all tables that reference these users
-- Check colonies
SELECT 'colonies' as table_name, id, name, admin_id as user_id
FROM colonies 
WHERE admin_id IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
)
UNION ALL
-- Check buildings
SELECT 'buildings' as table_name, id, name, manager_id as user_id
FROM buildings 
WHERE manager_id IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
)
UNION ALL
-- Check flats (owner_id and tenant_id)
SELECT 'flats (owner)' as table_name, id, flat_number, owner_id as user_id
FROM flats 
WHERE owner_id IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
)
UNION ALL
SELECT 'flats (tenant)' as table_name, id, flat_number, tenant_id as user_id
FROM flats 
WHERE tenant_id IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
)
UNION ALL
-- Check bills
SELECT 'bills' as table_name, id, description, created_by as user_id
FROM bills 
WHERE created_by IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
)
UNION ALL
-- Check maintenance_requests
SELECT 'maintenance_requests' as table_name, id, title, created_by as user_id
FROM maintenance_requests 
WHERE created_by IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
)
UNION ALL
SELECT 'maintenance_requests (resolved)' as table_name, id, title, resolved_by as user_id
FROM maintenance_requests 
WHERE resolved_by IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
)
UNION ALL
-- Check announcements
SELECT 'announcements' as table_name, id, title, created_by as user_id
FROM announcements 
WHERE created_by IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

-- Step 2: Handle foreign key constraints by setting references to NULL
-- Update colonies
UPDATE colonies 
SET admin_id = NULL 
WHERE admin_id IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

-- Update buildings
UPDATE buildings 
SET manager_id = NULL 
WHERE manager_id IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

-- Update flats
UPDATE flats 
SET owner_id = NULL 
WHERE owner_id IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

UPDATE flats 
SET tenant_id = NULL 
WHERE tenant_id IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

-- Update bills
UPDATE bills 
SET created_by = NULL 
WHERE created_by IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

-- Update maintenance_requests
UPDATE maintenance_requests 
SET created_by = NULL 
WHERE created_by IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

UPDATE maintenance_requests 
SET resolved_by = NULL 
WHERE resolved_by IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

-- Update announcements
UPDATE announcements 
SET created_by = NULL 
WHERE created_by IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

-- Step 3: Delete user profiles
DELETE FROM user_profiles 
WHERE id IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

-- Step 4: Delete users from auth.users
DELETE FROM auth.users 
WHERE id IN (
    'fe9c74dd-a5ea-4ff9-9d05-682dbb605c8e',
    'b7619d9c-06ea-4340-9df5-839639765212',
    '23b05656-eaa7-42d2-88be-9858d4e865b9'
);

-- Step 5: Verify deletion
SELECT 'Verification - Remaining user_profiles:' as info;
SELECT id, first_name, last_name, role FROM user_profiles;

SELECT 'Verification - Remaining auth.users:' as info;
SELECT id, email FROM auth.users WHERE email LIKE '%@example.com'; 