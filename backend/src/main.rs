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
use tokio;
use std::thread;
use solana_client::SolanaClient;
use solana_sdk::signature::Signer;
use actix_web::web::Json;
use actix_multipart::Multipart;
use futures_util::StreamExt as _;

mod nft_service;
mod collection_service;
mod solana_client;
mod upload_service;
use nft_service::NftService;
use collection_service::CollectionService;
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
    pub metadata_uri: Option<String>, // <-- Додаємо поле
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

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadMetadataRequest {
    pub metadata: serde_json::Value,
    pub image_data: Option<String>,
    pub collection_image_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadImageRequest {
    pub image_data: String, // base64 encoded image
    pub filename: String,
}

// Структура для зберігання стану додатку
pub struct AppState {
    pub nft_service: Arc<NftService>,
    pub collection_service: Arc<CollectionService>,
    pub solana_client: Arc<SolanaClient>,
    pub upload_service: Arc<UploadService>,
}

// Видаляємо #[actix_web::main] і створюємо власну main функцію
fn main() -> std::io::Result<()> {
    let num_workers = thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4);

    println!("Starting server with {} workers", num_workers);

    // Створюємо multi-threaded runtime з явними налаштуваннями
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(num_workers)
        .enable_all()
        .build()
        .unwrap();
    rt.block_on(async_main(num_workers))
}

async fn async_main(num_workers: usize) -> std::io::Result<()> {
    env_logger::init();
    
    // Завантажуємо змінні середовища з файлу
    dotenv::from_filename("env.local").ok();
    
    // Ініціалізуємо сервіси в main thread (multi-threaded runtime)
    println!("Initializing Solana client...");
    let solana_client = Arc::new(SolanaClient::new().await.expect("Failed to initialize Solana client"));
    println!("Solana client initialized successfully!");
    
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
                    .route("/upload-metadata", web::post().to(upload_metadata))
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
                    .route("/upload-image", web::post().to(upload_image))
                    .service(latest_blockhash)
            )
    })
    .workers(num_workers)
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

#[actix_web::get("/latest-blockhash")]
async fn latest_blockhash(_state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    match _state.solana_client.rpc_client.get_latest_blockhash().await {
        Ok(hash) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "blockhash": hash.to_string()
        }))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "success": false,
            "error": format!("{}", e)
        }))),
    }
}

async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "SPP Backend",
        "version": "1.0.0"
    }))
}

async fn upload_metadata(
    state: web::Data<AppState>,
    payload: Json<UploadMetadataRequest>,
) -> Result<HttpResponse, Error> {
    // Використовуємо upload_service для завантаження метаданих
    let metadata_uri = match state.upload_service.upload_metadata(&payload.metadata).await {
        Ok(uri) => uri,
        Err(e) => {
            log::error!("Failed to upload metadata: {:?}", e);
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "error": format!("Failed to upload metadata: {}", e)
            })));
        }
    };
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "metadata_uri": metadata_uri
    })))
}

