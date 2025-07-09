# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Копіюємо package files з app директорії
COPY app/package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо код з app директорії
COPY app/ .

# Збираємо додаток
RUN npm run build

# Production stage
FROM nginx:alpine

# Копіюємо зібраний додаток
COPY --from=build /app/dist /usr/share/nginx/html

# Копіюємо nginx конфігурацію
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Відкриваємо порт
EXPOSE 3000

# Запускаємо nginx
CMD ["nginx", "-g", "daemon off;"] 