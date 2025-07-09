/**
 * Collection Creator Utility
 * Створення колекцій NFT через Metaplex JS SDK
 */

export async function createCollectionWithMetaplex(wallet, collectionData) {
  try {
    console.log('Starting collection creation process with Metaplex JS SDK...');
    
    // Import Metaplex JS SDK
    const { Metaplex } = await import('@metaplex-foundation/js');
    const { Connection, clusterApiUrl } = await import('@solana/web3.js');
    
    // Create connection to Solana devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    
    // Create Metaplex instance without bundlrStorage to avoid Node.js dependencies
    const metaplex = new Metaplex(connection);
    
    // Set Phantom wallet as identity
    metaplex.identity().setDriver({
      publicKey: wallet.publicKey,
      signMessage: async (message) => {
        const { signature } = await wallet.signMessage(message, 'utf8');
        return signature;
      },
      signTransaction: async (transaction) => {
        const signedTx = await wallet.signTransaction(transaction);
        return signedTx;
      },
      signAllTransactions: async (transactions) => {
        const signedTxs = await wallet.signAllTransactions(transactions);
        return signedTxs;
      },
    });

    // Create collection metadata
    const collectionMetadata = {
      name: collectionData.name,
      symbol: collectionData.name.toUpperCase().slice(0, 3),
      description: `Collection of products by ${collectionData.name}`,
      image: collectionData.image || 'https://arweave.net/collection-placeholder',
      attributes: [
        { trait_type: 'Collection Name', value: collectionData.name },
        { trait_type: 'Type', value: 'Collection' }
      ],
      properties: {
        files: [
          {
            type: 'image/png',
            uri: collectionData.image || 'https://arweave.net/collection-placeholder'
          }
        ],
        category: 'image'
      }
    };

    // For now, use a mock metadata URI to avoid bundlrStorage issues
    const metadataUri = 'https://arweave.net/collection-metadata-placeholder';
    console.log('Collection metadata URI (mock):', metadataUri);

    // Create collection NFT
    const { nft: collectionNft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: collectionMetadata.name,
      symbol: collectionMetadata.symbol,
      sellerFeeBasisPoints: 0,
      isCollection: true, // Mark as collection
    });
    
    console.log('Collection created! Collection address:', collectionNft.address.toString());
    return collectionNft.address.toString();
  } catch (error) {
    console.error('Error in createCollectionWithMetaplex:', error);
    throw error;
  }
}

/**
 * Get or create collection for a given category and name
 */
export async function getOrCreateCollection(wallet, collectionData) {
  try {
    // For now, we'll create a new collection each time
    // In a real application, you might want to store collection addresses
    // and reuse them for the same category/name combination
    const collectionAddress = await createCollectionWithMetaplex(wallet, collectionData);
    return collectionAddress;
  } catch (error) {
    console.error('Error getting or creating collection:', error);
    throw error;
  }
} 