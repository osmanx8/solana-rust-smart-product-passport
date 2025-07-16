use anyhow::{Result, anyhow};
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
    system_instruction,
    message::Message,
};
use serde::{Deserialize, Serialize};
use solana_client::rpc_request::TokenAccountsFilter;
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;
use spl_token::instruction as token_instruction;
use spl_token::id as spl_token_program_id;
use spl_associated_token_account::get_associated_token_address;
use spl_associated_token_account::instruction as ata_instruction;
use mpl_token_metadata::instructions as mpl_instruction;
use mpl_token_metadata::instructions::set_and_verify_sized_collection_item;
use mpl_token_metadata::accounts::{MasterEdition, Metadata};
use mpl_token_metadata::instructions::CreateV1Builder;
use mpl_token_metadata::types::PrintSupply;
use solana_program::program_pack::Pack;

#[derive(Debug, Serialize, Deserialize)]
pub struct NftCreationCost {
    pub mint_account: u64,
    pub token_account: u64,
    pub metadata_account: u64,
    pub transaction_fee: u64,
    pub total_cost: u64,
    pub sol_price: f64,
    pub service_fee: u64,        // 20% fee
    pub total_with_fee: u64,     // total + fee
    pub fee_recipient: String,   // адреса отримувача fee
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TreasuryWallet {
    pub treasury_address: String,
    pub balance: u64,
    pub total_collected_fees: u64,
    pub owner_address: String,
}

impl NftCreationCost {
    pub fn get_total_sol(&self) -> f64 {
        self.total_cost as f64 / 1_000_000_000.0
    }
    
    pub fn get_total_usd(&self) -> f64 {
        self.get_total_sol() * self.sol_price
    }
    
    pub fn get_mint_account_sol(&self) -> f64 {
        self.mint_account as f64 / 1_000_000_000.0
    }
    
    pub fn get_token_account_sol(&self) -> f64 {
        self.token_account as f64 / 1_000_000_000.0
    }
    
    pub fn get_metadata_account_sol(&self) -> f64 {
        self.metadata_account as f64 / 1_000_000_000.0
    }
    
    pub fn get_transaction_fee_sol(&self) -> f64 {
        self.transaction_fee as f64 / 1_000_000_000.0
    }
    
    pub fn get_service_fee_sol(&self) -> f64 {
        self.service_fee as f64 / 1_000_000_000.0
    }
    
    pub fn get_total_with_fee_sol(&self) -> f64 {
        self.total_with_fee as f64 / 1_000_000_000.0
    }
}

pub struct SolanaClient {
    pub rpc_client: RpcClient,
    _keypair: Keypair,
    treasury_keypair: Keypair,
    treasury_address: Pubkey,
}

impl SolanaClient {
    pub async fn new() -> Result<Self> {
        // Підключаємося до Solana devnet з fallback
        let rpc_url = std::env::var("SOLANA_RPC_URL")
            .unwrap_or_else(|_| "https://api.devnet.solana.com".to_string());
        
        let rpc_url_alt = std::env::var("SOLANA_RPC_URL_ALT")
            .unwrap_or_else(|_| "https://devnet.solana.rpcpool.com".to_string());
        
        // Спробуємо основний RPC URL, якщо не працює - використовуємо альтернативний
        let rpc_client = {
            let client = RpcClient::new_with_commitment(rpc_url.clone(), CommitmentConfig::confirmed());
            match client.get_version().await {
                Ok(version) => {
                    log::info!("✅ Primary RPC URL working: {} (version: {:?})", rpc_url, version);
                    client
                },
                Err(e) => {
                    log::warn!("❌ Primary RPC URL failed: {} - Error: {}", rpc_url, e);
                    log::info!("🔄 Trying alternative RPC URL: {}", rpc_url_alt);
                    let alt_client = RpcClient::new_with_commitment(rpc_url_alt.clone(), CommitmentConfig::confirmed());
                    match alt_client.get_version().await {
                        Ok(version) => {
                            log::info!("✅ Alternative RPC URL working: {} (version: {:?})", rpc_url_alt, version);
                            alt_client
                        },
                        Err(e2) => {
                            log::error!("❌ Both RPC URLs failed!");
                            log::error!("Primary: {} - Error: {}", rpc_url, e);
                            log::error!("Alternative: {} - Error: {}", rpc_url_alt, e2);
                            return Err(anyhow::anyhow!("Failed to connect to any Solana RPC endpoint"));
                        }
                    }
                }
            }
        };

        // Налаштовуємо timeout для RPC з'єднань
        log::info!("🔧 RPC client initialized with timeout settings");

        // Створюємо або завантажуємо keypair
        let keypair = Self::load_or_create_keypair()?;

        // Створюємо або завантажуємо treasury keypair
        let treasury_keypair = Self::load_or_create_treasury_keypair()?;
        let treasury_address = treasury_keypair.pubkey();
        
        log::info!("Treasury wallet initialized: {}", treasury_address);

        Ok(Self {
            rpc_client,
            _keypair: keypair,
            treasury_keypair,
            treasury_address,
        })
    }

