# Використовуємо офіційний Rust образ
FROM rust:1.87-slim as builder

# Встановлюємо залежності для збірки з retry логікою
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    curl \
    build-essential \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Встановлюємо Solana CLI (beta)
RUN sh -c "$(curl -sSfL https://release.solana.com/beta/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Встановлюємо Rust toolchain для Solana
RUN rustup component add rust-src && \
    rustup target add wasm32-unknown-unknown

# Встановлюємо Solana BPF toolchain
RUN rustup target add sbfel-unknown-unknown || \
    rustup target add bpfel-unknown-unknown

# Встановлюємо Anchor CLI
RUN cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

# Встановлюємо Node.js залежності для тестів
RUN npm install -g ts-mocha typescript

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо всі необхідні файли для збірки
COPY anchor/Cargo.toml anchor/Cargo.lock ./anchor/
COPY anchor/Anchor.toml ./anchor/
COPY anchor/package.json anchor/package-lock.json ./anchor/
COPY anchor/programs ./anchor/programs/
COPY backend/Cargo.toml backend/Cargo.lock ./backend/
COPY backend/src ./backend/src/

# Збираємо Anchor програми
WORKDIR /app/anchor
RUN npm install
RUN anchor build

# Збираємо Rust бекенд
WORKDIR /app/backend
RUN cargo build --release

# Фінальний образ
FROM debian:bullseye-slim

# Встановлюємо runtime залежності з retry логікою
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    bash \
    build-essential \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Встановлюємо Solana CLI в production образ
RUN sh -c "$(curl -sSfL https://release.solana.com/beta/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Встановлюємо Rust та BPF toolchain в production образ
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup target add sbfel-unknown-unknown || rustup target add bpfel-unknown-unknown

# Встановлюємо PATH для Solana та Rust
ENV PATH="/root/.local/share/solana/install/active_release/bin:/usr/local/bin:${PATH}"

# Копіюємо зібрані програми
COPY --from=builder /app/backend/target/release/spp-backend /app/spp-backend
COPY --from=builder /app/anchor/target /app/programs

# Копіюємо Solana та Anchor CLI з build stage
COPY --from=builder /root/.local/share/solana /root/.local/share/solana
COPY --from=builder /root/.cargo/bin/anchor /usr/local/bin/anchor
COPY --from=builder /root/.cargo/bin/cargo /usr/local/bin/cargo
COPY --from=builder /root/.cargo/bin/rustc /usr/local/bin/rustc
COPY --from=builder /root/.cargo/bin/rustup /usr/local/bin/rustup

# Встановлюємо правильні права доступу
RUN chmod +x /app/spp-backend

# Встановлюємо робочу директорію
WORKDIR /app

# Відкриваємо порт
EXPOSE 8080

# Запускаємо бекенд
CMD ["./spp-backend"] 