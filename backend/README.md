# SPP Backend - Rust API

Бекенд для Smart Product Passport (SPP) системи, написаний на Rust з використанням Actix Web, Solana та Metaplex.

## 🚀 Особливості

- **Rust Backend**: Високопродуктивний API на Rust
- **Solana Integration**: Повна інтеграція з Solana блокчейном
- **Metaplex Support**: Створення NFT та колекцій через Metaplex
- **Arweave Upload**: Завантаження зображень та metadata на Arweave
- **Docker Support**: Повна підтримка Docker контейнеризації
- **REST API**: RESTful API для всіх операцій

## 📋 Вимоги

- Rust 1.75+
- Docker & Docker Compose
- Solana CLI (для локальної розробки)
- Anchor CLI (для локальної розробки)

## 🛠 Встановлення

### Локальна розробка

1. **Клонуйте репозиторій:**
```bash
git clone <repository-url>
cd SPP/backend
```

2. **Встановіть Rust залежності:**
```bash
cargo build
```

3. **Налаштуйте змінні середовища:**
```bash
cp .env.example .env
# Відредагуйте .env файл
```

4. **Запустіть бекенд:**
```bash
cargo run
```

### Docker

1. **З кореневої директорії проекту:**
```bash
docker-compose up --build spp-backend
```

2. **Або використовуйте скрипт:**
```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

## 🔧 Налаштування

### Змінні середовища

Створіть файл `.env` в папці `backend/`:

```env
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Bundlr Configuration
BUNDLR_URL=https://node1.bundlr.network
BUNDLR_PRIVATE_KEY=your_private_key_here

# Server Configuration
RUST_LOG=info
PORT=8080

# Keypair Configuration
KEYPAIR_PATH=keypair.json
```

### Створення Keypair

Для production використовуйте існуючий keypair або створіть новий:

```bash
solana-keygen new --outfile keypair.json
```

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### NFT Operations
```
POST /api/create-nft
GET /api/get-nfts?wallet_address=<address>
```

### Collection Operations
```
POST /api/create-collection
GET /api/get-collections?wallet_address=<address>
```

### Upload Operations
```
POST /api/upload-image
```

## 🔌 Інтеграція з Frontend

Бекенд налаштований для роботи з React фронтендом. API endpoints доступні на:

- **Local**: `http://localhost:8080/api`
- **Docker**: `http://spp-backend:8080/api`

## 🏗 Архітектура

```
backend/
├── src/
│   ├── main.rs              # Основний файл додатку
│   ├── nft_service.rs       # Сервіс для роботи з NFT
│   ├── collection_service.rs # Сервіс для роботи з колекціями
│   ├── solana_client.rs     # Клієнт для Solana
│   └── upload_service.rs    # Сервіс для завантаження файлів
├── Cargo.toml               # Rust залежності
├── Dockerfile              # Docker конфігурація
└── README.md               # Цей файл
```

## 🧪 Тестування

### Unit Tests
```bash
cargo test
```

### Integration Tests
```bash
cargo test --test integration_tests
```

### API Tests
```bash
# Запустіть бекенд
cargo run

# В іншому терміналі
curl http://localhost:8080/api/health
```

## 🐛 Debugging

### Логи
```bash
# Локально
RUST_LOG=debug cargo run

# Docker
docker-compose logs spp-backend -f
```

### Solana Debug
```bash
# Перевірка балансу
solana balance --url devnet

# Перевірка транзакцій
solana confirm <transaction_signature> --url devnet
```

## 📦 Deployment

### Production Build
```bash
cargo build --release
```

### Docker Production
```bash
docker build -t spp-backend:latest .
docker run -p 8080:8080 spp-backend:latest
```

### Environment Variables для Production
```env
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
BUNDLR_URL=https://node1.bundlr.network
RUST_LOG=warn
```

## 🔒 Безпека

- Всі приватні ключі зберігаються в зашифрованому вигляді
- API endpoints захищені CORS
- Валідація всіх вхідних даних
- Логування всіх операцій

## 🤝 Contributing

1. Fork репозиторій
2. Створіть feature branch
3. Зробіть зміни
4. Додайте тести
5. Створіть Pull Request

## 📄 License

MIT License - дивіться LICENSE файл для деталей.

