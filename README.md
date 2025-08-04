# Society Management System

A comprehensive multi-colony society management platform with advanced billing, user management, and administrative features.

## 🚀 Features

### Core Features
- **Multi-Role Authentication**: Super Admin, Colony Admin, Block Manager, and Resident roles
- **Smart Billing System**: Multi-level cost distribution with automated bill generation
- **Property Management**: Colonies, Buildings, Floors, and Flats hierarchy
- **Maintenance Requests**: Track and manage maintenance with cost distribution
- **Payment Processing**: Integrated payment gateways with receipt generation
- **Analytics & Reports**: Comprehensive financial and occupancy reports
- **Announcements**: Role-based communication system
- **Session Management**: Secure session tracking and management

### Technical Features
- **Next.js 14**: App Router with TypeScript
- **Supabase**: PostgreSQL database with Row Level Security (RLS)
- **Tailwind CSS**: Modern, responsive UI design
- **Role-Based Access Control**: Secure data access based on user roles
- **Real-time Updates**: Live data synchronization
- **Mobile Responsive**: Optimized for all devices

## 🏗️ System Architecture

```
Super Admin (Platform Owner)
├── Colony 1 Admin (Manages Colony 1)
│   ├── Building A Manager
│   │   ├── Floor 1 → Flats (101, 102, 103...)
│   │   ├── Floor 2 → Flats (201, 202, 203...)
│   │   └── Floor N...
│   ├── Building B Manager
│   └── Building C Manager
├── Colony 2 Admin (Manages Colony 2)
└── Colony N Admin...

Residents → Live in specific flats
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd society-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_FROM=noreply@yourdomain.com
RESEND_API_KEY=your-resend-api-key

# Payment Gateway Configuration (Optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### 4. Database Setup

#### Create Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your project URL and API keys from the project settings

#### Run Database Schema
1. Copy the contents of `supabase/schema.sql`
2. Go to your Supabase project SQL editor
3. Paste and execute the schema

#### Enable Row Level Security
The schema includes RLS policies, but ensure they're enabled:
```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colonies ENABLE ROW LEVEL SECURITY;
-- ... (other tables)
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 👥 User Roles & Access

### Super Admin
- **Access**: Full system access across all colonies
- **Features**: Colony management, user creation, analytics, billing control
- **Dashboard**: `/super-admin/dashboard`

### Colony Admin
- **Access**: Assigned colony only
- **Features**: Building management, resident management, financial reports
- **Dashboard**: `/colony-admin/dashboard`

### Block Manager
- **Access**: Assigned building only
- **Features**: Floor management, resident management, maintenance coordination
- **Dashboard**: `/block-manager/dashboard`

### Resident
- **Access**: Personal flat data only
- **Features**: Bill viewing, payments, maintenance requests, profile management
- **Dashboard**: `/resident/dashboard`

## 🧪 Demo Accounts

For testing purposes, you can use these demo accounts:

| Role | Email | Password | Access |
|------|-------|----------|---------|
| Super Admin | admin@society.com | admin123 | Full system |
| Colony Admin | colony@society.com | colony123 | Colony management |
| Block Manager | manager@society.com | manager123 | Building management |
| Resident | resident@society.com | resident123 | Personal dashboard |

## 📊 Billing System

### Multi-Level Cost Distribution
1. **Flat-level**: Individual rent, utilities, personal maintenance
2. **Floor-level**: Floor cleaning, common utilities (distributed among floor flats)
3. **Building-level**: Lift maintenance, security, building utilities (distributed among building flats)
4. **Colony-level**: Garden maintenance, common areas, administrative fees (distributed among all flats)

### Smart Billing Examples
- **Lift Breakdown**: Cost distributed only among floors that use the lift
- **Floor Water Leakage**: Only affected floor residents pay
- **Colony Garden Maintenance**: All colony residents pay equally

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Role-Based Authentication**: Route-level protection
- **Session Management**: Secure session tracking
- **Input Validation**: Server-side validation for all inputs
- **Audit Logging**: Track all sensitive operations

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 📁 Project Structure

```
society-management/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── api/                 # API routes
│   ├── components/          # Reusable components
│   └── globals.css         # Global styles
├── lib/
│   ├── auth.ts             # Authentication utilities
│   ├── supabase.ts         # Supabase client
│   └── contexts/           # React contexts
├── types/
│   └── database.ts         # TypeScript types
├── supabase/
│   └── schema.sql          # Database schema
└── middleware.ts           # Next.js middleware
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first CSS framework

## 📈 Business Model

### Revenue Streams
- **Subscription Plans**: Starter (₹2,000), Professional (₹5,000), Enterprise (₹10,000)
- **Payment Gateway Commission**: 1-2% of transaction value
- **Premium Features**: Advanced analytics, custom reports
- **Integration Services**: Accounting software, CRM systems

### Target Market
- Property management companies
- Housing societies
- Residential complexes
- Real estate developers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: support@societymanagement.com
- Documentation: [docs.societymanagement.com](https://docs.societymanagement.com)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Authentication system
- ✅ Role-based access control
- ✅ Basic dashboard structure
- ✅ Database schema

### Phase 2 (Next)
- 🔄 Advanced billing system
- 🔄 Payment gateway integration
- 🔄 Maintenance management
- 🔄 Analytics and reporting

### Phase 3 (Future)
- 📋 Mobile app development
- 📋 Advanced analytics
- 📋 AI-powered insights
- 📋 White-label solutions

---

**Built with ❤️ for modern society management**
