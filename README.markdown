# Smart Product Passport

A decentralized application on Solana for creating and managing NFT-based product passports.

## Structure

- `/anchor`: Smart contract code (Anchor framework).
- `/frontend`: React-based frontend.
- `/config`: Configuration files.

## Setup

1. **Smart Contract**:
   - Navigate to `/anchor`.
   - Run `anchor build` and `anchor deploy`.
   - Update `PROGRAM_ID` in `/config/.env` with the deployed program ID.
   - Run `anchor test` to verify functionality.

2. **Frontend**:
   - Navigate to `/frontend`.
   - Run `npm install`.
   - Update `/config/.env` with your `ADMIN_PUBLIC_KEY` and `INFURA_IPFS_KEY`.
   - Run `npm start` to launch the app.

3. **Environment**:
   - Ensure you have a Solana wallet (e.g., Phantom) with Devnet SOL.
   - Replace placeholder values in `/config/program_config.json`.

## Usage

- **Admin**: Add manufacturers via the Admin Panel.
- **Manufacturer**: Create product passports and generate QR codes.
- **User**: Scan QR codes to mint NFT passports.