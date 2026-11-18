-- La galería del portafolio ya no admite imágenes ocultas.
-- Solo afecta a las imágenes GENERAL; anuncios y campañas conservan su estado.
UPDATE "Imagen"
SET "activo" = true,
    "updatedAt" = NOW()
WHERE "tipo" = 'GENERAL'
  AND "activo" = false;
