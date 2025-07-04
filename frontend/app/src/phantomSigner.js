import { publicKey, keypairIdentity } from '@metaplex-foundation/umi';

export function createPhantomSigner(windowSolana) {
  // Create a mock keypair that delegates signing to Phantom
  const mockKeypair = {
    publicKey: publicKey(windowSolana.publicKey.toString()),
    
    // This is the key method - UMI will call this to sign transactions
    async signTransaction(tx) {
      try {
        // Convert UMI transaction to a format Phantom can sign
        // We need to get the transaction bytes and sign them with Phantom
        const serializedTx = tx.serializedMessage;
        
        // Sign with Phantom
        const signedTx = await windowSolana.signTransaction(serializedTx);
        
        return signedTx;
      } catch (error) {
        console.error('Error signing transaction with Phantom:', error);
        throw error;
      }
    },
    
    async signAllTransactions(txs) {
      try {
        const serializedTxs = txs.map(tx => tx.serializedMessage);
        const signedTxs = await windowSolana.signAllTransactions(serializedTxs);
        return signedTxs;
      } catch (error) {
        console.error('Error signing transactions with Phantom:', error);
        throw error;
      }
    },
    
    async signMessage(message) {
      try {
        const { signature } = await windowSolana.signMessage(message, 'utf8');
        return signature;
      } catch (error) {
        console.error('Error signing message with Phantom:', error);
        throw error;
      }
    }
  };
  
  return mockKeypair;
} 