    fn load_or_create_keypair() -> Result<Keypair> {
        // Спробуємо завантажити keypair з файлу
        let keypair_path = std::env::var("KEYPAIR_PATH")
            .unwrap_or_else(|_| "keypair.json".to_string());
        
        log::info!("Trying to load keypair from: {}", keypair_path);
        
        // Перевіряємо, чи існує файл
        if std::path::Path::new(&keypair_path).exists() {
            log::info!("Keypair file exists: {}", keypair_path);
        } else {
            log::info!("Keypair file does not exist, will create: {}", keypair_path);
        }

        match std::fs::read_to_string(&keypair_path) {
            Ok(keypair_data) => {
                log::info!("Successfully read keypair from: {}", keypair_path);
                let keypair_bytes: Vec<u8> = serde_json::from_str(&keypair_data)?;
                Ok(Keypair::from_bytes(&keypair_bytes)?)
            }
            Err(e) => {
                log::warn!("Failed to read keypair from {}: {}", keypair_path, e);
                // Якщо файл не існує, створюємо новий keypair
                let new_keypair = Keypair::new();
                let keypair_data = serde_json::to_string(&new_keypair.to_bytes().to_vec())?;
                std::fs::write(&keypair_path, keypair_data)?;
                log::info!("Created new keypair and saved to: {}", keypair_path);
                Ok(new_keypair)
            }
        }
    }

    // Завантаження або створення treasury keypair
    fn load_or_create_treasury_keypair() -> Result<Keypair> {
        // Використовуємо змінну середовища для шляху до файлу
        let treasury_keypair_path = std::env::var("TREASURY_KEYPAIR_PATH")
            .unwrap_or_else(|_| "treasury_keypair.json".to_string());
        
        log::info!("Trying to load treasury keypair from: {}", treasury_keypair_path);
        
        // Перевіряємо, чи існує файл
        if std::path::Path::new(&treasury_keypair_path).exists() {
            log::info!("Treasury keypair file exists: {}", treasury_keypair_path);
        } else {
            log::info!("Treasury keypair file does not exist, will create: {}", treasury_keypair_path);
        }

        match std::fs::read_to_string(&treasury_keypair_path) {
            Ok(keypair_data) => {
                let keypair_bytes: Vec<u8> = serde_json::from_str(&keypair_data)?;
                log::info!("Treasury keypair loaded from: {}", treasury_keypair_path);
                Ok(Keypair::from_bytes(&keypair_bytes)?)
            }
            Err(e) => {
                log::warn!("Failed to read treasury keypair from {}: {}", treasury_keypair_path, e);
                // Якщо файл не існує, створюємо новий keypair
                let new_keypair = Keypair::new();
                let keypair_data = serde_json::to_string(&new_keypair.to_bytes().to_vec())?;
                std::fs::write(&treasury_keypair_path, keypair_data)?;
                log::warn!("⚠️  NEW TREASURY KEYPAIR CREATED: {}", treasury_keypair_path);
                log::warn!("⚠️  TREASURY ADDRESS: {}", new_keypair.pubkey());
                log::warn!("⚠️  BACKUP THIS FILE SECURELY!");
                Ok(new_keypair)
            }
        }
    }

    pub fn generate_keypair(&self) -> Keypair {
        Keypair::new()
    }

