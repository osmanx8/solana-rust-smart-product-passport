use actix_cors::Cors;
use actix_web::{web, App, HttpServer, HttpResponse, Error};
use actix_web::middleware::Logger;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::transaction::Transaction;
use bincode;
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;
use std::str::FromStr;

mod nft_service;
mod collection_service;
mod solana_client;
mod upload_service;

use nft_service::NftService;
use collection_service::CollectionService;
use solana_client::SolanaClient;
use upload_service::UploadService;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNftRequest {
    pub serial_number: String,
    pub production_date: String,
    pub device_model: String,
    pub warranty_period: String,
    pub country_of_origin: String,
    pub manufacturer_id: String,
    pub collection_name: Option<String>,
    pub wallet_address: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCollectionRequest {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub wallet_address: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNftTransactionRequest {
    pub serial_number: String,
    pub production_date: String,
    pub device_model: String,
    pub warranty_period: String,
    pub country_of_origin: String,
    pub manufacturer_id: String,
    pub collection_name: Option<String>,
    pub wallet_address: String,
    pub image_data: Option<String>, // base64 encoded image
    pub collection_image_data: Option<String>, // base64 encoded collection image
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCollectionTransactionRequest {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub wallet_address: String,
    pub image_data: Option<String>, // base64 encoded image
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionResponse {
    pub success: bool,
    pub transaction: Option<String>, // base64 encoded transaction
    pub message: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadResponse {
    pub success: bool,
    pub image_uri: Option<String>,
    pub metadata_uri: Option<String>,
    pub nft_address: Option<String>,
    pub collection_address: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitSignedTransactionRequest {
    pub signed_transaction: String, // base64 encoded signed transaction
    pub transaction_type: String, // "nft" or "collection"
}

// Структура для зберігання стану додатку
pub struct AppState {
    pub nft_service: Arc<NftService>,
    pub collection_service: Arc<CollectionService>,
    pub solana_client: Arc<SolanaClient>,
    pub upload_service: Arc<UploadService>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    
    // Ініціалізуємо сервіси
    let solana_client = Arc::new(SolanaClient::new().expect("Failed to initialize Solana client"));
    let upload_service = Arc::new(UploadService::new().expect("Failed to initialize upload service"));
    let nft_service = Arc::new(NftService::new(
        Arc::clone(&solana_client),
        Arc::clone(&upload_service),
    ));
    let collection_service = Arc::new(CollectionService::new(
        Arc::clone(&solana_client),
        Arc::clone(&upload_service),
    ));

    let app_state = web::Data::new(AppState {
        nft_service,
        collection_service,
        solana_client,
        upload_service,
    });

    println!("🚀 SPP Backend starting on http://localhost:8080");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(app_state.clone())
            .service(
                web::scope("/api")
                    .route("/health", web::get().to(health_check))
                    .route("/upload-image", web::post().to(upload_image))
                    .route("/create-collection", web::post().to(create_collection))
                    .route("/create-nft", web::post().to(create_nft))
                    .route("/create-nft-transaction", web::post().to(create_nft_transaction))
                    .route("/create-collection-transaction", web::post().to(create_collection_transaction))
                    .route("/submit-signed-transaction", web::post().to(submit_signed_transaction))
                    .route("/get-nfts", web::get().to(get_nfts))
                    .route("/get-collections", web::get().to(get_collections))
                    .route("/get-nft-cost", web::get().to(get_nft_cost))
                    .route("/get-collection-cost", web::get().to(get_collection_cost))
                    .route("/treasury/info", web::get().to(get_treasury_info))
                    .route("/treasury/withdraw", web::post().to(withdraw_from_treasury))
            )
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "SPP Backend",
        "version": "1.0.0"
    }))
}

async fn upload_image(
    _state: web::Data<AppState>,
    _payload: web::Json<serde_json::Value>,
) -> Result<HttpResponse, Error> {
    // Тут буде логіка завантаження зображення
    // Поки що повертаємо заглушку
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "image_uri": "https://arweave.net/placeholder"
    })))
}

