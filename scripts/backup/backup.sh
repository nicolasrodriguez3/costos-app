#!/bin/sh
set -e

# Cargar variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Configuración
BACKUP_DIR="/backups"
DB_HOST="db"
DB_USER="${POSTGRES_USER}"
DB_NAME="${POSTGRES_DB}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
MAX_BACKUPS="${MAX_BACKUPS:-10}"
export PGPASSWORD="${POSTGRES_PASSWORD}"

# Crear directorio
mkdir -p "$BACKUP_DIR"

# Backup
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_$DATE.sql.gz"

echo "=== BACKUP PRODUCCIÓN ==="
echo "Base: $DB_NAME"
echo "Archivo: $BACKUP_FILE"

# Ejecutar backup
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --clean --if-exists | gzip -9 > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup completado: $BACKUP_SIZE"
    
    # Limpieza
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Listar
    echo "=== BACKUPS ==="
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No hay backups"

    # Enviar notificación a Telegram si está configurado
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ] && [ "${ENABLE_NOTIFICATIONS:-false}" = "true" ]; then
        echo "📱 Enviando notificación a Telegram..."
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d chat_id="${TELEGRAM_CHAT_ID}" \
            -d text="✅ *BACKUP COMPLETADO*\n\nBase: \`$${DB_NAME}\`\nArchivo: \`$(basename "$${BACKUP_FILE}")\`\nTamaño: $${BACKUP_SIZE}\nHora: $(date '+%d/%m/%Y %H:%M:%S')\n\n💾 Retención: $${RETENTION_DAYS} días" \
            -d parse_mode="Markdown" > /dev/null 2>&1
    fi
    echo "🎉 BACKUP FINALIZADO CON ÉXITO"
else
    echo "❌ Error en backup"

    # Notificación de error a Telegram
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ] && [ "${ENABLE_NOTIFICATIONS:-false}" = "true" ]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d chat_id="${TELEGRAM_CHAT_ID}" \
            -d text="❌ *ERROR EN BACKUP*

🏷️ Base: \`${DB_NAME}\`
🕐 Hora: $(date '+%d/%m/%Y %H:%M:%S')
⚠️ Error al crear backup
🔧 Verificar logs del servidor" \
            -d parse_mode="Markdown" > /dev/null 2>&1
    fi

    exit 1
fi