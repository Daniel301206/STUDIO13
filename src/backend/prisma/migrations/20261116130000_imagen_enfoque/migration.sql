-- Punto focal por imagen para ajustar el encuadre en Inicio y Servicios.
-- Valores porcentuales (0-100); 50/50 mantiene el centro.
ALTER TABLE "Imagen"
  ADD COLUMN "enfoqueX" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN "enfoqueY" INTEGER NOT NULL DEFAULT 50;
