/**
 * NFT Utilities
 * Helper functions for NFT operations
 */

/**
 * Format NFT metadata for display
 */
export function formatNftMetadata(formData) {
  return {
    name: `SPP Passport - ${formData.serialNumber || 'SPP001'}`,
    symbol: 'SPP',
    description: `Smart Product Passport for ${formData.deviceModel || 'Device'}`,
    image: 'https://arweave.net/mock-image',
    attributes: [
      { trait_type: 'Serial Number', value: formData.serialNumber || 'SPP001' },
      { trait_type: 'Device Model', value: formData.deviceModel || 'Device' },
      { trait_type: 'Production Date', value: formData.productionDate || 'Unknown' },
      { trait_type: 'Warranty Period', value: formData.warrantyPeriod || 'Unknown' },
      { trait_type: 'Country of Origin', value: formData.countryOfOrigin || 'Unknown' },
      { trait_type: 'Manufacturer ID', value: formData.manufacturerId || 'Unknown' },
    ],
  };
}

/**
 * Create Phantom wallet signer
 */
export function createPhantomSigner(wallet) {
  return {
    publicKey: wallet.publicKey,
    signMessage: async (message) => {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await wallet.signMessage(encodedMessage, 'utf8');
      return signedMessage.signature;
    },
    signTransaction: async (transaction) => {
      const signedTx = await wallet.signTransaction(transaction);
      return signedTx;
    },
    signAllTransactions: async (transactions) => {
      const signedTxs = await wallet.signAllTransactions(transactions);
      return signedTxs;
    },
  };
}

/**
 * Check if wallet has sufficient balance
 */
export async function checkWalletBalance(umi, walletPublicKey, minBalance = 0.01) {
  const balance = await umi.rpc.getBalance(walletPublicKey);
  const balanceInSol = Number(balance.basisPoints) / 1e9;
  console.log('Wallet balance:', balanceInSol, 'SOL');
  
  if (balanceInSol < minBalance) {
    throw new Error(`Insufficient balance. Please request an airdrop first. Current: ${balanceInSol} SOL, Required: ${minBalance} SOL`);
  }
  
  return balanceInSol;
}

/**
 * Generate Solana Explorer URL for NFT
 */
export function getSolanaExplorerUrl(mintAddress, cluster = 'devnet') {
  return `https://explorer.solana.com/address/${mintAddress}?cluster=${cluster}`;
}

/**
 * Generate Solscan URL for NFT
 */
export function getSolscanUrl(mintAddress, cluster = 'devnet') {
  return `https://solscan.io/token/${mintAddress}?cluster=${cluster}`;
} 