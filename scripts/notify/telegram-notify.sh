#!/bin/bash
# Notificación a Telegram - Versión definitiva

set -e

TOKEN="$1"
CHAT_ID="$2"
MESSAGE="$3"

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


# Función para escapar caracteres Markdown
escape_markdown() {
    echo "$1" | sed -e 's/\*/\\*/g' -e 's/_/\\_/g' -e 's/\[/\\[/g' -e 's/\]/\\]/g' -e 's/`/\\`/g'
}

# Escapar título y mensaje
SAFE_MESSAGE=$(escape_markdown "$MESSAGE")

echo -e "${YELLOW}Enviando notificación a Telegram...${NC}" >&2

# Enviar
curl --max-time 10 --silent \
  -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${CHAT_ID}" \
  --data-urlencode "text=${SAFE_MESSAGE}" \
  -d "parse_mode=Markdown" > /dev/null 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Notificación enviada${NC}" >&2
else
    echo -e "${RED}❌ Error enviando notificación (curl exit code: $EXIT_CODE)${NC}" >&2
fi


exit 0
