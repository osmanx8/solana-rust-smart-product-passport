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

    /// Створює NFT (mint) і, якщо потрібно, прив'язує до колекції. Приймає готові URI метаданих та зображення.
    pub async fn create_nft(
        &self,
        metadata_uri: &str,
        name: &str,
        wallet_address: &str,
        collection_mint: Option<&str>,
    ) -> Result<String, anyhow::Error> {
        use solana_sdk::pubkey::Pubkey;
        let fee_payer = Pubkey::from_str(wallet_address)?;
        let mint_keypair = self.solana_client.generate_keypair();
        let mint_pubkey = mint_keypair.pubkey();

        // Генеруємо symbol автоматично: перші 4 літери name у верхньому регістрі, або "NFT" якщо коротко
        let symbol = name.chars().take(4).collect::<String>().to_uppercase();
        let symbol = if symbol.is_empty() { "NFT".to_string() } else { symbol };

        // Створюємо інструкції для NFT
        let mut instructions = self.solana_client
            .create_nft_instructions(metadata_uri, name, &symbol, &fee_payer, &mint_pubkey)
            .await?;

        // Якщо потрібно, додаємо інструкцію прив'язки до колекції
        if let Some(collection_mint_str) = collection_mint {
            let collection_mint = Pubkey::from_str(collection_mint_str)?;
            let set_collection_ix = self.solana_client.create_set_collection_instruction(&mint_pubkey, &collection_mint, &fee_payer);
            instructions.push(set_collection_ix);
        }

        // Створюємо транзакцію для підпису
        let transaction_data = self.solana_client
            .create_nft_transaction_with_mint(instructions, &fee_payer, &mint_keypair)
            .await?;

        log::info!("Created NFT transaction for wallet: {} mint: {} symbol: {}", wallet_address, mint_pubkey, symbol);
        Ok(transaction_data)
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
        let mut image_uri = String::new();
        if let Some(img_data) = _image_data {
            if let Ok(decoded) = BASE64_STANDARD.decode(img_data) {
                image_uri = self.upload_service.upload_image(&decoded, "nft-image.png").await?;
            }
        }
        if image_uri.is_empty() {
            return Err(anyhow::anyhow!("NFT image is required and was not provided or failed to upload."));
        }

        // 2. Створюємо метадані
        let metadata = NftMetadata {
            name: _serial_number.to_string(),
            symbol: _device_model.to_string(),
            description: format!("Serial Number: {}, Production Date: {}, Warranty Period: {}", _serial_number, _production_date, _warranty_period),
            image: image_uri.clone(),
            attributes: vec![
                NftAttribute { trait_type: "Serial Number".to_string(), value: _serial_number.to_string() },
                NftAttribute { trait_type: "Production Date".to_string(), value: _production_date.to_string() },
                NftAttribute { trait_type: "Device Model".to_string(), value: _device_model.to_string() },
                NftAttribute { trait_type: "Warranty Period".to_string(), value: _warranty_period.to_string() },
                NftAttribute { trait_type: "Country of Origin".to_string(), value: _country_of_origin.to_string() },
                NftAttribute { trait_type: "Manufacturer ID".to_string(), value: _manufacturer_id.to_string() },
            ],
            properties: NftProperties {
                files: vec![NftFile { r#type: "image/png".to_string(), uri: image_uri.clone() }],
                category: "NFT".to_string(),
            },
        };

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