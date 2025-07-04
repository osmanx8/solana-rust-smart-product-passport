/**
 * NFT Creator Utility
 * Handles NFT creation using Metaplex UMI framework
 */

import { formatNftMetadata, checkWalletBalance } from './nftUtils';

export async function mintPassportWithMetaplex(wallet, file, formData) {
  try {
    console.log('Starting real NFT creation process with UMI...');
    
    // Import UMI and related modules
    const { createUmi } = await import('@metaplex-foundation/umi-bundle-defaults');
    const { createNft } = await import('@metaplex-foundation/mpl-token-metadata');
    const { percentAmount, publicKey } = await import('@metaplex-foundation/umi');
    
    // Create UMI instance with default bundle (includes all necessary plugins)
    const umi = createUmi('https://api.devnet.solana.com');
    
    // Check wallet balance
    await checkWalletBalance(umi, publicKey(wallet.publicKey.toString()));
    
    // Create Phantom signer
    const phantomSigner = {
      publicKey: publicKey(wallet.publicKey.toString()),
      
      async signTransaction(tx) {
        try {
          // Convert UMI transaction to a format Phantom can sign
          const serializedTx = tx.serializedMessage;
          
          // Sign with Phantom
          const signedTx = await wallet.signTransaction(serializedTx);
          return signedTx;
        } catch (error) {
          console.error('Error signing transaction with Phantom:', error);
          throw error;
        }
      },
      
      async signAllTransactions(txs) {
        try {
          const serializedTxs = txs.map(tx => tx.serializedMessage);
          const signedTxs = await wallet.signAllTransactions(serializedTxs);
          return signedTxs;
        } catch (error) {
          console.error('Error signing transactions with Phantom:', error);
          throw error;
        }
      },
      
      async signMessage(message) {
        try {
          const { signature } = await wallet.signMessage(message, 'utf8');
          return signature;
        } catch (error) {
          console.error('Error signing message with Phantom:', error);
          throw error;
        }
      }
    };
    
    // Set the Phantom signer as the UMI identity
    umi.use({ identity: phantomSigner });
    
    // Create metadata
    const metadata = formatNftMetadata(formData);
    
    // Use mock URI for now (we'll add real upload later)
    const uri = 'https://arweave.net/mock-metadata-uri';
    console.log('Using mock metadata URI:', uri);
    
    // Create NFT using UMI
    const { signature, result } = await createNft(umi, {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: uri,
      sellerFeeBasisPoints: percentAmount(0), // No royalties
      updateAuthority: umi.identity.publicKey,
    }).sendAndConfirm(umi, { 
      send: { commitment: 'confirmed' } 
    });
    
    console.log('NFT created successfully!');
    console.log('Mint address:', result.mint);
    console.log('Transaction signature:', signature);
    console.log('Metadata URI:', uri);
    
    return result.mint;
  } catch (error) {
    console.error('Error in mintPassportWithMetaplex:', error);
    throw error;
  }
} 