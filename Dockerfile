# Используем официальный образ Node.js
FROM node:22-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Сначала копируем package.json
COPY ./frontend/package*.json ./

# Устанавливаем зависимости проекта
RUN npm install --force

# Копируем остальные файлы
COPY ./frontend .

# Собираем Next.js приложение
RUN npm run build

# Используем официальный образ Node.js
FROM node:22-alpine AS production

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем остальные файлы
COPY --from=builder /usr/src/app/ ./
#COPY --from=builder /usr/src/app/.next ./.next
#COPY --from=builder /usr/src/app/package*.json ./
#COPY --from=builder /usr/src/app/public ./public
#COPY --from=builder /usr/src/app/next.config.ts ./

# Устанавливаем next глобально
RUN npm install next -g

# Открываем порт 443 (HTTP)
EXPOSE 3000

# Запускаем serve на 0.0.0.0:443
#CMD ["sh", "-c", "tail -f /dev/null"]
CMD ["sh", "-c", "next start -p 3000"]
#CMD ["sh", "-c", "next dev --experimental-https --experimental-https-cert /etc/certificates/Letsencrypt/live/moondex.trade/fullchain.pem --experimental-https-key /etc/certificates/Letsencrypt/live/moondex.tr"]
#CMD ["npx serve dist --ssl-cert /etc/certificates/live/avocado-messenger.online/fullchain.pem --ssl-key /etc/certificates/live/avocado-messenger.online/key.pem -p 443"]
