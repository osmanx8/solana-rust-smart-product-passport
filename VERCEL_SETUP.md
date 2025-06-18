# Vercel Environment Variables Setup

## Required Environment Variables for Vercel

### 1. Go to Vercel Dashboard
- Open [Vercel Dashboard](https://vercel.com/dashboard)
- Select your project `smart-product-passport`

### 2. Environment Variables Configuration
Go to **Settings** → **Environment Variables** and add the following variables:

#### Required Variables:
```
VITE_API_URL=https://your-backend-url.vercel.app
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=11111111111111111111111111111111
NODE_ENV=production
```

#### Optional Variables:
```
VITE_ENABLE_QR_CODE=true
VITE_ENABLE_3D_VIEWER=true
VITE_ANALYTICS_ID=your_analytics_id
```

### 3. Environment Configuration

#### Production:
- Environment: `Production`
- All variables should be set

#### Preview (for Pull Requests):
- Environment: `Preview`
- Can use the same values

#### Development:
- Environment: `Development`
- Can use local values

### 4. Redeploy After Changes
After adding variables:
1. Go to **Deployments**
2. Find the latest deployment
3. Click **Redeploy**

### 5. Using Variables in Code
In your React code, use variables like this:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
const solanaNetwork = import.meta.env.VITE_SOLANA_NETWORK;
```

### 6. Local Development
Create a `.env.local` file in the `frontend/app/` folder:
```env
VITE_API_URL=http://localhost:3000
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=11111111111111111111111111111111
VITE_ENABLE_QR_CODE=true
VITE_ENABLE_3D_VIEWER=true
NODE_ENV=development
```

## Important Notes!
- All Vite variables must start with `VITE_`
- After changing variables, you need to redeploy
- Verify all variables are properly set before deployment
- Never commit sensitive files like `.env.local` to git 