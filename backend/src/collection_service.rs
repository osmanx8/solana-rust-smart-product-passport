use crate::solana_client::SolanaClient;
use crate::upload_service::UploadService;
use serde::{Deserialize, Serialize};
use solana_sdk::{
    pubkey::Pubkey,
    signature::Signer,
};
use std::sync::Arc;
use std::str::FromStr;
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;

#[derive(Debug, Serialize, Deserialize)]
pub struct CollectionMetadata {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub image: String,
    pub attributes: Vec<CollectionAttribute>,
    pub properties: CollectionProperties,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CollectionAttribute {
    pub trait_type: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CollectionProperties {
    pub files: Vec<CollectionFile>,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CollectionFile {
    pub r#type: String,
    pub uri: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CollectionInfo {
    pub address: String,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub owner: String,
    pub item_count: u64,
}

pub struct CollectionService {
    solana_client: Arc<SolanaClient>,
    upload_service: Arc<UploadService>,
}

impl CollectionService {
    pub fn new(
        solana_client: Arc<SolanaClient>,
        upload_service: Arc<UploadService>,
    ) -> Self {
        Self {
            solana_client,
            upload_service,
        }
    }

    pub async fn create_collection(
        &self,
        name: &str,
        symbol: &str,
        description: &str,
        wallet_address: &str,
    ) -> Result<String, anyhow::Error> {
        // 1. Створюємо метадані для колекції
        let metadata = self.create_collection_metadata(name, symbol, description)?;

        // 2. Завантажуємо метадані на Arweave
        let metadata_uri = self.upload_service.upload_metadata(&metadata).await?;

        // 3. Створюємо колекцію через Metaplex
        let collection_address = self.mint_collection(&metadata_uri, name, symbol, wallet_address).await?;

        log::info!("Created collection: {} with metadata: {}", collection_address, metadata_uri);

        Ok(collection_address)
    }

    fn create_collection_metadata(
        &self,
        name: &str,
        symbol: &str,
        description: &str,
    ) -> Result<CollectionMetadata, anyhow::Error> {
        Ok(CollectionMetadata {
            name: name.to_string(),
            symbol: symbol.to_string(),
            description: description.to_string(),
            image: "https://arweave.net/placeholder-collection-image".to_string(), // Буде замінено на реальне зображення
            attributes: vec![
                CollectionAttribute {
                    trait_type: "Type".to_string(),
                    value: "Collection".to_string(),
                },
                CollectionAttribute {
                    trait_type: "Category".to_string(),
                    value: "Smart Product Passport".to_string(),
                },
            ],
            properties: CollectionProperties {
                files: vec![CollectionFile {
                    r#type: "image/png".to_string(),
                    uri: "https://arweave.net/placeholder-collection-image".to_string(),
                }],
                category: "image".to_string(),
            },
        })
    }

    async fn mint_collection(
        &self,
        _metadata_uri: &str,
        _name: &str,
        _symbol: &str,
        _wallet_address: &str,
    ) -> Result<String, anyhow::Error> {
        // Тут буде логіка створення колекції через Metaplex
        // Поки що повертаємо заглушку
        let collection_address = self.solana_client.generate_keypair().pubkey().to_string();
        
        log::info!("Minting collection: {} with metadata: {}", collection_address, _metadata_uri);
        
        Ok(collection_address)
    }

    pub async fn get_collections_by_owner(&self, wallet_address: &str) -> Result<Vec<CollectionInfo>, anyhow::Error> {
        // Тут буде логіка отримання колекцій по власнику
        // Поки що повертаємо заглушку
        let collections = vec![
            CollectionInfo {
                address: "mock_collection_address".to_string(),
                name: "Test Collection".to_string(),
                symbol: "TEST".to_string(),
                uri: "https://arweave.net/mock-collection-metadata".to_string(),
                owner: wallet_address.to_string(),
                item_count: 5,
            }
        ];
        
        Ok(collections)
    }

    pub async fn upload_collection_image(&self, image_data: &[u8], filename: &str) -> Result<String, anyhow::Error> {
        self.upload_service.upload_image(image_data, filename).await
    }

    pub async fn add_nft_to_collection(
        &self,
        _collection_address: &str,
        _nft_address: &str,
        _wallet_address: &str,
    ) -> Result<(), anyhow::Error> {
        // Тут буде логіка додавання NFT до колекції
        log::info!("Adding NFT {} to collection: {}", _nft_address, _collection_address);
        Ok(())
    }

    pub async fn remove_nft_from_collection(
        &self,
        _collection_address: &str,
        _nft_address: &str,
        _wallet_address: &str,
    ) -> Result<(), anyhow::Error> {
        // Тут буде логіка видалення NFT з колекції
        log::info!("Removing NFT {} from collection: {}", _nft_address, _collection_address);
        Ok(())
    }

    pub async fn get_collection_nfts(&self, _collection_address: &str) -> Result<Vec<String>, anyhow::Error> {
        // Тут буде логіка отримання всіх NFT у колекції
        // Поки що повертаємо заглушку
        let nfts = vec![
            "mock_nft_1".to_string(),
            "mock_nft_2".to_string(),
            "mock_nft_3".to_string(),
        ];
        
        Ok(nfts)
    }

    // Створення транзакції для колекції (для підпису в браузері)
    pub async fn create_collection_transaction(
        &self,
        name: &str,
        symbol: &str,
        description: &str,
        wallet_address: &str,
        image_data: Option<&str>,
    ) -> Result<String, anyhow::Error> {
        // 1. Завантажуємо зображення (якщо надано)
        let mut image_uri = "https://arweave.net/placeholder-collection-image".to_string();
        if let Some(img_data) = image_data {
            if let Ok(decoded) = BASE64_STANDARD.decode(img_data) {
                image_uri = self.upload_service.upload_image(&decoded, "collection-image.png").await?;
            }
        }

        // 2. Створюємо метадані
        let mut metadata = self.create_collection_metadata(name, symbol, description)?;
        metadata.image = image_uri.clone();

        // 3. Завантажуємо метадані
        let metadata_uri = self.upload_service.upload_metadata(&metadata).await?;

        // 4. Створюємо інструкції для транзакції
        let fee_payer = Pubkey::from_str(wallet_address)?;
        let instructions = self.solana_client
            .create_collection_instructions(&metadata_uri, name, symbol, &fee_payer)
            .await?;

        // 5. Створюємо транзакцію для підпису
        let transaction_data = self.solana_client
            .create_nft_transaction(instructions, &fee_payer)
            .await?;

        log::info!("Created collection transaction for wallet: {}", wallet_address);
        
        Ok(transaction_data)
    }
} 