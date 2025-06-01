import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const DEVNET_RPC = 'https://api.devnet.solana.com';

export const requestAirdrop = async (walletAddress) => {
  try {
    const connection = new Connection(DEVNET_RPC, 'confirmed');
    const publicKey = new PublicKey(walletAddress);
    
    // Перевіряємо баланс перед дропом
    const balance = await connection.getBalance(publicKey);
    console.log('Current balance:', balance / LAMPORTS_PER_SOL, 'SOL');

    // Запитуємо дроп
    const signature = await connection.requestAirdrop(
      publicKey,
      2 * LAMPORTS_PER_SOL // 2 SOL
    );

    // Чекаємо підтвердження транзакції
    await connection.confirmTransaction(signature);

    // Перевіряємо новий баланс
    const newBalance = await connection.getBalance(publicKey);
    console.log('New balance:', newBalance / LAMPORTS_PER_SOL, 'SOL');

    return {
      success: true,
      signature,
      oldBalance: balance / LAMPORTS_PER_SOL,
      newBalance: newBalance / LAMPORTS_PER_SOL
    };
  } catch (error) {
    console.error('Airdrop error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 