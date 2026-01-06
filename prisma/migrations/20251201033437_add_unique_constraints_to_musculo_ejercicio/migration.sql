/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Ejercicio` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `Musculo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ejercicio_nombre_key" ON "Ejercicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Musculo_nombre_key" ON "Musculo"("nombre");