// Створення транзакції для NFT (для підпису в браузері)
async fn create_nft_transaction(
    _state: web::Data<AppState>,
    _payload: web::Json<serde_json::Value>,
) -> Result<HttpResponse, Error> {
    // Витягуємо всі потрібні поля з payload
    let serial_number = match _payload["serial_number"].as_str() {
        Some(val) => val,
        None => return Ok(HttpResponse::BadRequest().json(serde_json::json!({"success": false, "error": "serial_number is required"}))),
    };
    let production_date = match _payload["production_date"].as_str() {
        Some(val) => val,
        None => return Ok(HttpResponse::BadRequest().json(serde_json::json!({"success": false, "error": "production_date is required"}))),
    };
    let device_model = match _payload["device_model"].as_str() {
        Some(val) => val,
        None => return Ok(HttpResponse::BadRequest().json(serde_json::json!({"success": false, "error": "device_model is required"}))),
    };
    let warranty_period = match _payload["warranty_period"].as_str() {
        Some(val) => val,
        None => return Ok(HttpResponse::BadRequest().json(serde_json::json!({"success": false, "error": "warranty_period is required"}))),
    };
    let country_of_origin = match _payload["country_of_origin"].as_str() {
        Some(val) => val,
        None => return Ok(HttpResponse::BadRequest().json(serde_json::json!({"success": false, "error": "country_of_origin is required"}))),
    };
    let manufacturer_id = match _payload["manufacturer_id"].as_str() {
        Some(val) => val,
        None => return Ok(HttpResponse::BadRequest().json(serde_json::json!({"success": false, "error": "manufacturer_id is required"}))),
    };
    let collection_name = _payload["collection_name"].as_str();
    let wallet_address = match _payload["wallet_address"].as_str() {
        Some(val) => val,
        None => return Ok(HttpResponse::BadRequest().json(serde_json::json!({"success": false, "error": "wallet_address is required"}))),
    };
    let image_data = _payload["image_data"].as_str();
    let collection_image_data = _payload["collection_image_data"].as_str();
    let metadata_uri = _payload["metadata_uri"].as_str();

    if let Some(metadata_uri) = metadata_uri {
        // Використовуємо тільки цей URI для mint NFT
        let mint_keypair = _state.solana_client.generate_keypair();
        let mint_pubkey = mint_keypair.pubkey();
        let fee_payer = Pubkey::from_str(wallet_address)
            .map_err(|e| actix_web::error::ErrorBadRequest(format!("Invalid wallet_address: {}", e)))?;
        let instructions = _state.solana_client
            .create_nft_instructions(metadata_uri, "SPP Passport", "SPP", &fee_payer, &mint_pubkey)
            .await
            .map_err(|e| {
                log::error!("Failed to create NFT instructions: {:?}", e);
                actix_web::error::ErrorInternalServerError(e)
            })?;
        let transaction_data = _state.solana_client
            .create_nft_transaction_with_mint(instructions, &fee_payer, &mint_keypair)
            .await
            .map_err(|e| {
                log::error!("Failed to create NFT transaction: {:?}", e);
                actix_web::error::ErrorInternalServerError(e)
            })?;
        return Ok(HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "transaction": transaction_data,
            "mint_address": mint_pubkey.to_string(),
            "message": "NFT creation transaction created with provided metadata_uri"
        })));
    }

    // Викликаємо NftService для створення транзакції (з автоматичним upload metadata)
    let (transaction_data, mint_address) = match _state.nft_service
        .create_nft_transaction(
            serial_number,
            production_date,
            device_model,
            warranty_period,
            country_of_origin,
            manufacturer_id,
            collection_name,
            wallet_address,
            image_data,
            collection_image_data,
        )
        .await {
        Ok(res) => res,
        Err(e) => {
            log::error!("Failed to create NFT transaction: {:?}", e);
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({"success": false, "error": format!("Failed to create NFT transaction: {}", e)})));
        }
    };
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "transaction": transaction_data,
        "mint_address": mint_address,
        "message": "NFT creation transaction created with auto metadata upload"
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
            log::error!("Failed to create collection transaction: {:?}", e);
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
    match _state
        .solana_client
        .submit_signed_transaction(&_payload.signed_transaction)
        .await
    {
        Ok(signature) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "signature": signature
        }))),
        Err(e) => {
            log::error!("Failed to submit signed transaction: {:?}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "error": format!("Failed to submit signed transaction: {}", e)
            })))
        }
    }
}

async fn create_collection(
    _state: web::Data<AppState>,
    _payload: web::Json<CreateCollectionRequest>,
) -> Result<HttpResponse, Error> {
    let collection_address = _state.collection_service
        .create_collection(&_payload.name, &_payload.symbol, &_payload.description, &_payload.wallet_address)
        .await
        .map_err(|e| {
            log::error!("Failed to create collection: {:?}", e);
            actix_web::error::ErrorInternalServerError(e)
        })?;
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
        .map_err(|e| {
            log::error!("Failed to create NFT: {:?}", e);
            actix_web::error::ErrorInternalServerError(e)
        })?;
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
    ).await.map_err(|e| {
        log::error!("Failed to withdraw from treasury: {:?}", e);
        actix_web::error::ErrorInternalServerError(e)
    })?;
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "signature": result,
        "message": "Treasury withdrawal successful"
    })))
} 

#[actix_web::post("/upload-image")]
async fn upload_image(
    state: web::Data<AppState>,
    payload: Json<UploadImageRequest>,
) -> Result<HttpResponse, Error> {
    let image_data = match BASE64_STANDARD.decode(&payload.image_data) {
        Ok(data) => data,
        Err(e) => {
            log::error!("Failed to decode base64 image: {:?}", e);
            return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "success": false,
                "error": format!("Failed to decode base64 image: {}", e)
            })));
        }
    };
    let image_uri = match state.upload_service.upload_image(&image_data, &payload.filename).await {
        Ok(uri) => uri,
        Err(e) => {
            log::error!("Failed to upload image: {:?}", e);
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "error": format!("Failed to upload image: {}", e)
            })));
        }
    };
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "image_uri": image_uri
    })))
} 