    pub async fn get_balance(&self, pubkey: &Pubkey) -> Result<u64> {
        Ok(self.rpc_client.get_balance(pubkey).await?)
    }

    pub async fn get_account_info(&self, pubkey: &Pubkey) -> Result<Option<solana_sdk::account::Account>> {
        Ok(self.rpc_client.get_account(pubkey).await.ok())
    }

    pub async fn create_account(
        &self,
        payer: &Keypair,
        new_account: &Keypair,
        space: usize,
        program_id: &Pubkey,
    ) -> Result<String> {
        let instruction = system_instruction::create_account(
            &payer.pubkey(),
            &new_account.pubkey(),
            self.rpc_client.get_minimum_balance_for_rent_exemption(space).await?,
            space as u64,
            program_id,
        );

        let _recent_blockhash = self.rpc_client.get_latest_blockhash().await?;
        let transaction = Transaction::new_signed_with_payer(
            &[instruction],
            Some(&payer.pubkey()),
            &[payer, new_account],
            _recent_blockhash,
        );

        let signature = self.rpc_client.send_and_confirm_transaction(&transaction).await?;
        Ok(signature.to_string())
    }

    pub async fn transfer_sol(
        &self,
        from: &Keypair,
        to: &Pubkey,
        amount: u64,
    ) -> Result<String> {
        let instruction = system_instruction::transfer(
            &from.pubkey(),
            to,
            amount,
        );

        let _recent_blockhash = self.rpc_client.get_latest_blockhash().await?;
        let transaction = Transaction::new_signed_with_payer(
            &[instruction],
            Some(&from.pubkey()),
            &[from],
            _recent_blockhash,
        );

        let signature = self.rpc_client.send_and_confirm_transaction(&transaction).await?;
        Ok(signature.to_string())
    }

    pub async fn get_program_accounts(
        &self,
        program_id: &Pubkey,
    ) -> Result<Vec<(Pubkey, solana_sdk::account::Account)>> {
        Ok(self.rpc_client.get_program_accounts(program_id).await?)
    }

    pub async fn get_token_accounts_by_owner(
        &self,
        owner: &Pubkey,
    ) -> Result<Vec<solana_client::rpc_response::RpcKeyedAccount>> {
        Ok(self.rpc_client.get_token_accounts_by_owner(
            owner,
            TokenAccountsFilter::ProgramId(spl_token::id()),
        ).await?)
    }

    pub async fn get_nft_accounts_by_owner(
        &self,
        owner: &Pubkey,
    ) -> Result<Vec<solana_client::rpc_response::RpcKeyedAccount>> {
        Ok(self.rpc_client.get_token_accounts_by_owner(
            owner,
            TokenAccountsFilter::ProgramId(spl_token::id()),
        ).await?)
    }

    pub fn get_network() -> &'static str {
        "devnet"
    }

    pub fn get_explorer_url(signature: &str) -> String {
        format!("https://explorer.solana.com/tx/{}?cluster=devnet", signature)
    }

    pub fn get_solscan_url(signature: &str) -> String {
        format!("https://solscan.io/tx/{}?cluster=devnet", signature)
    }

    // Розрахунок комісій для створення NFT
    pub async fn calculate_nft_creation_cost(&self) -> Result<NftCreationCost> {
        let rent = self.rpc_client.get_minimum_balance_for_rent_exemption(82).await?; // Mint account size
        let token_account_cost = self.rpc_client.get_minimum_balance_for_rent_exemption(165).await?; // Token account size
        let metadata_account_cost = self.rpc_client.get_minimum_balance_for_rent_exemption(679).await?; // Metadata account size
        let transaction_fee = 5000; // Base transaction fee
        
        let total_cost = rent + token_account_cost + metadata_account_cost + transaction_fee;
        
        let service_fee = (total_cost as f64 * 0.2).ceil() as u64;
        let total_with_fee = total_cost + service_fee;
        let fee_recipient = std::env::var("FEE_RECIPIENT")
            .unwrap_or_else(|_| "your-wallet-address-here".to_string());
        
        Ok(NftCreationCost {
            mint_account: rent,
            token_account: token_account_cost,
            metadata_account: metadata_account_cost,
            transaction_fee,
            total_cost,
            sol_price: self.get_sol_price().await.unwrap_or(100.0),
            service_fee,
            total_with_fee,
            fee_recipient,
        })
    }

