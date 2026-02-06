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
else
    echo "❌ Error en backup"
    exit 1
fi