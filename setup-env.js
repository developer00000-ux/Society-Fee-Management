const fs = require('fs')
const path = require('path')

console.log('🔧 Supabase Environment Setup')
console.log('=============================\n')

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!')
  console.log('Please check if your Supabase credentials are correct.\n')
} else {
  console.log('📝 Creating .env.local template...')
  
  const envTemplate = `# Supabase Configuration
# Replace these placeholder values with your actual Supabase credentials
# You can find these in your Supabase dashboard under Settings > API

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Instructions:
# 1. Go to https://supabase.com and create a new project
# 2. In your project dashboard, go to Settings > API
# 3. Copy the Project URL and replace the NEXT_PUBLIC_SUPABASE_URL value
# 4. Copy the anon public key and replace the NEXT_PUBLIC_SUPABASE_ANON_KEY value
# 5. Copy the service_role key and replace the NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY value
# 6. Save the file and restart your development server
`

  fs.writeFileSync(envPath, envTemplate)
  console.log('✅ .env.local template created!')
  console.log('📋 Please follow the instructions in the file to add your Supabase credentials.\n')
}

console.log('📚 Next Steps:')
console.log('1. Create a Supabase project at https://supabase.com')
console.log('2. Get your credentials from Settings > API')
console.log('3. Update the values in .env.local')
console.log('4. Run the database schema from supabase/schema.sql')
console.log('5. Restart your development server')
console.log('6. Go to /login and click "Setup Demo Users"')
console.log('\n📖 For detailed instructions, see ENVIRONMENT_SETUP.md') 