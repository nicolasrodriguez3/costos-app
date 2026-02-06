#!/bin/sh
# Enviar notificación a Telegram con timeout

TOKEN=$1
CHAT_ID=$2
MESSAGE=$3
TIMEOUT=${4:-5}

if [ -z "$TOKEN" ] || [ -z "$CHAT_ID" ] || [ -z "$MESSAGE" ]; then
    exit 0
fi

# Usar timeout para evitar bloqueos
timeout $TIMEOUT curl --silent \
  -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -d chat_id="${CHAT_ID}" \
  -d text="${MESSAGE}" \
  -d parse_mode="Markdown" > /dev/null 2>&1

exit 0  # Siempre exit 0 para no romper el backup principal