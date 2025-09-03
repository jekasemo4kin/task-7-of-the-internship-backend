-- DropForeignKey
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_itemId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
