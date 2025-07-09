use anyhow::{Result, anyhow};
use solana_client::rpc_client::RpcClient;
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
    pub fn new() -> Result<Self> {
        // Підключаємося до Solana devnet
        let rpc_url = std::env::var("SOLANA_RPC_URL")
            .unwrap_or_else(|_| "https://api.devnet.solana.com".to_string());
        
        let rpc_client = RpcClient::new_with_commitment(
            rpc_url,
            CommitmentConfig::confirmed(),
        );

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

        match std::fs::read_to_string(&keypair_path) {
            Ok(keypair_data) => {
                let keypair_bytes: Vec<u8> = serde_json::from_str(&keypair_data)?;
                Ok(Keypair::from_bytes(&keypair_bytes)?)
            }
            Err(_) => {
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

        match std::fs::read_to_string(&treasury_keypair_path) {
            Ok(keypair_data) => {
                let keypair_bytes: Vec<u8> = serde_json::from_str(&keypair_data)?;
                log::info!("Treasury keypair loaded from: {}", treasury_keypair_path);
                Ok(Keypair::from_bytes(&keypair_bytes)?)
            }
            Err(_) => {
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

    pub fn get_balance(&self, pubkey: &Pubkey) -> Result<u64> {
        Ok(self.rpc_client.get_balance(pubkey)?)
    }

    pub fn get_account_info(&self, pubkey: &Pubkey) -> Result<Option<solana_sdk::account::Account>> {
        Ok(self.rpc_client.get_account(pubkey).ok())
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
            self.rpc_client.get_minimum_balance_for_rent_exemption(space)?,
            space as u64,
            program_id,
        );

        let _recent_blockhash = self.rpc_client.get_latest_blockhash()?;
        let transaction = Transaction::new_signed_with_payer(
            &[instruction],
            Some(&payer.pubkey()),
            &[payer, new_account],
            _recent_blockhash,
        );

        let signature = self.rpc_client.send_and_confirm_transaction(&transaction)?;
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

        let _recent_blockhash = self.rpc_client.get_latest_blockhash()?;
        let transaction = Transaction::new_signed_with_payer(
            &[instruction],
            Some(&from.pubkey()),
            &[from],
            _recent_blockhash,
        );

        let signature = self.rpc_client.send_and_confirm_transaction(&transaction)?;
        Ok(signature.to_string())
    }

    pub fn get_program_accounts(
        &self,
        program_id: &Pubkey,
    ) -> Result<Vec<(Pubkey, solana_sdk::account::Account)>> {
        Ok(self.rpc_client.get_program_accounts(program_id)?)
    }

    pub fn get_token_accounts_by_owner(
        &self,
        owner: &Pubkey,
    ) -> Result<Vec<solana_client::rpc_response::RpcKeyedAccount>> {
        Ok(self.rpc_client.get_token_accounts_by_owner(
            owner,
            TokenAccountsFilter::ProgramId(spl_token::id()),
        )?)
    }

    pub fn get_nft_accounts_by_owner(
        &self,
        owner: &Pubkey,
    ) -> Result<Vec<solana_client::rpc_response::RpcKeyedAccount>> {
        Ok(self.rpc_client.get_token_accounts_by_owner(
            owner,
            TokenAccountsFilter::ProgramId(spl_token::id()),
        )?)
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
        let rent = self.rpc_client.get_minimum_balance_for_rent_exemption(82)?; // Mint account size
        let token_account_cost = self.rpc_client.get_minimum_balance_for_rent_exemption(165)?; // Token account size
        let metadata_account_cost = self.rpc_client.get_minimum_balance_for_rent_exemption(679)?; // Metadata account size
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
        let rent = self.rpc_client.get_minimum_balance_for_rent_exemption(82)?; // Mint account size
        let token_account_cost = self.rpc_client.get_minimum_balance_for_rent_exemption(165)?; // Token account size
        let metadata_account_cost = self.rpc_client.get_minimum_balance_for_rent_exemption(679)?; // Metadata account size
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
        let _recent_blockhash = self.rpc_client.get_latest_blockhash()?;
        
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
        
        let signature = self.rpc_client.send_and_confirm_transaction(&transaction)?;
        Ok(signature.to_string())
    }

    // Створення інструкцій для NFT
    pub async fn create_nft_instructions(
        &self,
        _metadata_uri: &str,
        _name: &str,
        _symbol: &str,
        fee_payer: &Pubkey,
    ) -> Result<Vec<solana_sdk::instruction::Instruction>> {
        // Тут буде логіка створення інструкцій для NFT через Metaplex
        // Поки що повертаємо заглушку з реальними комісіями
        
        // Розрахунок комісій для NFT
        let rent_exemption_amount = self.rpc_client.get_minimum_balance_for_rent_exemption(82)?; // Mint account size
        let token_account_rent = self.rpc_client.get_minimum_balance_for_rent_exemption(165)?; // Token account size
        let metadata_rent = self.rpc_client.get_minimum_balance_for_rent_exemption(679)?; // Metadata account size
        
        log::info!("NFT creation costs:");
        log::info!("  Mint Account: {} lamports ({:.6} SOL)", rent_exemption_amount, rent_exemption_amount as f64 / 1_000_000_000.0);
        log::info!("  Token Account: {} lamports ({:.6} SOL)", token_account_rent, token_account_rent as f64 / 1_000_000_000.0);
        log::info!("  Metadata Account: {} lamports ({:.6} SOL)", metadata_rent, metadata_rent as f64 / 1_000_000_000.0);
        log::info!("  Transaction Fee: 5000 lamports (0.000005 SOL)");
        
        let total_cost = rent_exemption_amount + token_account_rent + metadata_rent + 5000;
        log::info!("  Total Cost: {} lamports ({:.6} SOL)", total_cost, total_cost as f64 / 1_000_000_000.0);
        
        // Створюємо реальні інструкції для NFT
        let instructions = vec![
            // Тут будуть реальні інструкції Metaplex для створення NFT
            // Поки що повертаємо dummy інструкцію
            system_instruction::transfer(
                fee_payer,
                fee_payer, // dummy transfer
                1000, // 0.001 SOL
            ),
        ];
        
        Ok(instructions)
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
        let balance = self.rpc_client.get_balance(&self.treasury_address)?;
        
        // В реальному додатку тут буде підрахунок total_collected_fees з бази даних
        let total_collected_fees = 0; // Placeholder
        
        Ok(TreasuryWallet {
            treasury_address: self.treasury_address.to_string(),
            balance,
            total_collected_fees,
            owner_address: std::env::var("FEE_RECIPIENT")
                .unwrap_or_else(|_| "your-wallet-address-here".to_string()),
        })
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
        let rent_exemption_amount = self.rpc_client.get_minimum_balance_for_rent_exemption(82)?;
        let token_account_rent = self.rpc_client.get_minimum_balance_for_rent_exemption(165)?;
        let metadata_rent = self.rpc_client.get_minimum_balance_for_rent_exemption(679)?;
        
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
        let balance = self.rpc_client.get_balance(&self.treasury_address)?;
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
        
        let _recent_blockhash = self.rpc_client.get_latest_blockhash()?;
        let mut transaction = Transaction::new_with_payer(
            &[withdraw_ix],
            Some(&self.treasury_address),
        );
        transaction.message.recent_blockhash = _recent_blockhash;
        
        // Підписуємо транзакцію treasury keypair
        transaction.sign(&[&self.treasury_keypair], transaction.message.hash());
        
        // Відправляємо транзакцію
        let signature = self.rpc_client.send_and_confirm_transaction(&transaction)?;
        
        log::info!("Treasury withdrawal successful: {}", signature);
        Ok(signature.to_string())
    }
    
    // Отримання балансу treasury
    pub async fn get_treasury_balance(&self) -> Result<u64> {
        let balance = self.rpc_client.get_balance(&self.treasury_address)?;
        Ok(balance)
    }
} 