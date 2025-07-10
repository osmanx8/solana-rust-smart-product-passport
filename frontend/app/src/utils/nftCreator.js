/**
 * NFT Creator Utility
 * Створення NFT через Rust Backend API з підписом транзакцій в браузері
 */

import { formatNftMetadata } from './nftUtils';
import { Transaction } from '@solana/web3.js';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

export async function mintPassportWithMetaplex(wallet, file, formData, collectionImage) {
  try {
    console.log('Starting NFT creation process with wallet signing...');
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const walletAddress = wallet.publicKey.toString();

    // 1. Конвертуємо файли в base64
    let imageData = null;
    let collectionImageData = null;

    if (file) {
      imageData = await fileToBase64(file);
    }

    if (collectionImage) {
      collectionImageData = await fileToBase64(collectionImage);
    }

    // 2. Створюємо колекцію (якщо вказана)
    let collectionAddress = null;
    if (formData.collectionName) {
      console.log('Creating collection transaction:', formData.collectionName);
      
      const collectionTransactionResponse = await fetch(`${BACKEND_URL}/api/create-collection-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.collectionName,
          symbol: formData.collectionName.substring(0, 3).toUpperCase(),
          description: `Collection for ${formData.collectionName}`,
          wallet_address: walletAddress,
          image_data: collectionImageData,
        }),
      });

      if (!collectionTransactionResponse.ok) {
        const errorData = await collectionTransactionResponse.json();
        throw new Error(`Failed to create collection transaction: ${errorData.error || collectionTransactionResponse.statusText}`);
      }

      const collectionTransactionData = await collectionTransactionResponse.json();
      
      if (!collectionTransactionData.success) {
        throw new Error(`Collection transaction creation failed: ${collectionTransactionData.error}`);
      }

      // 3. Підписуємо транзакцію колекції в гаманці
      console.log('Signing collection transaction...');
      const signedCollectionTransaction = await signTransaction(wallet, collectionTransactionData.transaction);
      
      // 4. Відправляємо підписану транзакцію
      const submitCollectionResponse = await fetch(`${BACKEND_URL}/api/submit-signed-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signed_transaction: signedCollectionTransaction,
          transaction_type: 'collection',
        }),
      });

      if (!submitCollectionResponse.ok) {
        const errorData = await submitCollectionResponse.json();
        throw new Error(`Failed to submit collection transaction: ${errorData.error || submitCollectionResponse.statusText}`);
      }

      const submitCollectionData = await submitCollectionResponse.json();
      console.log('Collection created successfully:', submitCollectionData);
    }

    // 5. Створюємо транзакцію для NFT
    console.log('Creating NFT transaction with data:', formData);
    
    const nftTransactionResponse = await fetch(`${BACKEND_URL}/api/create-nft-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serial_number: formData.serialNumber,
        production_date: formData.productionDate,
        device_model: formData.deviceModel,
        warranty_period: formData.warrantyPeriod,
        country_of_origin: formData.countryOfOrigin,
        manufacturer_id: formData.manufacturerId,
        collection_name: formData.collectionName || null,
        wallet_address: walletAddress,
        image_data: imageData,
        collection_image_data: collectionImageData,
      }),
    });

    if (!nftTransactionResponse.ok) {
      const errorData = await nftTransactionResponse.json();
      throw new Error(`Failed to create NFT transaction: ${errorData.error || nftTransactionResponse.statusText}`);
    }

    const nftTransactionData = await nftTransactionResponse.json();
    
    if (!nftTransactionData.success) {
      throw new Error(`NFT transaction creation failed: ${nftTransactionData.error}`);
    }

    // 6. Підписуємо транзакцію NFT в гаманці
    console.log('Signing NFT transaction...');
    const signedNftTransaction = await signTransaction(wallet, nftTransactionData.transaction);
    
    // 7. Відправляємо підписану транзакцію NFT
    const submitNftResponse = await fetch(`${BACKEND_URL}/api/submit-signed-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signed_transaction: signedNftTransaction,
        transaction_type: 'nft',
      }),
    });

    if (!submitNftResponse.ok) {
      const errorData = await submitNftResponse.json();
      throw new Error(`Failed to submit NFT transaction: ${errorData.error || submitNftResponse.statusText}`);
    }

    const submitNftData = await submitNftResponse.json();
    console.log('NFT created successfully:', submitNftData);
    
    return {
      signature: submitNftData.signature,
      mintAddress: nftTransactionData.mint_address,
    };
  } catch (error) {
    console.error('Error in mintPassportWithMetaplex:', error);
    throw error;
  }
}

// Функція для конвертації файлу в base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Видаляємо data:image/...;base64,
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Функція для підпису транзакції в гаманці
async function signTransaction(wallet, transactionBase64) {
  try {
    const transactionBuffer = Buffer.from(transactionBase64, 'base64');
    const transaction = Transaction.from(transactionBuffer);

    // Отримуємо актуальний blockhash з бекенду
    const res = await fetch(`${BACKEND_URL}/api/latest-blockhash`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch latest blockhash');
    transaction.recentBlockhash = data.blockhash;

    const signedTransaction = await wallet.signTransaction(transaction);
    const signedTransactionBase64 = Buffer.from(signedTransaction.serialize()).toString('base64');
    return signedTransactionBase64;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw new Error('Failed to sign transaction in wallet');
  }
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