## 🆘 Підтримка

Якщо у вас є питання або проблеми:

1. Перевірте логи: `docker-compose logs spp-backend`
2. Перевірте статус: `docker-compose ps`
3. Створіть Issue в репозиторії

## 🔗 Корисні посилання

- [Solana Documentation](https://docs.solana.com/)
- [Metaplex Documentation](https://docs.metaplex.com/)
- [Actix Web Documentation](https://actix.rs/)
- [Rust Book](https://doc.rust-lang.org/book/)

## 🚀 Швидкий старт

### 1. Налаштування середовища

Скопіюйте файл конфігурації:
```bash
cp env.example .env
```

### 2. Налаштуйте .env файл

Відредагуйте `.env` файл з вашими налаштуваннями:

```bash
# Основні налаштування
ENVIRONMENT=development
SOLANA_RPC_URL=https://api.devnet.solana.com
TREASURY_KEYPAIR_PATH=./treasury_keypair.json
FEE_RECIPIENT=your-wallet-address-here
SERVICE_FEE_PERCENTAGE=0.2

# Сервер
SERVER_HOST=127.0.0.1
SERVER_PORT=3000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Створіть Treasury Wallet

```bash
# Створіть treasury keypair
solana-keygen new -o treasury_keypair.json

# Скопіюйте публічну адресу
solana-keygen pubkey treasury_keypair.json
```

### 4. Запуск

```bash
# Встановлення залежностей
cargo build

# Запуск сервера
cargo run
```

## 🔐 БЕЗПЕКА ПРИВАТНИХ КЛЮЧІВ

### ⚠️ КРИТИЧНО ВАЖЛИВО!

**Приватні ключі НЕ повинні потрапляти у Git репозиторій!**

### 📁 Файли які НЕ повинні бути в Git:
- `keypair.json` - основний keypair
- `treasury_keypair.json` - treasury keypair
- `*.pem`, `*.p12`, `*.pfx` - сертифікати
- `.env` - змінні середовища

### 🛡️ Правила безпеки:

1. **Ніколи не комітьте приватні ключі**
2. **Використовуйте .gitignore**
3. **Зберігайте ключі в безпечному місці**
4. **Використовуйте змінні середовища**

### 🔧 Налаштування:

#### 1. Створіть .env файл:
```bash
# .env (НЕ комітьте цей файл!)
SOLANA_RPC_URL=https://api.devnet.solana.com
KEYPAIR_PATH=/secure/path/to/keypair.json
TREASURY_KEYPAIR_PATH=/secure/path/to/treasury_keypair.json
```

#### 2. Створіть ключі в безпечному місці:
```bash
# Створіть директорію поза проектом
mkdir ~/secure-keys
cd ~/secure-keys

# Створіть treasury keypair
solana-keygen new -o treasury_keypair.json

# Скопіюйте публічну адресу
solana-keygen pubkey treasury_keypair.json
```

#### 3. Вкажіть шляхи в .env:
```bash
TREASURY_KEYPAIR_PATH=/home/user/secure-keys/treasury_keypair.json
```

### 🚨 Якщо ключі вже потрапили у Git:

1. **НЕМАЙДЕННО змініть ключі:**
```bash
solana-keygen new -o new_treasury_keypair.json
```

2. **Видаліть з Git історії:**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch treasury_keypair.json" \
  --prune-empty --tag-name-filter cat -- --all
```

3. **Очистіть кеш:**
```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 📋 Перевірка безпеки:

```bash
# Перевірте чи файли в .gitignore
git check-ignore keypair.json treasury_keypair.json

# Перевірте чи файли не відстежуються
git status --ignored
```

### 🔄 Для продакшену:

1. **Використовуйте Hardware Security Module (HSM)**
2. **Multi-signature wallets**
3. **Cloud KMS (AWS KMS, Google Cloud KMS)**
4. **Vault (HashiCorp Vault)**

### 📞 У разі проблем:

1. Немедленно змініть всі ключі
2. Перевірте логи на підозрілу активність
3. Зверніться до команди безпеки

---

**Пам'ятайте: Безпека приватних ключів - це ваша відповідальність!**

## 📚 Документація

- [Actix Web Documentation](https://actix.rs/)
- [Rust Book](https://doc.rust-lang.org/book/) 