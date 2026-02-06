#!/bin/bash

echo "📊 MONITOR DE BACKUPS - PRODUCCIÓN"
echo "=================================="

# Cargar variables
source .env 2>/dev/null || echo "⚠️  No se encontró .env, usando valores por defecto"

BACKUP_DIR="/backups"
LOG_FILE="/var/log/postgres-backup.log"

# 1. Verificar espacio
echo "1. 📦 ESPACIO EN DISCO:"
df -h /backups | tail -1
echo ""

# 2. Listar backups
echo "2. 💾 BACKUPS DISPONIBLES:"
if [ -d "$BACKUP_DIR" ]; then
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
    
    echo "   Total: $BACKUP_COUNT backups"
    echo "   Tamaño total: $TOTAL_SIZE"
    echo ""
    
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        echo "   Últimos 5 backups:"
        ls -1t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -5 | while read -r file; do
            size=$(du -h "$file" | cut -f1)
            date=$(stat -c %y "$file" | cut -d' ' -f1)
            echo "   - $(basename "$file") ($size) - $date"
        done
    else
        echo "   ⚠️  No hay backups"
    fi
else
    echo "   ❌ Directorio $BACKUP_DIR no existe"
fi
echo ""

# 3. Verificar logs
echo "3. 📝 ÚLTIMOS LOGS:"
if [ -f "$LOG_FILE" ]; then
    echo "   Últimas 10 líneas del log:"
    tail -10 "$LOG_FILE" | sed 's/^/   /'
else
    echo "   ⚠️  Archivo de log no encontrado"
fi
echo ""

# 4. Verificar cron
echo "4. ⏰ CRON JOBS:"
crontab -l 2>/dev/null | grep -E "(backup|ejecutar-backup)" || echo "   ⚠️  No se encontraron jobs de backup"
echo ""

# 5. Verificar integridad del último backup (opcional)
echo "5. 🔍 VERIFICAR ÚLTIMO BACKUP:"
LAST_BACKUP=$(ls -1t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -1)
if [ -n "$LAST_BACKUP" ]; then
    echo "   Último backup: $(basename "$LAST_BACKUP")"
    
    # Verificar que no esté corrupto
    if gunzip -t "$LAST_BACKUP" 2>/dev/null; then
        echo "   ✅ Integridad: OK"
    else
        echo "   ❌ Integridad: CORRUPTO"
    fi
else
    echo "   No hay backups para verificar"
fi
echo ""

echo "=================================="
echo "✅ Monitoreo completado"