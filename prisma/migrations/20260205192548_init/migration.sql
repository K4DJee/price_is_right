/*
  Warnings:

  - Added the required column `correctAnswer` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loser` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `p1Answer` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `p2Answer` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winner` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "correctAnswer" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "loser" TEXT NOT NULL,
ADD COLUMN     "p1Answer" TEXT NOT NULL,
ADD COLUMN     "p2Answer" TEXT NOT NULL,
ADD COLUMN     "winner" TEXT NOT NULL;
