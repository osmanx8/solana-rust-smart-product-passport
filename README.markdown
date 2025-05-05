# Smart Product Passport on Solana Devnet

**Smart Product Passport** is a blockchain-based solution built on Solana Devnet that creates a unique digital NFT passport for smart or electronic devices. Each NFT passport securely stores critical technical, legal, and service information, with structured metadata stored on-chain and large files linked off-chain via IPFS.

## 🚀 Features
- **NFT-based Digital Passport**: Each device is represented by a unique NFT on Solana, containing:
  - 📅 Production date
  - 🆔 Serial number
  - 🔧 Device model
  - 🛡️ Warranty period and conditions
  - 📍 Country of origin
  - 🧑‍💼 Manufacturer ID
  - 🔗 IPFS links to off-chain content
- **Off-chain Storage**: Large files (e.g., user manuals, drivers, license keys, instructional videos) are stored on IPFS, with CIDs embedded in NFT metadata.
- **Solana Devnet**: Built for testing on Solana's Devnet using Anchor and Metaplex.
- **Client-side Interaction**: A TypeScript script to mint NFTs and retrieve passport data.

## 🛠️ Project Structure
- **`programs/smart-passport/src/lib.rs`**: Rust-based Solana program (using Anchor) for minting and managing NFT passports.
- **`client/mint-passport.ts`**: TypeScript script for interacting with the program (minting NFTs and fetching data).
- **`Anchor.toml`**: Configuration for Anchor and Solana Devnet deployment.
- **`Cargo.toml`**: Rust dependencies for the Solana program.
- **`package.json`**: Node.js dependencies for the client script.

## 📋 Prerequisites
- **Rust**: Install Rust and Cargo (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`).
- **Solana CLI**: Install Solana CLI (`sh -c "$(curl -sSfL https://release.solana.com/v1.18.22/install)"`).
- **Anchor**: Install Anchor CLI (`cargo install --git https://github.com/coral-xyz/anchor avm --locked --force`).
- **Node.js**: Install Node.js (v16 or later) and Yarn (`npm install -g yarn`).
- **Solana Wallet**: A configured Solana wallet with Devnet SOL (use `solana airdrop 2` to fund it).
- **IPFS**: Access to an IPFS service (e.g., Pinata, Infura) for uploading off-chain files.

## ⚙️ Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd smart-product-passport
   ```

2. **Configure Solana CLI**:
   Set the cluster to Devnet:
   ```bash
   solana config set --url devnet
   ```

3. **Fund Your Wallet**:
   Request Devnet SOL:
   ```bash
   solana airdrop 2
   ```

4. **Install Dependencies**:
   - For the Solana program:
     ```bash
     cd programs/smart-passport
     cargo build
     ```
   - For the client script:
     ```bash
     cd client
     yarn install
     ```

5. **Build the Program**:
   ```bash
   anchor build
   ```

6. **Deploy to Devnet**:
   ```bash
   anchor deploy --provider.cluster devnet
   ```
   Note the program ID generated during deployment and update `PROGRAM_ID` in `client/mint-passport.ts` if necessary.

## 🚀 Usage
1. **Upload Off-chain Files to IPFS**:
   - Upload files (e.g., manuals, drivers) to an IPFS service like Pinata or Infura.
   - Note the IPFS CID (e.g., `QmExampleCID1234567890`) for use in the NFT metadata.

2. **Mint an NFT Passport**:
   - Edit `client/mint-passport.ts` to include your passport data (e.g., serial number, IPFS CID).
   - Run the client script:
     ```bash
     cd client
     yarn start
     ```
   - The script will mint an NFT and output its mint address and passport data.

3. **Verify Passport Data**:
   - The script fetches and displays the passport's on-chain metadata after minting.
   - Use the IPFS CID from the metadata to access off-chain files via an IPFS gateway (e.g., `https://ipfs.io/ipfs/<CID>`).

## 📖 Example
To create a passport for a device:
1. Upload a user manual to IPFS, get CID: `QmExampleCID1234567890`.
2. Update `client/mint-passport.ts` with:
   ```typescript
   const passportData = {
     serial_number: "SN123456789",
     production_date: "2025-05-01",
     device_model: "SmartDeviceX",
     warranty_period: "2 years",
     country_of_origin: "USA",
     manufacturer_id: "MANUF001",
     ipfs_cid: "QmExampleCID1234567890",
   };
   ```
3. Run `yarn start` to mint the NFT.
4. Check the output for the mint address and passport data.

## 🔐 Security Notes
- **Access Control**: The current implementation allows any wallet to mint passports. For production, add a whitelist of authorized manufacturers.
- **IPFS Pinning**: Ensure off-chain files are pinned (e.g., via Filecoin or Pinata) to prevent data loss.
- **Mainnet Deployment**: This is a Devnet implementation. For Mainnet, audit the code and update `Anchor.toml`.

## 🌐 Future Improvements
- Add manufacturer authentication and role-based access.
- Support batch minting for scalability.
- Integrate with a frontend for user-friendly interaction.
- Implement encrypted storage for sensitive data (e.g., license keys).

## 🤝 Contributing
Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## 📜 License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## 📬 Contact
For questions or support, open an issue or contact the maintainers.