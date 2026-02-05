/*
  Warnings:

  - You are about to drop the `_MatchToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MatchToUser" DROP CONSTRAINT "_MatchToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_MatchToUser" DROP CONSTRAINT "_MatchToUser_B_fkey";

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "users" TEXT[];

-- DropTable
DROP TABLE "_MatchToUser";
