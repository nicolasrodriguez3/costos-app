/*
  Warnings:

  - The values [COMPRA,AJUSTE,RETIRO,DEVOLUCION] on the enum `StockMovementType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `referenceType` on the `StockMovement` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StockMovementType_new" AS ENUM ('PURCHASE', 'AJUSTMENT', 'SALE', 'RETURN');
ALTER TABLE "StockMovement" ALTER COLUMN "type" TYPE "StockMovementType_new"
  USING (
    CASE "type"::text
      WHEN 'COMPRA' THEN 'PURCHASE'
      WHEN 'AJUSTE' THEN 'AJUSTMENT'
      WHEN 'RETIRO' THEN 'SALE'
      WHEN 'DEVOLUCION' THEN 'RETURN'
      ELSE "type"::text
    END
  )::"StockMovementType_new";
ALTER TYPE "StockMovementType" RENAME TO "StockMovementType_old";
ALTER TYPE "StockMovementType_new" RENAME TO "StockMovementType";
DROP TYPE "public"."StockMovementType_old";
COMMIT;

-- AlterTable
ALTER TABLE "StockMovement" DROP COLUMN "referenceType",
ALTER COLUMN "type" DROP NOT NULL;

-- DropEnum
DROP TYPE "ReferenceType";
