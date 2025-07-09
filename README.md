# Smart Product Passport (SPP) - Solana NFT System

Система для створення та управління цифровими паспортами продуктів на блокчейні Solana з використанням NFT та колекцій.

## 🚀 Особливості

- **Rust Backend**: Високопродуктивний API на Rust з Actix Web
- **React Frontend**: Сучасний UI з Tailwind CSS та Framer Motion
- **Solana Integration**: Повна інтеграція з Solana блокчейном
- **Wallet Signing**: Підпис транзакцій безпосередньо в браузерному гаманці
- **Metaplex Support**: Створення NFT та колекцій через Metaplex
- **Arweave Storage**: Завантаження зображень та metadata на Arweave
- **Docker Support**: Повна контейнеризація з Docker Compose
- **Anchor Programs**: Smart contracts на Rust з Anchor framework

## 🏗 Архітектура

```
SPP/
├── backend/                 # Rust Backend API
│   ├── src/
│   │   ├── main.rs         # Основний файл додатку
│   │   ├── nft_service.rs  # Сервіс для роботи з NFT
│   │   ├── collection_service.rs # Сервіс для колекцій
│   │   ├── solana_client.rs # Клієнт для Solana
│   │   └── upload_service.rs # Сервіс для завантаження
│   ├── Cargo.toml          # Rust залежності
│   ├── Dockerfile          # Docker конфігурація
│   └── README.md           # Документація бекенду
├── frontend/               # React Frontend
│   ├── app/
│   │   ├── src/
│   │   │   ├── components/ # React компоненти
│   │   │   ├── pages/      # Сторінки додатку
│   │   │   └── utils/      # Утиліти
│   │   ├── package.json    # Node.js залежності
│   │   └── Dockerfile      # Docker конфігурація
├── anchor/                 # Solana Smart Contracts
│   ├── programs/
│   │   └── smart-passport/ # Anchor програма
│   ├── Anchor.toml         # Anchor конфігурація
│   └── Cargo.toml          # Rust залежності
├── docker-compose.yml      # Docker Compose конфігурація
├── build-and-run.sh        # Скрипт для збірки та запуску
└── README.md               # Цей файл
```

## 📋 Вимоги

- Docker & Docker Compose
- Node.js 18+ (для локальної розробки)
- Rust 1.75+ (для локальної розробки)
- Solana CLI (для локальної розробки)
- Anchor CLI (для локальної розробки)

## 🛠 Швидкий старт

### 1. Клонування репозиторію
```bash
git clone <repository-url>
cd SPP
```

### 2. Запуск з Docker (рекомендовано)
```bash
# Зробити скрипт виконуваним (Linux/Mac)
chmod +x build-and-run.sh

# Запустити проект
./build-and-run.sh
```

### 3. Ручний запуск з Docker Compose
```bash
# Збірка та запуск всіх сервісів
docker-compose up --build -d

# Перегляд логів
docker-compose logs -f

# Зупинка сервісів
docker-compose down
```

## 🌐 Доступні сервіси

Після запуску будуть доступні:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Backend Health**: http://localhost:8080/api/health
- **PostgreSQL**: localhost:5432 (опціонально)
- **Redis**: localhost:6379 (опціонально)

## 🔧 Налаштування

### Змінні середовища

Створіть файл `.env` в корені проекту:

```env
# Backend Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
BUNDLR_URL=https://node1.bundlr.network
RUST_LOG=info

# Frontend Configuration
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_SOLANA_NETWORK=devnet

# Database Configuration (optional)
POSTGRES_DB=spp_db
POSTGRES_USER=spp_user
POSTGRES_PASSWORD=spp_password
```

### Створення Keypair

Для production створіть Solana keypair:

```bash
solana-keygen new --outfile backend/keypair.json
```

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### NFT Operations
```
POST /api/create-nft                    # Створення NFT (без підпису)
POST /api/create-nft-transaction        # Створення транзакції для підпису
GET /api/get-nfts?wallet_address=<address>
```

### Collection Operations
```
POST /api/create-collection             # Створення колекції (без підпису)
POST /api/create-collection-transaction # Створення транзакції для підпису
GET /api/get-collections?wallet_address=<address>
```

### Transaction Operations
```
POST /api/submit-signed-transaction     # Відправка підписаної транзакції
```

### Upload Operations
```
POST /api/upload-image
```

## 🧪 Тестування

### Backend Tests
```bash
cd backend
cargo test
```

### Frontend Tests
```bash
cd frontend/app
npm test
```

### Integration Tests
```bash
# Запустити всі сервіси
docker-compose up -d

# Тестувати API
curl http://localhost:8080/api/health
```

## 🐛 Debugging

### Логи
```bash
# Всі сервіси
docker-compose logs -f

# Тільки бекенд
docker-compose logs spp-backend -f

# Тільки фронтенд
docker-compose logs spp-frontend -f
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
# Збірка production образів
docker-compose -f docker-compose.prod.yml up --build -d
```

### Environment Variables для Production
```env
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
RUST_LOG=warn
NODE_ENV=production
```

## 🔒 Безпека

- **Wallet Signing**: Всі транзакції підписуються безпосередньо в браузерному гаманці
- **No Private Keys**: Бекенд не зберігає приватні ключі користувачів
- **Transaction Verification**: Кожна транзакція перевіряється перед відправкою
- **CORS Protection**: API endpoints захищені CORS
- **Input Validation**: Валідація всіх вхідних даних
- **Comprehensive Logging**: Логування всіх операцій
- **HTTPS in Production**: Безпечне з'єднання в production

## 🔐 Wallet Integration

Система підтримує два режими роботи:

### 1. Wallet Signing Mode (Рекомендовано)
- Транзакції створюються на бекенді
- Підписуються в браузерному гаманці (Phantom, Solflare, etc.)
- Максимальна безпека - приватні ключі залишаються у користувача

### 2. Backend Signing Mode
- Транзакції створюються та підписуються на бекенді
- Використовується для тестування та адміністративних операцій
- Потребує налаштування keypair на бекенді

## 🤝 Contributing

1. Fork репозиторій
2. Створіть feature branch (`git checkout -b feature/amazing-feature`)
3. Зробіть зміни
4. Додайте тести
5. Створіть Pull Request

## 📄 License

MIT License - дивіться LICENSE файл для деталей.

## 🆘 Підтримка

Якщо у вас є питання або проблеми:

1. Перевірте логи: `docker-compose logs`
2. Перевірте статус: `docker-compose ps`
3. Створіть Issue в репозиторії

## 🔗 Корисні посилання

- [Solana Documentation](https://docs.solana.com/)
- [Metaplex Documentation](https://docs.metaplex.com/)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Actix Web Documentation](https://actix.rs/)
- [React Documentation](https://reactjs.org/)
- [Docker Documentation](https://docs.docker.com/)

## 🎯 Roadmap

- [ ] Інтеграція з реальними Solana програмами
- [ ] Підтримка різних типів NFT
- [ ] Система ролей та дозволів
- [ ] Аналітика та звіти
- [ ] Мобільний додаток
- [ ] Інтеграція з іншими блокчейнами 