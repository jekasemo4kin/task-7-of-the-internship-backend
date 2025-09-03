/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."CategoryType" AS ENUM ('FURNITURE', 'APPLIANCES', 'TRANSPORT', 'FOOD', 'CHEMICALS', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."Inventory" DROP CONSTRAINT "Inventory_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."Inventory" DROP COLUMN "categoryId",
ADD COLUMN     "category" "public"."CategoryType" NOT NULL DEFAULT 'OTHER';

-- DropTable
DROP TABLE "public"."Category";
