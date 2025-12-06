/*
  Warnings:

  - You are about to drop the column `musculoId` on the `Semana` table. All the data in the column will be lost.
  - You are about to drop the column `semanaEjercicioId` on the `SerieRep` table. All the data in the column will be lost.
  - You are about to drop the column `semanaEjercicioId` on the `SerieTiempo` table. All the data in the column will be lost.
  - You are about to drop the `SemanaEjercicio` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ejercicioMusculoId` to the `SerieRep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ejercicioMusculoId` to the `SerieTiempo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Semana" DROP CONSTRAINT "Semana_musculoId_fkey";

-- DropForeignKey
ALTER TABLE "SemanaEjercicio" DROP CONSTRAINT "SemanaEjercicio_ejercicioId_fkey";

-- DropForeignKey
ALTER TABLE "SemanaEjercicio" DROP CONSTRAINT "SemanaEjercicio_semanaId_fkey";

-- DropForeignKey
ALTER TABLE "SerieRep" DROP CONSTRAINT "SerieRep_semanaEjercicioId_fkey";

-- DropForeignKey
ALTER TABLE "SerieTiempo" DROP CONSTRAINT "SerieTiempo_semanaEjercicioId_fkey";

-- AlterTable
ALTER TABLE "Semana" DROP COLUMN "musculoId";

-- AlterTable
ALTER TABLE "SerieRep" DROP COLUMN "semanaEjercicioId",
ADD COLUMN     "ejercicioMusculoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SerieTiempo" DROP COLUMN "semanaEjercicioId",
ADD COLUMN     "ejercicioMusculoId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "SemanaEjercicio";

-- CreateTable
CREATE TABLE "MusculoSemana" (
    "id" SERIAL NOT NULL,
    "semanaId" INTEGER NOT NULL,
    "musculoId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "MusculoSemana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EjercicioMusculo" (
    "id" SERIAL NOT NULL,
    "musculoSemanaId" INTEGER NOT NULL,
    "ejercicioId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "EjercicioMusculo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MusculoSemana" ADD CONSTRAINT "MusculoSemana_semanaId_fkey" FOREIGN KEY ("semanaId") REFERENCES "Semana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusculoSemana" ADD CONSTRAINT "MusculoSemana_musculoId_fkey" FOREIGN KEY ("musculoId") REFERENCES "Musculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjercicioMusculo" ADD CONSTRAINT "EjercicioMusculo_musculoSemanaId_fkey" FOREIGN KEY ("musculoSemanaId") REFERENCES "MusculoSemana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjercicioMusculo" ADD CONSTRAINT "EjercicioMusculo_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "Ejercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerieRep" ADD CONSTRAINT "SerieRep_ejercicioMusculoId_fkey" FOREIGN KEY ("ejercicioMusculoId") REFERENCES "EjercicioMusculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerieTiempo" ADD CONSTRAINT "SerieTiempo_ejercicioMusculoId_fkey" FOREIGN KEY ("ejercicioMusculoId") REFERENCES "EjercicioMusculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