// Створення транзакції для NFT (для підпису в браузері)
async fn create_nft_transaction(
    _state: web::Data<AppState>,
    _payload: web::Json<serde_json::Value>,
) -> Result<HttpResponse, Error> {
    let metadata_uri = _payload["metadata_uri"]
        .as_str()
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Metadata URI is required"))?;
    
    let name = _payload["name"]
        .as_str()
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Name is required"))?;
    
    let symbol = _payload["symbol"]
        .as_str()
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Symbol is required"))?;
    
    let fee_payer = _payload["fee_payer"]
        .as_str()
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Fee payer is required"))?;
    
    let fee_payer_pubkey = Pubkey::from_str(fee_payer)
        .map_err(|e| actix_web::error::ErrorBadRequest(format!("Invalid fee payer address: {}", e)))?;
    
    // Розраховуємо service fee
    let cost = _state.solana_client.calculate_nft_creation_cost().await.map_err(actix_web::error::ErrorInternalServerError)?;
    let service_fee = cost.service_fee;
    
    // Створюємо інструкції з fee transfer
    let instructions = _state.solana_client.create_nft_instructions_with_fee(
        metadata_uri,
        name,
        symbol,
        &fee_payer_pubkey,
        service_fee,
    ).await.map_err(actix_web::error::ErrorInternalServerError)?;
    
    // Створюємо транзакцію
    let recent_blockhash = _state.solana_client.as_ref().rpc_client.get_latest_blockhash().map_err(actix_web::error::ErrorInternalServerError)?;
    let mut transaction = Transaction::new_with_payer(
        &instructions,
        Some(&fee_payer_pubkey),
    );
    transaction.message.recent_blockhash = recent_blockhash;
    
    // Серіалізуємо транзакцію
    let serialized = bincode::serialize(&transaction).map_err(actix_web::error::ErrorInternalServerError)?;
    let encoded = BASE64_STANDARD.encode(serialized);
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "transaction": encoded,
        "service_fee": service_fee,
        "service_fee_sol": service_fee as f64 / 1_000_000_000.0,
        "message": "NFT creation transaction created with fee transfer"
    })))
}

// Створення транзакції для колекції (для підпису в браузері)
async fn create_collection_transaction(
    _state: web::Data<AppState>,
    _payload: web::Json<CreateCollectionTransactionRequest>,
) -> Result<HttpResponse, Error> {
    let result = _state.collection_service
        .create_collection_transaction(
            &_payload.name,
            &_payload.symbol,
            &_payload.description,
            &_payload.wallet_address,
            _payload.image_data.as_deref(),
        )
        .await;

    match result {
        Ok(transaction_data) => {
            Ok(HttpResponse::Ok().json(TransactionResponse {
                success: true,
                transaction: Some(transaction_data),
                message: Some("Collection transaction created successfully. Please sign it in your wallet.".to_string()),
                error: None,
            }))
        }
        Err(e) => {
            Ok(HttpResponse::InternalServerError().json(TransactionResponse {
                success: false,
                transaction: None,
                message: None,
                error: Some(e.to_string()),
            }))
        }
    }
}

// Відправка підписаної транзакції
async fn submit_signed_transaction(
    _state: web::Data<AppState>,
    _payload: web::Json<SubmitSignedTransactionRequest>,
) -> Result<HttpResponse, Error> {
    let signature = _state.solana_client
        .submit_signed_transaction(&_payload.signed_transaction)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "signature": signature,
        "message": "Transaction submitted successfully",
        "explorer_url": format!("https://explorer.solana.com/tx/{}?cluster=devnet", signature),
    })))
}

async fn create_collection(
    _state: web::Data<AppState>,
    _payload: web::Json<CreateCollectionRequest>,
) -> Result<HttpResponse, Error> {
    let collection_address = _state.collection_service
        .create_collection(&_payload.name, &_payload.symbol, &_payload.description, &_payload.wallet_address)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(UploadResponse {
        success: true,
        image_uri: None,
        metadata_uri: None,
        nft_address: None,
        collection_address: Some(collection_address),
        error: None,
    }))
}

async fn create_nft(
    _state: web::Data<AppState>,
    _payload: web::Json<CreateNftRequest>,
) -> Result<HttpResponse, Error> {
    let (nft_address, image_uri, metadata_uri) = _state.nft_service
        .create_nft(
            &_payload.serial_number,
            &_payload.production_date,
            &_payload.device_model,
            &_payload.warranty_period,
            &_payload.country_of_origin,
            &_payload.manufacturer_id,
            _payload.collection_name.as_deref(),
            &_payload.wallet_address,
        )
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(UploadResponse {
        success: true,
        image_uri: Some(image_uri),
        metadata_uri: Some(metadata_uri),
        nft_address: Some(nft_address),
        collection_address: None,
        error: None,
    }))
}

async fn get_nfts(
    _state: web::Data<AppState>,
    _query: web::Query<std::collections::HashMap<String, String>>,
) -> Result<HttpResponse, Error> {
    let wallet_address = _query.get("wallet_address")
        .ok_or_else(|| actix_web::error::ErrorBadRequest("wallet_address is required"))?;
    let nfts = _state.nft_service.get_nfts_by_owner(wallet_address).await.map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(nfts))
}