    // Розрахунок комісій для створення колекції
    pub async fn calculate_collection_creation_cost(&self) -> Result<NftCreationCost> {
        let rent = self.rpc_client.get_minimum_balance_for_rent_exemption(82).await?; // Mint account size
        let token_account_cost = self.rpc_client.get_minimum_balance_for_rent_exemption(165).await?; // Token account size
        let metadata_account_cost = self.rpc_client.get_minimum_balance_for_rent_exemption(679).await?; // Metadata account size
        let transaction_fee = 5000; // Base transaction fee
        
        let total_cost = rent + token_account_cost + metadata_account_cost + transaction_fee;
        
        let service_fee = (total_cost as f64 * 0.2).ceil() as u64;
        let total_with_fee = total_cost + service_fee;
        let fee_recipient = std::env::var("FEE_RECIPIENT")
            .unwrap_or_else(|_| "your-wallet-address-here".to_string());
        
        Ok(NftCreationCost {
            mint_account: rent,
            token_account: token_account_cost,
            metadata_account: metadata_account_cost,
            transaction_fee,
            total_cost,
            sol_price: self.get_sol_price().await.unwrap_or(100.0),
            service_fee,
            total_with_fee,
            fee_recipient,
        })
    }

    // Отримання ціни SOL (спрощена версія)
    async fn get_sol_price(&self) -> Result<f64> {
        // В реальному додатку тут буде API запит до CoinGecko або іншого сервісу
        // Поки що повертаємо фіксовану ціну
        Ok(100.0) // $100 за SOL
    }

    // Створення транзакції для підпису в браузері
    pub async fn create_nft_transaction(
        &self,
        instructions: Vec<solana_sdk::instruction::Instruction>,
        fee_payer: &Pubkey,
    ) -> Result<String> {
        let _recent_blockhash = self.rpc_client.get_latest_blockhash().await?;
        
        let message = Message::new(
            &instructions,
            Some(fee_payer),
        );
        
        let transaction = Transaction::new_unsigned(message);
        let serialized = bincode::serialize(&transaction)?;
        let encoded = BASE64_STANDARD.encode(serialized);
        
        Ok(encoded)
    }

    // Відправка підписаної транзакції
    pub async fn submit_signed_transaction(&self, signed_transaction_base64: &str) -> Result<String> {
        let decoded = BASE64_STANDARD.decode(signed_transaction_base64)?;
        let transaction: Transaction = bincode::deserialize(&decoded)?;
        
        let signature = self.rpc_client.send_and_confirm_transaction(&transaction).await?;
        Ok(signature.to_string())
    }

    // Створення інструкцій для NFT
    pub async fn create_nft_instructions(
        &self,
        metadata_uri: &str,
        name: &str,
        symbol: &str,
        fee_payer: &Pubkey,
        mint_pubkey: &Pubkey,
    ) -> Result<Vec<solana_sdk::instruction::Instruction>> {
        // 1. Створення mint account
        let mint_rent = self.rpc_client.get_minimum_balance_for_rent_exemption(spl_token::state::Mint::get_packed_len()).await?;
        let create_mint_ix = system_instruction::create_account(
            fee_payer,
            mint_pubkey,
            mint_rent,
            spl_token::state::Mint::get_packed_len() as u64,
            &spl_token_program_id(),
        );

        // 2. Initialize mint
        let init_mint_ix = token_instruction::initialize_mint(
            &spl_token_program_id(),
            mint_pubkey,
            fee_payer, // mint authority
            Some(fee_payer), // freeze authority
            0, // decimals
        )?;

        // 3. Create ATA for user
        let ata = get_associated_token_address(fee_payer, mint_pubkey);
        let create_ata_ix = ata_instruction::create_associated_token_account(
            fee_payer,
            fee_payer,
            mint_pubkey,
            &spl_token_program_id(),
        );

        // 4. Mint 1 token to ATA
        let mint_to_ix = token_instruction::mint_to(
            &spl_token_program_id(),
            mint_pubkey,
            &ata,
            fee_payer,
            &[],
            1,
        )?;

        // 5. Create Metadata & MasterEdition via Metaplex (новий API)
        let metadata_address = Metadata::find_pda(mint_pubkey).0;
        let master_edition_address = MasterEdition::find_pda(mint_pubkey).0;
        let create_nft_ix = CreateV1Builder::new()
            .metadata(metadata_address)
            .master_edition(Some(master_edition_address))
            .mint(*mint_pubkey, true)
            .authority(*fee_payer)
            .payer(*fee_payer)
            .update_authority(*fee_payer, true)
            .spl_token_program(Some(spl_token_program_id()))
            .name(name.to_string())
            .symbol(symbol.to_string())
            .uri(metadata_uri.to_string())
            .seller_fee_basis_points(500)
            .is_mutable(true)
            .print_supply(PrintSupply::Zero)
            .instruction();

        Ok(vec![
            create_mint_ix,
            init_mint_ix,
            create_ata_ix,
            mint_to_ix,
            create_nft_ix,
        ])
    }

