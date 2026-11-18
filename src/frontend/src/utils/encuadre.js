export const ENFOQUE_PREDETERMINADO = 50;

/**
 * Convierte cualquier valor recibido de la API en un porcentaje de encuadre
 * válido. Un 0 es un valor legítimo y no debe confundirse con "sin dato".
 */
export const normalizarEnfoque = (valor, predeterminado = ENFOQUE_PREDETERMINADO) => {
  if (valor === null || valor === undefined || valor === "") return predeterminado;
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return predeterminado;
  return Math.min(100, Math.max(0, Math.round(numero)));
};

export const normalizarEncuadre = (imagen) => ({
  enfoqueX: normalizarEnfoque(imagen?.enfoqueX),
  enfoqueY: normalizarEnfoque(imagen?.enfoqueY),
});

export const posicionEnfoque = (enfoqueX, enfoqueY) =>
  `${normalizarEnfoque(enfoqueX)}% ${normalizarEnfoque(enfoqueY)}%`;

/** Estilo para imágenes <img> que se recortan con object-fit: cover. */
export const estiloEnfoque = (imagen) => ({
  objectPosition: posicionEnfoque(imagen?.enfoqueX, imagen?.enfoqueY),
});
