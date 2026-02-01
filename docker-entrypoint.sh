#!/bin/sh
set -e

# Generar Prisma Client si no existe
if [ ! -f "/app/node_modules/.prisma/client/index.js" ]; then
    echo "Generating Prisma Client..."
    pnpm prisma generate
fi

# Ejecutar migraciones en tiempo real (opcional)
# pnpm prisma migrate deploy

# Ejecutar el comando principal
exec "$@"