    pub async fn create_nft_transaction_with_mint(
        &self,
        instructions: Vec<solana_sdk::instruction::Instruction>,
        fee_payer: &Pubkey,
        mint_keypair: &Keypair,
    ) -> Result<String> {
        let _recent_blockhash = self.rpc_client.get_latest_blockhash().await?;
        let message = Message::new(
            &instructions,
            Some(fee_payer),
        );
        let mut transaction = Transaction::new_unsigned(message);
        // Додаємо mint keypair як required signer (але не підписуємо тут)
        transaction.partial_sign(&[mint_keypair], _recent_blockhash);
        let serialized = bincode::serialize(&transaction)?;
        let encoded = BASE64_STANDARD.encode(serialized);
        Ok(encoded)
    }

    // Створення інструкцій для колекції
    pub async fn create_collection_instructions(
        &self,
        _metadata_uri: &str,
        _name: &str,
        _symbol: &str,
        fee_payer: &Pubkey,
    ) -> Result<Vec<solana_sdk::instruction::Instruction>> {
        // Тут буде логіка створення інструкцій для колекції через Metaplex
        // Поки що повертаємо заглушку
        let instructions = vec![
            system_instruction::transfer(
                fee_payer,
                fee_payer, // dummy transfer
                1000, // 0.001 SOL
            ),
        ];
        
        Ok(instructions)
    }

    // Отримання інформації про treasury
    pub async fn get_treasury_info(&self) -> Result<TreasuryWallet> {
        log::info!("Getting treasury info for address: {}", self.treasury_address);
        
        // Спробуємо отримати баланс з обробкою помилок
        let balance = match self.rpc_client.get_balance(&self.treasury_address).await {
            Ok(bal) => {
                log::info!("Treasury balance: {} lamports ({:.6} SOL)", bal, bal as f64 / 1_000_000_000.0);
                bal
            },
            Err(e) => {
                log::warn!("Failed to get treasury balance: {}", e);
                // Якщо не можемо отримати баланс, повертаємо 0
                0
            }
        };
        
        // В реальному додатку тут буде підрахунок total_collected_fees з бази даних
        let total_collected_fees = 0; // Placeholder
        
        let treasury_info = TreasuryWallet {
            treasury_address: self.treasury_address.to_string(),
            balance,
            total_collected_fees,
            owner_address: std::env::var("FEE_RECIPIENT")
                .unwrap_or_else(|_| "your-wallet-address-here".to_string()),
        };
        
        log::info!("Treasury info created successfully: {:?}", treasury_info);
        Ok(treasury_info)
    }
    
