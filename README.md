# Advancia PayLedger - Backend

Cloudflare Workers-based backend API for healthcare payment processing with AI integration.

## 🚀 Features

- **AI-Powered Processing**: Medical coding, fraud detection, compliance checks
- **Secure API**: HIPAA-compliant healthcare data handling
- **Microservices Architecture**: Modular service design
- **Real-time Processing**: Sub-200ms response times
- **Global CDN**: Edge computing via Cloudflare Workers

## 🛠️ Tech Stack

- **Runtime**: Cloudflare Workers
- **Language**: JavaScript/TypeScript
- **AI Integration**: Cloudflare Workers AI
- **Database**: Supabase/PostgreSQL
- **Deployment**: Wrangler CLI

## 📦 Services

### Core Services
- **AI Worker**: Medical coding and fraud detection
- **Auth Service**: User authentication and authorization
- **Payment Service**: Transaction processing
- **Audit Service**: Compliance logging
- **Notification Service**: Alert system

### AI Endpoints
- `/api/ai/chat` - General AI assistance
- `/api/ai/medical-coding` - Medical billing codes
- `/api/ai/fraud-detection` - Payment fraud detection
- `/api/ai/patient-support` - Patient help desk
- `/api/ai/compliance-check` - HIPAA compliance

## 🔧 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Deploy to production
npm run deploy
```

## 🚀 Deployment

### Prerequisites
- Cloudflare account
- Wrangler CLI configured
- Environment variables set

### Environment Variables
Create `.env` file:
```env
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
DATABASE_URL=your_supabase_url
JWT_SECRET=your_jwt_secret
```

### Deploy Commands
```bash
# Deploy to Workers.dev
wrangler deploy

# Deploy with custom domain
wrangler deploy --domain api.advanciapayledger.com
```

## 🏥 Healthcare Compliance

- **HIPAA Compliant**: All endpoints designed for PHI handling
- **Audit Logging**: Complete transaction audit trails
- **Data Encryption**: End-to-end encryption for sensitive data
- **Access Control**: Role-based permissions
- **PII Sanitization**: Automatic data sanitization

## 📊 Performance

- **Response Time**: <200ms average
- **Uptime**: 99.9% SLA
- **Scalability**: Auto-scaling edge workers
- **Global Reach**: 200+ edge locations

## 🔐 Security

- **Zero Trust Architecture**: Service-to-service authentication
- **Rate Limiting**: DDoS protection
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin requests

## 📄 License

Proprietary and confidential to Advancia PayLedger.
