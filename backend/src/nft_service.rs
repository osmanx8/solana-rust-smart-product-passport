use crate::solana_client::SolanaClient;
use crate::upload_service::UploadService;
use serde::{Deserialize, Serialize};
use solana_sdk::{
    pubkey::Pubkey,
};
use std::sync::Arc;
use std::str::FromStr;
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;
use solana_sdk::signature::Signer;

#[derive(Debug, Serialize, Deserialize)]
pub struct NftMetadata {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub image: String,
    pub attributes: Vec<NftAttribute>,
    pub properties: NftProperties,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NftAttribute {
    pub trait_type: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NftProperties {
    pub files: Vec<NftFile>,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NftFile {
    pub r#type: String,
    pub uri: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NftInfo {
    pub address: String,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub owner: String,
    pub collection: Option<String>,
}

pub struct NftService {
    solana_client: Arc<SolanaClient>,
    upload_service: Arc<UploadService>,
}

impl NftService {
    pub fn new(
        solana_client: Arc<SolanaClient>,
        upload_service: Arc<UploadService>,
    ) -> Self {
        Self {
            solana_client,
            upload_service,
        }
    }

    pub async fn create_nft(
        &self,
        serial_number: &str,
        production_date: &str,
        device_model: &str,
        warranty_period: &str,
        country_of_origin: &str,
        manufacturer_id: &str,
        collection_name: Option<&str>,
        wallet_address: &str,
    ) -> Result<(String, String, String), anyhow::Error> {
        // 1. Створюємо метадані для NFT
        let metadata = self.create_nft_metadata(
            serial_number,
            production_date,
            device_model,
            warranty_period,
            country_of_origin,
            manufacturer_id,
            collection_name,
        )?;

        // 2. Завантажуємо метадані на Arweave
        let metadata_uri = self.upload_service.upload_metadata(&metadata).await?;

        // 3. Створюємо NFT через Metaplex
        let nft_address = self.mint_nft(&metadata_uri, &metadata.name, &metadata.symbol, wallet_address).await?;

        // 4. Якщо є колекція, прив'язуємо NFT до неї
        if let Some(collection_name) = collection_name {
            self.attach_to_collection(&nft_address, collection_name, wallet_address).await?;
        }

        Ok((nft_address, metadata.image, metadata_uri))
    }

    fn create_nft_metadata(
        &self,
        serial_number: &str,
        production_date: &str,
        device_model: &str,
        warranty_period: &str,
        country_of_origin: &str,
        manufacturer_id: &str,
        collection_name: Option<&str>,
    ) -> Result<NftMetadata, anyhow::Error> {
        let mut attributes = vec![
            NftAttribute {
                trait_type: "Serial Number".to_string(),
                value: serial_number.to_string(),
            },
            NftAttribute {
                trait_type: "Production Date".to_string(),
                value: production_date.to_string(),
            },
            NftAttribute {
                trait_type: "Device Model".to_string(),
                value: device_model.to_string(),
            },
            NftAttribute {
                trait_type: "Warranty Period".to_string(),
                value: warranty_period.to_string(),
            },
            NftAttribute {
                trait_type: "Country of Origin".to_string(),
                value: country_of_origin.to_string(),
            },
            NftAttribute {
                trait_type: "Manufacturer ID".to_string(),
                value: manufacturer_id.to_string(),
            },
        ];

        if let Some(collection_name) = collection_name {
            attributes.push(NftAttribute {
                trait_type: "Collection".to_string(),
                value: collection_name.to_string(),
            });
        }

        Ok(NftMetadata {
            name: device_model.to_string(),
            symbol: "SPP".to_string(),
            description: format!("Smart Product Passport for {}", device_model),
            image: "https://arweave.net/placeholder-image".to_string(), // Буде замінено на реальне зображення
            attributes,
            properties: NftProperties {
                files: vec![NftFile {
                    r#type: "image/png".to_string(),
                    uri: "https://arweave.net/placeholder-image".to_string(),
                }],
                category: "image".to_string(),
            },
        })
    }

    async fn mint_nft(
        &self,
        _metadata_uri: &str,
        _name: &str,
        _symbol: &str,
        _wallet_address: &str,
    ) -> Result<String, anyhow::Error> {
        // Тут буде логіка створення NFT через Metaplex
        // Поки що повертаємо заглушку
        let nft_address = self.solana_client.generate_keypair().pubkey().to_string();
        
        log::info!("Created NFT: {} with metadata: {}", nft_address, _metadata_uri);
        
        Ok(nft_address)
    }

    async fn attach_to_collection(
        &self,
        _nft_address: &str,
        _collection_name: &str,
        _wallet_address: &str,
    ) -> Result<(), anyhow::Error> {
        // Тут буде логіка прив'язки NFT до колекції
        log::info!("Attaching NFT {} to collection: {}", _nft_address, _collection_name);
        Ok(())
    }

    pub async fn get_nfts_by_owner(&self, wallet_address: &str) -> Result<Vec<NftInfo>, anyhow::Error> {
        // Тут буде логіка отримання NFT по власнику
        // Поки що повертаємо заглушку
        // Спробуємо отримати останній створений mint_address для цього користувача
        // (У реальному додатку тут має бути запит до Solana або бази даних)
        let mint_address = "mock_nft_address".to_string(); // TODO: замінити на реальний пошук
        let nfts = vec![
            NftInfo {
                address: mint_address.clone(),
                name: "SPP Passport - TEST001".to_string(),
                symbol: "SPP".to_string(),
                uri: "https://arweave.net/mock-metadata".to_string(),
                owner: wallet_address.to_string(),
                collection: Some("Test Collection".to_string()),
            }
        ];
        Ok(nfts)
    }

    pub async fn upload_nft_image(&self, image_data: &[u8], filename: &str) -> Result<String, anyhow::Error> {
        self.upload_service.upload_image(image_data, filename).await
    }

    // Створення транзакції для NFT (для підпису в браузері)
    pub async fn create_nft_transaction(
        &self,
        _serial_number: &str,
        _production_date: &str,
        _device_model: &str,
        _warranty_period: &str,
        _country_of_origin: &str,
        _manufacturer_id: &str,
        _collection_name: Option<&str>,
        _wallet_address: &str,
        _image_data: Option<&str>,
        _collection_image_data: Option<&str>,
    ) -> Result<(String, String), anyhow::Error> { // (transaction, mint_address)
        // 1. Завантажуємо зображення (якщо надано)
        let mut image_uri = "https://arweave.net/placeholder-image".to_string();
        if let Some(img_data) = _image_data {
            if let Ok(decoded) = BASE64_STANDARD.decode(img_data) {
                image_uri = self.upload_service.upload_image(&decoded, "nft-image.png").await?;
            }
        }

        // 2. Створюємо метадані
        let mut metadata = self.create_nft_metadata(
            _serial_number,
            _production_date,
            _device_model,
            _warranty_period,
            _country_of_origin,
            _manufacturer_id,
            _collection_name,
        )?;
        metadata.image = image_uri.clone();

        // 3. Завантажуємо метадані
        let metadata_uri = self.upload_service.upload_metadata(&metadata).await?;

        // 4. Генеруємо mint keypair
        let mint_keypair = self.solana_client.generate_keypair();
        let mint_pubkey = mint_keypair.pubkey();

        // 5. Створюємо інструкції для транзакції
        let fee_payer = Pubkey::from_str(_wallet_address)?;
        let instructions = self.solana_client
            .create_nft_instructions(&metadata_uri, &metadata.name, &metadata.symbol, &fee_payer, &mint_pubkey)
            .await?;

        // 6. Створюємо транзакцію для підпису
        let transaction_data = self.solana_client
            .create_nft_transaction_with_mint(instructions, &fee_payer, &mint_keypair)
            .await?;

        log::info!("Created NFT transaction for wallet: {} mint: {}", _wallet_address, mint_pubkey);
        
        Ok((transaction_data, mint_pubkey.to_string()))
    }
} 