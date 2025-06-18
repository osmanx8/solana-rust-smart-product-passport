# Environment Variables Setup Guide

## 🎯 Where to Set Environment Variables

### 1. **Vercel Dashboard (Production/Deployment)**
**Location**: [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

**Steps**:
1. Go to Vercel Dashboard
2. Select your project `smart-product-passport`
3. Click **Settings** tab
4. Click **Environment Variables**
5. Add each variable:

```
VITE_API_URL=https://your-backend-url.vercel.app
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=11111111111111111111111111111111
NODE_ENV=production
VITE_ENABLE_QR_CODE=true
VITE_ENABLE_3D_VIEWER=true
```

### 2. **Local Development (.env.local)**
**Location**: `frontend/app/.env.local` (create this file)

**Content**:
```env
# Local Development Environment Variables
VITE_API_URL=http://localhost:3000
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=11111111111111111111111111111111
VITE_ENABLE_QR_CODE=true
VITE_ENABLE_3D_VIEWER=true
NODE_ENV=development
```

## 🔧 How It Works

### **Vite Environment Variables**
- All variables must start with `VITE_` to be accessible in React code
- Variables are embedded during build time
- Available in code via `import.meta.env.VITE_VARIABLE_NAME`

### **Usage in React Code**
```javascript
// Access environment variables
const apiUrl = import.meta.env.VITE_API_URL;
const solanaNetwork = import.meta.env.VITE_SOLANA_NETWORK;

// Example usage
console.log('API URL:', apiUrl);
console.log('Solana Network:', solanaNetwork);
```

### **Environment Priority**
1. **Production**: Vercel Dashboard variables
2. **Development**: `.env.local` file
3. **Fallback**: Default values in code

## 📁 File Structure
```
frontend/app/
├── .env.local          # Local development (ignored by git)
├── env.example         # Example variables (committed to git)
├── src/
│   ├── components/
│   │   ├── CreateNFTPage.jsx
│   │   └── ScanPage.jsx
│   └── App.jsx
└── package.json
```

## 🚀 Deployment Flow

### **Local Development**:
1. Create `frontend/app/.env.local`
2. Add local variables
3. Run `npm run dev`

### **Production Deployment**:
1. Set variables in Vercel Dashboard
2. Push code to GitHub
3. Vercel automatically deploys with production variables

## ⚠️ Important Notes

### **Security**:
- Never commit `.env.local` to git
- Use different values for development vs production
- Keep sensitive data in Vercel Dashboard only

### **Variable Naming**:
- Must start with `VITE_` for client-side access
- Use UPPERCASE with underscores
- No spaces around `=` sign

### **After Changes**:
- **Local**: Restart development server
- **Production**: Redeploy in Vercel Dashboard

## 🔍 Troubleshooting

### **Variable Not Found**:
```javascript
// Check if variable exists
if (import.meta.env.VITE_API_URL) {
  console.log('API URL found:', import.meta.env.VITE_API_URL);
} else {
  console.log('API URL not found');
}
```

### **Build Errors**:
- Ensure all required variables are set
- Check variable names start with `VITE_`
- Verify no typos in variable names

### **Deployment Issues**:
- Check Vercel Dashboard for variable errors
- Ensure variables are set for correct environment (Production/Preview)
- Redeploy after adding new variables 