    // Створення інструкцій для NFT з fee transfer
    pub async fn create_nft_instructions_with_fee(
        &self,
        _metadata_uri: &str,
        _name: &str,
        _symbol: &str,
        fee_payer: &Pubkey,
        service_fee: u64,
    ) -> Result<Vec<solana_sdk::instruction::Instruction>> {
        // Розрахунок комісій для NFT
        let rent_exemption_amount = self.rpc_client.get_minimum_balance_for_rent_exemption(82).await?;
        let token_account_rent = self.rpc_client.get_minimum_balance_for_rent_exemption(165).await?;
        let metadata_rent = self.rpc_client.get_minimum_balance_for_rent_exemption(679).await?;
        
        log::info!("NFT creation costs:");
        log::info!("  Mint Account: {} lamports ({:.6} SOL)", rent_exemption_amount, rent_exemption_amount as f64 / 1_000_000_000.0);
        log::info!("  Token Account: {} lamports ({:.6} SOL)", token_account_rent, token_account_rent as f64 / 1_000_000_000.0);
        log::info!("  Metadata Account: {} lamports ({:.6} SOL)", metadata_rent, metadata_rent as f64 / 1_000_000_000.0);
        log::info!("  Transaction Fee: 5000 lamports (0.000005 SOL)");
        log::info!("  Service Fee: {} lamports ({:.6} SOL)", service_fee, service_fee as f64 / 1_000_000_000.0);
        
        let total_cost = rent_exemption_amount + token_account_rent + metadata_rent + 5000;
        log::info!("  Total Cost: {} lamports ({:.6} SOL)", total_cost, total_cost as f64 / 1_000_000_000.0);
        
        // Створюємо інструкції
        let mut instructions = vec![
            // Тут будуть реальні інструкції Metaplex для створення NFT
            // Поки що повертаємо dummy інструкцію
            system_instruction::transfer(
                fee_payer,
                fee_payer, // dummy transfer
                1000, // 0.001 SOL
            ),
        ];
        
        // Додаємо інструкцію переказу fee на treasury
        if service_fee > 0 {
            let fee_transfer_ix = system_instruction::transfer(
                fee_payer,
                &self.treasury_address,
                service_fee,
            );
            instructions.push(fee_transfer_ix);
            
            log::info!("Added fee transfer instruction: {} lamports to treasury", service_fee);
        }
        
        Ok(instructions)
    }
    
    // Вивід коштів з treasury (тільки власник)
    pub async fn withdraw_from_treasury(
        &self,
        amount: u64,
        recipient: &Pubkey,
        _owner_signature: &str, // Підпис власника для підтвердження
    ) -> Result<String> {
        // Перевіряємо, чи достатньо коштів
        let balance = self.rpc_client.get_balance(&self.treasury_address).await?;
        if balance < amount {
            return Err(anyhow!("Insufficient treasury balance: {} < {}", balance, amount));
        }
        
        // В реальному додатку тут буде перевірка підпису власника
        // Поки що просто логуємо
        log::info!("Withdrawing {} lamports from treasury to {}", amount, recipient);
        
        // Створюємо транзакцію виводу
        let withdraw_ix = system_instruction::transfer(
            &self.treasury_address,
            recipient,
            amount,
        );
        
        let _recent_blockhash = self.rpc_client.get_latest_blockhash().await?;
        let mut transaction = Transaction::new_with_payer(
            &[withdraw_ix],
            Some(&self.treasury_address),
        );
        transaction.message.recent_blockhash = _recent_blockhash;
        
        // Підписуємо транзакцію treasury keypair
        transaction.sign(&[&self.treasury_keypair], transaction.message.hash());
        
        // Відправляємо транзакцію
        let signature = self.rpc_client.send_and_confirm_transaction(&transaction).await?;
        
        log::info!("Treasury withdrawal successful: {}", signature);
        Ok(signature.to_string())
    }
    
    // Отримання балансу treasury
    pub async fn get_treasury_balance(&self) -> Result<u64> {
        let balance = self.rpc_client.get_balance(&self.treasury_address).await?;
        Ok(balance)
    }

    /// Створює інструкцію для прив'язки NFT до колекції (Metaplex)
    pub fn create_set_collection_instruction(
        &self,
        nft_mint: &Pubkey,
        collection_mint: &Pubkey,
        authority: &Pubkey,
    ) -> solana_sdk::instruction::Instruction {
        let nft_metadata = Metadata::find_pda(nft_mint).0;
        let collection_metadata = Metadata::find_pda(collection_mint).0;
        let collection_master_edition = MasterEdition::find_pda(collection_mint).0;

        set_and_verify_sized_collection_item(
            mpl_token_metadata::ID,
            nft_metadata,
            *authority,
            *authority,
            *collection_mint,
            collection_metadata,
            collection_master_edition,
            None, // collection authority record (optional)
        )
    }
} 