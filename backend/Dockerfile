# Використовуємо офіційний Rust образ
FROM rust:1.87-slim as builder

# Встановлюємо залежності для збірки
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    curl \
    build-essential \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Встановлюємо Solana CLI
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)" && \
    ln -s /root/.local/share/solana/install/active_release/bin/solana /usr/local/bin/solana

# Встановлюємо Anchor CLI
RUN cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

# Встановлюємо Node.js залежності для тестів
RUN npm install -g ts-mocha typescript

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо файли проекту
COPY . .

# Збираємо Anchor програми
WORKDIR /app/anchor
RUN npm install
RUN anchor build

# Збираємо Rust бекенд
WORKDIR /app/backend
RUN cargo build --release

# Фінальний образ
FROM debian:bullseye-slim

# Встановлюємо runtime залежності
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копіюємо зібрані програми
COPY --from=builder /app/backend/target/release/spp-backend /app/spp-backend
COPY --from=builder /app/anchor/target /app/programs

# Встановлюємо робочу директорію
WORKDIR /app

# Відкриваємо порт
EXPOSE 8080

# Запускаємо бекенд
CMD ["./spp-backend"] 