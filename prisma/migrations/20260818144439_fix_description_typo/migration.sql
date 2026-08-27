/*
  Warnings:

  - You are about to drop the column `Description` on the `User` table. All the data in the column will be lost.
  - Added the required column `description` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Description",
ADD COLUMN     "description" TEXT NOT NULL;
