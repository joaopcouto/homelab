/*
  Warnings:

  - Added the required column `noteId` to the `Todo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "noteId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Quicknote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
