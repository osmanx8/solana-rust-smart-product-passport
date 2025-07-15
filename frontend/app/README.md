# SPP Frontend (React + Vite)

This is the frontend for the Smart Product Passport project.

## Features
- NFT minting on Solana devnet
- Metadata upload to IPFS (Web3.Storage) for devnet
- Phantom wallet integration
- Modern React + Tailwind UI

## Getting Started

### 1. Install dependencies
```sh
npm install
```

### 2. Configure environment variables
Create a file named `.env.local` in this directory (`frontend/app/`).

Add your [Web3.Storage](https://web3.storage) API token (do **not** commit this file to git!):
```
VITE_WEB3STORAGE_TOKEN=your_web3_storage_token_here
```
- You can get a free token at https://web3.storage
- This token is required for uploading NFT metadata to IPFS on devnet.

### 3. Start the development server
```sh
npm run dev
```

The app will be available at http://localhost:5173 (or the port shown in your terminal).

## Security
- **Never commit your `.env.local` file or API keys to git!**
- `.env.local` is already in `.gitignore` by default.

## Network
- By default, the app works with Solana devnet and uploads metadata to IPFS for NFT minting.
- For mainnet-beta, you can use Bundlr/Arweave (see code comments for details).

## Useful Scripts
- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run lint` — run linter

## License
MIT 