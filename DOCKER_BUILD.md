# Docker Build Guide - Complete Build

## 🏗 Build Architecture

The project now builds completely in one process:

```
SPP/
├── backend/               # Rust Backend API
│   └── Dockerfile         # Docker for building (includes Anchor)
├── frontend/              # React Frontend
│   └── Dockerfile         # Docker for frontend
├── anchor/                # Anchor programs (built in backend Dockerfile)
│   ├── Anchor.toml        # Anchor configuration
│   └── programs/          # Solana smart contracts
├── docker-compose.yml     # Main configuration
└── build-and-run.sh       # Build script
```

## 🚀 Quick Start

### Automatic Build (recommended)
```bash
# Make script executable
chmod +x build-and-run.sh

# Run complete build
./build-and-run.sh
```

### Manual Build
```bash
# Build and run all services
docker-compose up --build -d
```

## 📦 Services

### 1. spp-backend
- **Purpose**: Rust API server + Anchor programs
- **Port**: 8080
- **Build Process**: 
  1. Installs Solana CLI 1.18
  2. Installs Anchor CLI 0.31.1
  3. Builds Anchor programs
  4. Builds Rust backend
  5. Copies built programs

### 2. spp-frontend
- **Purpose**: React application
- **Port**: 3000
- **Dependencies**: spp-backend

### 3. Additional Services
- **Redis**: Caching (port 6379)
- **PostgreSQL**: Database (port 5432)
- **Nginx**: Proxy server (port 80/443)

## 🔧 Useful Commands

### Complete Build
```bash
docker-compose up --build -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs spp-backend -f

# Frontend only
docker-compose logs spp-frontend -f
```

### Cleanup
```bash
# Stop all services
docker-compose down

# Remove volumes
docker-compose down -v

# Clear cache
docker system prune -f
```

### Restart
```bash
# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose up --build -d
```

## 📁 Volumes

### anchor-target
- **Purpose**: Built Anchor programs
- **Path**: `/app/programs` in backend
- **Source**: Built in backend Dockerfile

## ⚙️ Configuration

### Environment Variables for Backend
```env
RUST_LOG=info
SOLANA_RPC_URL=https://api.devnet.solana.com
BUNDLR_URL=https://node1.bundlr.network
KEYPAIR_PATH=/app/keypair.json
```

### Environment Variables for Frontend
```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_SOLANA_NETWORK=devnet
```

## 🐛 Troubleshooting

### Anchor Build Error
```bash
# Check backend logs
docker-compose logs spp-backend

# Rebuild backend
docker-compose build spp-backend --no-cache
```

### Dependency Error
```bash
# Clear cache
docker-compose down -v
docker system prune -f

# Restart build
./build-and-run.sh
```

### Network Issues
```bash
# Check network
docker network ls
docker network inspect spp_spp-network
```

## 🔄 Version Updates

### Anchor
1. Update version in `anchor/Anchor.toml`
2. Update version in `backend/Dockerfile`
3. Restart build

### Solana
1. Update version in `backend/Dockerfile`
2. Restart build

### Rust
1. Update version in `backend/Dockerfile`
2. Restart build

## 📊 Monitoring

### Service Status
```bash
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

### Image Size
```bash
docker images
```

## ⚡ Benefits of New Architecture

1. **Simplicity**: One command to build everything
2. **Speed**: Fewer steps, faster build
3. **Reliability**: Fewer places for errors
4. **Consistency**: All versions synchronized
5. **Convenience**: Easier deployment and maintenance 