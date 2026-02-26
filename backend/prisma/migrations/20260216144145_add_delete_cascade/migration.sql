-- DropForeignKey
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_noteId_fkey";

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Quicknote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
