#!/bin/bash

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 SPP Project - Build and Run Script${NC}"
echo "=================================="

# Перевіряємо, чи встановлений Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не встановлений. Будь ласка, встановіть Docker спочатку.${NC}"
    exit 1
fi

# Перевіряємо, чи встановлений Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose не встановлений. Будь ласка, встановіть Docker Compose спочатку.${NC}"
    exit 1
fi

# Функція для очищення
cleanup() {
    echo -e "${YELLOW}🧹 Очищення ресурсів...${NC}"
    docker-compose down
    docker system prune -f
}

# Обробка сигналів для коректного завершення
trap cleanup SIGINT SIGTERM

# Зупиняємо існуючі контейнери
echo -e "${YELLOW}🛑 Зупиняємо існуючі контейнери...${NC}"
docker-compose down

# Очищаємо стару збірку
echo -e "${YELLOW}🧹 Очищаємо стару збірку...${NC}"
docker system prune -f

# Збираємо та запускаємо всі сервіси
echo -e "${BLUE}🔨 Збираємо та запускаємо всі сервіси (Anchor + Backend + Frontend)...${NC}"
docker-compose up --build -d

# Перевіряємо, чи успішно зібралися сервіси
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Помилка збірки сервісів${NC}"
    exit 1
fi

# Чекаємо, поки сервіси запустяться
echo -e "${YELLOW}⏳ Чекаємо запуску сервісів...${NC}"
sleep 15

# Перевіряємо статус контейнерів
echo -e "${BLUE}📊 Статус контейнерів:${NC}"
docker-compose ps

# Перевіряємо логи бекенду
echo -e "${BLUE}📋 Логи бекенду:${NC}"
docker-compose logs spp-backend --tail=20

# Перевіряємо логи фронтенду
echo -e "${BLUE}📋 Логи фронтенду:${NC}"
docker-compose logs spp-frontend --tail=20

echo ""
echo -e "${GREEN}✅ Проект успішно запущений!${NC}"
echo ""
echo -e "${BLUE}🌐 Доступні сервіси:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:8080${NC}"
echo -e "   Backend Health: ${GREEN}http://localhost:8080/api/health${NC}"
echo ""
echo -e "${BLUE}🔧 Корисні команди:${NC}"
echo -e "   Переглянути логи: ${YELLOW}docker-compose logs -f${NC}"
echo -e "   Зупинити сервіси: ${YELLOW}docker-compose down${NC}"
echo -e "   Перезапустити: ${YELLOW}docker-compose restart${NC}"
echo -e "   Перезбирати: ${YELLOW}docker-compose up --build -d${NC}"
echo ""
echo -e "${YELLOW}💡 Для зупинки натисніть Ctrl+C${NC}"

# Чекаємо сигналу для завершення
wait 