#!/bin/bash
# Notificación a Telegram - Versión definitiva

set -e

TOKEN="$1"
CHAT_ID="$2"
TITLE="$3"
MESSAGE="$4"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validar
if [ -z "$TOKEN" ]; then
    echo -e "${RED}ERROR: No se proporcionó token de Telegram${NC}" >&2
    exit 1
fi

if [ -z "$CHAT_ID" ]; then
    echo -e "${RED}ERROR: No se proporcionó Chat ID${NC}" >&2
    exit 1
fi

# Construir mensaje completo
if [ -n "$TITLE" ]; then
    FULL_MESSAGE="*${TITLE}*

${MESSAGE}"
else
    FULL_MESSAGE="$MESSAGE"
fi

echo -e "${YELLOW}Enviando notificación a Telegram...${NC}" >&2

# URL encode (solo caracteres problemáticos)
ENCODED_MESSAGE=$(echo "$FULL_MESSAGE" | \
    sed 's/\\/\\\\/g' | \
    sed 's/"/\\"/g' | \
    jq -Rs . | cut -c 2- | rev | cut -c 2- | rev 2>/dev/null || \
    echo "$FULL_MESSAGE" | sed 's/"/\\"/g')

# Crear JSON
JSON_DATA="{\"chat_id\":\"$CHAT_ID\",\"text\":\"$ENCODED_MESSAGE\",\"parse_mode\":\"Markdown\"}"

# Enviar
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "$JSON_DATA" \
    --max-time 10)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
    if echo "$RESPONSE_BODY" | grep -q '"ok":true'; then
        echo -e "${GREEN}✅ Notificación enviada exitosamente${NC}" >&2
    else
        ERROR=$(echo "$RESPONSE_BODY" | grep -o '"description":"[^"]*"' | cut -d'"' -f4)
        echo -e "${RED}❌ Error de Telegram: $ERROR${NC}" >&2
    fi
else
    echo -e "${RED}❌ Error HTTP $HTTP_CODE${NC}" >&2
    echo "$RESPONSE_BODY" >&2
fi 
exit 0