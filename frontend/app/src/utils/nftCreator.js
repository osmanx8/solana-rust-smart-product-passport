/**
 * NFT Creator Utility
 * Handles NFT creation using Metaplex UMI framework
 */

import { formatNftMetadata, createPhantomSigner, checkWalletBalance } from './nftUtils';

export async function mintPassportWithMetaplex(wallet, file, formData) {
  try {
    console.log('Starting real NFT creation process with UMI...');
    
    // Import UMI and related modules
    const { createUmi } = await import('@metaplex-foundation/umi-bundle-defaults');
    const { createNft } = await import('@metaplex-foundation/mpl-token-metadata');
    const { percentAmount } = await import('@metaplex-foundation/umi');
    
    // Create UMI instance
    const umi = createUmi('https://api.devnet.solana.com');
    
    // Check wallet balance
    await checkWalletBalance(umi, wallet.publicKey);
    
    // Create Phantom signer and set as identity
    const phantomSigner = createPhantomSigner(wallet);
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