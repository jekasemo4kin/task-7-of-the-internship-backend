-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_inventoryId_fkey";

-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "itemId" TEXT,
ALTER COLUMN "inventoryId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Comment_itemId_idx" ON "public"."Comment"("itemId");

-- CreateIndex
CREATE INDEX "Comment_inventoryId_idx" ON "public"."Comment"("inventoryId");

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
