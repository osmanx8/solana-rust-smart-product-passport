/**
 * NFT Creator Utility
 * Створення NFT через Rust Backend API з підписом транзакцій в браузері
 */

import Irys from '@irys/sdk';
import { Keypair, PublicKey } from '@solana/web3.js';

const IRYS_NODE = 'https://node1.irys.xyz'; // або ваш вузол
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

// Конвертація файлу у Buffer
export async function fileToBuffer(file) {
  return new Uint8Array(await file.arrayBuffer());
}

// Підпис Solana-транзакції для Irys
async function getSolanaSigner(wallet) {
  return {
    publicKey: new PublicKey(wallet.publicKey),
    signMessage: async (message) => {
      const signed = await wallet.signMessage(message, 'utf8');
      return signed;
    }
  };
}

// Завантаження зображення у Irys
export async function uploadImageToIrys(wallet, file) {
  const signer = await getSolanaSigner(wallet);
  const irys = new Irys({
    url: IRYS_NODE,
    token: 'solana',
    wallet: signer,
  });

  const buffer = await fileToBuffer(file);
  const tx = await irys.upload(buffer, {
    tags: [{ name: 'Content-Type', value: file.type }]
  });
  return `https://arweave.net/${tx.id}`;
}

// Завантаження метаданих у Irys
export async function uploadMetadataToIrys(wallet, metadata) {
  const signer = await getSolanaSigner(wallet);
  const irys = new Irys({
    url: IRYS_NODE,
    token: 'solana',
    wallet: signer,
  });

  const data = JSON.stringify(metadata);
  const tx = await irys.upload(data, {
    tags: [{ name: 'Content-Type', value: 'application/json' }]
  });
  return `https://arweave.net/${tx.id}`;
}

// Основна функція для створення NFT
export async function mintPassportWithIrys(wallet, file, formData, collectionMint) {
  if (!wallet || !wallet.publicKey) throw new Error('Wallet not connected');

  // 1. Завантажуємо зображення у Irys
  let imageUri = '';
  if (file) {
    imageUri = await uploadImageToIrys(wallet, file);
  }

  // 2. Формуємо метадані
  const metadata = {
    name: formData.deviceModel,
    symbol: '', // symbol генерується на бекенді
    description: `Smart Product Passport for ${formData.deviceModel}`,
    image: imageUri,
    attributes: [
      { trait_type: 'Serial Number', value: formData.serialNumber },
      { trait_type: 'Production Date', value: formData.productionDate },
      { trait_type: 'Warranty Period', value: formData.warrantyPeriod },
      { trait_type: 'Country of Origin', value: formData.countryOfOrigin },
      { trait_type: 'Manufacturer ID', value: formData.manufacturerId },
    ],
  };

  // 3. Завантажуємо метадані у Irys
  const metadataUri = await uploadMetadataToIrys(wallet, metadata);

  // 4. Відправляємо запит на бекенд для створення NFT
  const res = await fetch(`${BACKEND_URL}/api/create-nft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metadata_uri: metadataUri,
      name: formData.deviceModel,
      wallet_address: wallet.publicKey.toString(),
      collection_mint: collectionMint || null,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create NFT');
  }

  const data = await res.json();
  return data;
}

// Функція для отримання NFT по власнику
export async function fetchNftsByOwner(walletAddress) {
  try {
    console.log('Fetching NFTs for wallet:', walletAddress);
    
    const response = await fetch(`${BACKEND_URL}/api/get-nfts?wallet_address=${walletAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch NFTs: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched NFTs:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw error;
  }
}

// Функція для отримання колекцій по власнику
export async function fetchCollectionsByOwner(walletAddress) {
  try {
    console.log('Fetching collections for wallet:', walletAddress);
    
    const response = await fetch(`${BACKEND_URL}/api/get-collections?wallet_address=${walletAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch collections: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched collections:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
}

// Функція для завантаження зображення
export async function uploadImage(file) {
  try {
    console.log('Uploading image:', file.name);
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${BACKEND_URL}/api/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to upload image: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Image uploaded:', data);
    
    return data.image_uri;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Функція для перевірки статусу бекенду
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Backend health:', data);
    
    return data.status === 'healthy';
  } catch (error) {
    console.error('Backend health check error:', error);
    return false;
  }
}

// Функція для отримання комісії за створення NFT
export async function getNftCreationCost() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/get-nft-cost`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get NFT cost: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('NFT creation cost:', data);
    
    return data;
  } catch (error) {
    console.error('Error getting NFT cost:', error);
    throw error;
  }
}

// Функція для отримання комісії за створення колекції
export async function getCollectionCreationCost() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/get-collection-cost`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get collection cost: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Collection creation cost:', data);
    
    return data;
  } catch (error) {
    console.error('Error getting collection cost:', error);
    throw error;
  }
}

// Функція для отримання інформації про treasury
export async function getTreasuryInfo() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/treasury/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get treasury info: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Treasury info:', data);
    
    return data;
  } catch (error) {
    console.error('Error getting treasury info:', error);
    throw error;
  }
}

// Функція для виводу коштів з treasury
export async function withdrawFromTreasury(amount, recipient, ownerSignature) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/treasury/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        recipient: recipient,
        owner_signature: ownerSignature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to withdraw from treasury: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Treasury withdrawal:', data);
    
    return data;
  } catch (error) {
    console.error('Error withdrawing from treasury:', error);
    throw error;
  }
}

// Оновлена функція для створення NFT транзакції з fee transfer
export async function createNFTTransactionWithFee(metadataUri, name, symbol, feePayer) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/create-nft-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata_uri: metadataUri,
        name: name,
        symbol: symbol,
        fee_payer: feePayer,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create NFT transaction: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('NFT transaction with fee created:', data);
    
    return data;
  } catch (error) {
    console.error('Error creating NFT transaction with fee:', error);
    throw error;
  }
} 

export async function mintPassportWithMetaplex(wallet, file, formData, collectionImage) {
    // TODO: Реалізуйте логіку minтінгу через Metaplex/Irys
    // Поверніть signature, mintAddress або інші потрібні дані
    return { signature: null, mintAddress: null };
} 