async fn get_collections(
    _state: web::Data<AppState>,
    _query: web::Query<std::collections::HashMap<String, String>>,
) -> Result<HttpResponse, Error> {
    let wallet_address = _query.get("wallet_address")
        .ok_or_else(|| actix_web::error::ErrorBadRequest("wallet_address is required"))?;
    let collections = _state.collection_service.get_collections_by_owner(wallet_address).await.map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(collections))
}

async fn get_nft_cost(_state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let cost = _state.solana_client.calculate_nft_creation_cost().await.map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "cost": {
            "mint_account": cost.mint_account,
            "token_account": cost.token_account,
            "metadata_account": cost.metadata_account,
            "transaction_fee": cost.transaction_fee,
            "total_cost": cost.total_cost,
            "total_sol": cost.get_total_sol(),
            "total_usd": cost.get_total_usd(),
            "sol_price": cost.sol_price,
            "service_fee": cost.service_fee,
            "service_fee_sol": cost.get_service_fee_sol(),
            "service_fee_usd": cost.get_service_fee_sol() * cost.sol_price,
            "total_with_fee": cost.total_with_fee,
            "total_with_fee_sol": cost.get_total_with_fee_sol(),
            "total_with_fee_usd": cost.get_total_with_fee_sol() * cost.sol_price,
            "fee_recipient": cost.fee_recipient,
            "breakdown": {
                "mint_account_sol": cost.get_mint_account_sol(),
                "token_account_sol": cost.get_token_account_sol(),
                "metadata_account_sol": cost.get_metadata_account_sol(),
                "transaction_fee_sol": cost.get_transaction_fee_sol(),
            }
        }
    })))
}

async fn get_collection_cost(_state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let cost = _state.solana_client.calculate_collection_creation_cost().await.map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "cost": {
            "mint_account": cost.mint_account,
            "token_account": cost.token_account,
            "metadata_account": cost.metadata_account,
            "transaction_fee": cost.transaction_fee,
            "total_cost": cost.total_cost,
            "total_sol": cost.get_total_sol(),
            "total_usd": cost.get_total_usd(),
            "sol_price": cost.sol_price,
            "service_fee": cost.service_fee,
            "service_fee_sol": cost.get_service_fee_sol(),
            "service_fee_usd": cost.get_service_fee_sol() * cost.sol_price,
            "total_with_fee": cost.total_with_fee,
            "total_with_fee_sol": cost.get_total_with_fee_sol(),
            "total_with_fee_usd": cost.get_total_with_fee_sol() * cost.sol_price,
            "fee_recipient": cost.fee_recipient,
            "breakdown": {
                "mint_account_sol": cost.get_mint_account_sol(),
                "token_account_sol": cost.get_token_account_sol(),
                "metadata_account_sol": cost.get_metadata_account_sol(),
                "transaction_fee_sol": cost.get_transaction_fee_sol(),
            }
        }
    })))
}

// Отримання інформації про treasury
async fn get_treasury_info(_state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let treasury_info = _state.solana_client.get_treasury_info().await.map_err(actix_web::error::ErrorInternalServerError)?;
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "treasury": {
            "address": treasury_info.treasury_address,
            "balance": treasury_info.balance,
            "balance_sol": treasury_info.balance as f64 / 1_000_000_000.0,
            "total_collected_fees": treasury_info.total_collected_fees,
            "total_collected_fees_sol": treasury_info.total_collected_fees as f64 / 1_000_000_000.0,
            "owner_address": treasury_info.owner_address,
        }
    })))
}

// Вивід коштів з treasury
async fn withdraw_from_treasury(
    _state: web::Data<AppState>,
    _payload: web::Json<serde_json::Value>,
) -> Result<HttpResponse, Error> {
    let amount = _payload["amount"]
        .as_u64()
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Amount is required"))?;
    
    let recipient = _payload["recipient"]
        .as_str()
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Recipient is required"))?;
    
    let owner_signature = _payload["owner_signature"]
        .as_str()
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Owner signature is required"))?;
    
    let recipient_pubkey = Pubkey::from_str(recipient)
        .map_err(|e| actix_web::error::ErrorBadRequest(format!("Invalid recipient address: {}", e)))?;
    
    let result = _state.solana_client.withdraw_from_treasury(
        amount,
        &recipient_pubkey,
        owner_signature,
    ).await.map_err(actix_web::error::ErrorInternalServerError)?;
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "signature": result,
        "message": "Treasury withdrawal successful"
    })))
} 