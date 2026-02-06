#!/bin/bash
set -e

echo "========================================"
echo "🔄 SCRIPT DE RESTAURACIÓN - PRODUCCIÓN"
echo "========================================"

# Cargar variables
source .env 2>/dev/null || {
    echo "❌ No se encontró el archivo .env"
    exit 1
}

BACKUP_DIR="/backups"

# Listar backups
echo "📂 Backups disponibles:"
echo "----------------------------------------"

BACKUP_FILES=()
COUNT=1
for file in "$BACKUP_DIR"/*.sql.gz; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        date=$(stat -c %y "$file" | cut -d' ' -f1)
        time=$(stat -c %y "$file" | cut -d' ' -f2 | cut -d'.' -f1)
        echo "  $COUNT) $(basename "$file") - $size - $date $time"
        BACKUP_FILES[$COUNT]="$file"
        COUNT=$((COUNT + 1))
    fi
done

if [ ${#BACKUP_FILES[@]} -eq 0 ]; then
    echo "❌ No se encontraron backups en $BACKUP_DIR"
    exit 1
fi

echo "----------------------------------------"
read -p "Seleccione el número del backup a restaurar: " SELECTION

if [ -z "${BACKUP_FILES[$SELECTION]}" ]; then
    echo "❌ Selección inválida"
    exit 1
fi

SELECTED_FILE="${BACKUP_FILES[$SELECTION]}"
echo ""
echo "⚠️  ⚠️  ⚠️  ADVERTENCIA CRÍTICA ⚠️  ⚠️  ⚠️"
echo "ESTÁS EN PRODUCCIÓN"
echo "Esto RESTAURARÁ sobre la base de datos: $POSTGRES_DB"
echo "Se ELIMINARÁN todos los datos actuales"
echo "Backup seleccionado: $(basename "$SELECTED_FILE")"
echo ""
read -p "¿Está ABSOLUTAMENTE seguro? (escriba 'SI'): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    echo "❌ Restauración cancelada"
    exit 0
fi

echo ""
echo "🔒 Deteniendo aplicación..."
docker compose stop app || true

echo "🔄 Restaurando backup..."
START_TIME=$(date +%s)

# Restaurar
gunzip -c "$SELECTED_FILE" | docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

if [ $? -eq 0 ]; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo ""
    echo "✅ Restauración completada en ${DURATION} segundos"
    
    # Notificación de restauración
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d chat_id="${TELEGRAM_CHAT_ID}" \
            -d text="🔄 *BASE DE DATOS RESTAURADA*\n\nBase: \`${POSTGRES_DB}\`\nBackup: \`$(basename "$SELECTED_FILE")\`\nDuración: ${DURATION}s\nHora: $(date '+%d/%m/%Y %H:%M:%S')" \
            -d parse_mode="Markdown" > /dev/null 2>&1
    fi
    
    echo ""
    echo "📋 Pasos siguientes:"
    echo "   1. Verificar integridad de datos"
    echo "   2. Reiniciar aplicación"
    echo "   3. Monitorear logs"
    
    read -p "¿Reiniciar aplicación ahora? (s/n): " REINICIAR
    if [[ "$REINICIAR" =~ ^[Ss]$ ]]; then
        docker compose start app
        echo "🚀 Aplicación reiniciada"
    fi
    
else
    echo "❌ Error durante la restauración"
    
    # Reiniciar aplicación de todos modos
    docker compose start app || true
    echo "🚀 Aplicación reiniciada por seguridad"
    exit 1
fi