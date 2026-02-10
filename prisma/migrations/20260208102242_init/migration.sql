/*
  Warnings:

  - The `p1Answer` column on the `matches` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `p2Answer` column on the `matches` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "matches" DROP COLUMN "p1Answer",
ADD COLUMN     "p1Answer" DOUBLE PRECISION,
DROP COLUMN "p2Answer",
ADD COLUMN     "p2Answer" DOUBLE PRECISION;
