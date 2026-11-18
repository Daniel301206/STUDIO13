import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../pages/Layout/Layout";
import imagenServicio from "../assets/imagen_alquiler.jpg";
import { estiloEnfoque, normalizarEncuadre } from "../utils/encuadre.js";

const API_BASE_URL = (import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001`).replace(/\/+$/, "");
const normalizarNombre = (value) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

const DURACION_IMAGEN_VISIBLE = 8000;
const DURACION_FUNDIDO_IMAGEN = 1500;

function useMovimientoReducido() {
  const [reducido, setReducido] = useState(() => typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const alCambiar = () => setReducido(consulta.matches);
    setReducido(consulta.matches);
    if (typeof consulta.addEventListener === "function") consulta.addEventListener("change", alCambiar);
    else consulta.addListener(alCambiar);
    return () => {
      if (typeof consulta.removeEventListener === "function") consulta.removeEventListener("change", alCambiar);
      else consulta.removeListener(alCambiar);
    };
  }, []);
  return reducido;
}

function ImagenRotativa({ imagenes, etiqueta }) {
  const [indice, setIndice] = useState(0);
  const [fundiendo, setFundiendo] = useState(false);
  const movimientoReducido = useMovimientoReducido();
  const total = imagenes.length;
  const firma = imagenes.map((imagen) => `${imagen.url}|${imagen.enfoqueX}|${imagen.enfoqueY}`).join("|");
  const indiceActual = total ? indice % total : 0;
  const imagenActual = imagenes[indiceActual];
  const imagenSiguiente = total > 1 ? imagenes[(indiceActual + 1) % total] : null;

  useEffect(() => {
    setIndice((actual) => (total ? actual % total : 0));
    setFundiendo(false);
  }, [firma, total]);

  useEffect(() => {
    if (!imagenSiguiente) return;
    const precarga = new Image();
    precarga.src = imagenSiguiente.url;
  }, [imagenSiguiente]);

  useEffect(() => {
    if (!imagenSiguiente || movimientoReducido) {
      setFundiendo(false);
      return undefined;
    }
    let temporizadorFundido;
    const temporizadorEspera = window.setTimeout(() => {
      setFundiendo(true);
      temporizadorFundido = window.setTimeout(() => {
        setIndice((actual) => (total ? (actual + 1) % total : 0));
        setFundiendo(false);
      }, DURACION_FUNDIDO_IMAGEN);
    }, DURACION_IMAGEN_VISIBLE);
    return () => {
      window.clearTimeout(temporizadorEspera);
      window.clearTimeout(temporizadorFundido);
    };
  }, [indiceActual, total, movimientoReducido, imagenSiguiente]);

  if (!imagenActual) return <div className="absolute inset-0 bg-linear-to-br from-[#302b29] to-[#111010]" aria-hidden="true" />;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {imagenSiguiente && <img src={imagenSiguiente.url} alt="" aria-hidden="true" style={estiloEnfoque(imagenSiguiente)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${fundiendo ? "opacity-100" : "opacity-0"}`} />}
      <img src={imagenActual.url} alt={etiqueta} style={estiloEnfoque(imagenActual)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${fundiendo ? "opacity-0" : "opacity-100"}`} />
    </div>
  );
}

const specialties = [
  {
    label: "Bodas",
    secciones: ["Bodas"],
    desc: "Cobertura completa del día. Desde la preparación hasta el último baile.",
  },
  {
    label: "Familia",
    secciones: ["Familia", "Fotos Familiares"],
    desc: "Momentos espontáneos, vínculos reales. Un ambiente cómodo para todos.",
  },
  {
    label: "Quinceañeros",
    secciones: ["Quinceañero"],
    desc: "Una etapa única, recuerdos para siempre. Sesiones y cobertura para celebrar tus quince años.",
  },
  {
    label: "Corporativa",
    secciones: ["Corporativa", "Corporativas"],
    desc: "Headshots, equipos, eventos. Imagen que proyecta profesionalismo.",
  },
  {
    label: "Eventos",
    secciones: ["Eventos"],
    desc: "Cobertura dinámica. La energía de cada celebración, capturada.",
  },
  {
    label: "Exteriores",
    secciones: ["Exteriores"],
    desc: "Luz natural, locaciones auténticas. El mundo como telón de fondo.",
  },
];

const steps = [
  { n: "01", title: "Planificación", note: "Concepto · locación · looks" },
  {
    n: "02",
    title: "Producción",
    note: "Iluminación · composición · dirección",
  },
  { n: "03", title: "Edición", note: "Selección · retoque · color" },
  { n: "04", title: "Entrega", note: "Galería privada · alta resolución" },
];

export default function Servicios() {
  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    let controller;
    const cargarGalerias = () => {
      if (document.visibilityState !== "visible") return;
      controller?.abort();
      const request = new AbortController();
      controller = request;
      fetch(`${API_BASE_URL}/api/imagenes`, { signal: request.signal, cache: "no-store" })
        .then((response) => response.ok ? response.json() : null)
        .then((listaImagenes) => {
          if (!request.signal.aborted && Array.isArray(listaImagenes)) setImagenes(listaImagenes);
        })
        .catch(() => {});
    };
    cargarGalerias();
    window.addEventListener("focus", cargarGalerias);
    document.addEventListener("visibilitychange", cargarGalerias);
    return () => {
      controller?.abort();
      window.removeEventListener("focus", cargarGalerias);
      document.removeEventListener("visibilitychange", cargarGalerias);
    };
  }, []);

  const imagenesPorServicio = useMemo(() => {
    const normalizarUrl = (url) => typeof url === "string" && url.startsWith("/uploads/") ? `${API_BASE_URL}${url}` : url;
    return Object.fromEntries(specialties.map(({ label, secciones }) => {
      const claves = secciones.map(normalizarNombre);
      const fotos = imagenes.filter((item) => item.activo !== false && item.servicio?.activo !== false && claves.includes(normalizarNombre(item.seccion || "")) && typeof item.url === "string" && item.url.trim());
      return [label, fotos.map((item) => ({
        id: item.id,
        url: normalizarUrl(item.url),
        ...normalizarEncuadre(item),
      })).filter((foto) => /^https?:\/\//i.test(foto.url) || foto.url.startsWith(`${API_BASE_URL}/uploads/`))];
    }));
  }, [imagenes]);

  return (
    <Layout>
      <div className="bg-white">
        {/* ── PAGE HEADER ── */}
        <header className="py-20 px-12 pb-12 border-b border-[rgba(26,24,24,0.08)]">
          <p className="t-label mb-6">Servicios</p>

          <h1 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(3rem,6vw,5.5rem)] tracking-[0.02em] leading-none text-[#1a1818] max-w-175">
            Lo que
            <br />
            fotografiamos
          </h1>
        </header>

        {/* ── SPECIALTIES ── */}
        {specialties.map((s, i) => (
          <section
            key={s.label}
            className="relative h-[clamp(380px,55vw,680px)] overflow-hidden bg-[#1a1818]"
          >
            <ImagenRotativa imagenes={imagenesPorServicio[s.label]} etiqueta={s.label} />

            {/* Degradado lateral en escritorio y desde abajo en móvil: oscurece la zona del texto, no toda la foto. */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 ${
                i % 2 === 0
                  ? "bg-linear-to-t from-[rgba(12,11,11,0.78)] via-[rgba(12,11,11,0.25)] to-transparent lg:bg-linear-to-r lg:from-[rgba(12,11,11,0.8)] lg:via-[rgba(12,11,11,0.3)] lg:to-transparent"
                  : "bg-linear-to-t from-[rgba(12,11,11,0.78)] via-[rgba(12,11,11,0.25)] to-transparent lg:bg-linear-to-l lg:from-[rgba(12,11,11,0.8)] lg:via-[rgba(12,11,11,0.3)] lg:to-transparent"
              }`}
            />

            {/* Texto superpuesto: abajo en móvil, a un lado en escritorio. */}
            <div
              className={`absolute bottom-0 left-0 right-0 max-w-none px-6 pb-8 sm:px-10 sm:pb-10 lg:top-1/2 lg:bottom-auto lg:max-w-95 lg:-translate-y-1/2 lg:px-0 lg:pb-0 ${
                i % 2 === 0 ? "lg:left-16" : "lg:right-16 lg:left-auto"
              }`}
            >
              <p className="font-['Inter'] font-normal text-[0.6rem] tracking-[0.28em] uppercase text-[rgba(244,243,240,0.55)] mb-3">
                {String(i + 1).padStart(2, "0")} /{" "}
                {String(specialties.length).padStart(2, "0")}
              </p>

              <h2 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(2rem,5vw,4.5rem)] tracking-[0.04em] text-white leading-none mb-4">
                {s.label}
              </h2>

              <span className="block w-6 h-px bg-[#a51c1c] mb-4" />

              <p className="font-['Inter'] font-light text-[0.8rem] text-[rgba(244,243,240,0.72)] leading-[1.65] tracking-[0.04em]">
                {s.desc}
              </p>
            </div>
          </section>
        ))}

        {/* ── PROCESS ── */}
        <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-340">
            <div className="mb-10 flex flex-col items-start gap-4 sm:mb-16 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="t-label">¿Cómo trabajamos?</p>

              <Link to="/contacto" className="btn-ghost">
                Agendar sesión
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:border-l lg:border-[rgba(26,24,24,0.1)]">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className="border-b border-[rgba(26,24,24,0.1)] py-6 last:border-b-0 sm:px-6 sm:py-7 lg:border-b-0 lg:border-r lg:px-10 lg:py-8"
                >
                  <p className="mb-3 font-[Fraunces,Georgia,serif] text-[2.25rem] font-extralight italic leading-none text-[rgba(26,24,24,0.08)] sm:text-[2.6rem] lg:mb-4 lg:text-[3rem]">
                    {s.n}
                  </p>

                  <h3 className="mb-2 font-[Fraunces,Georgia,serif] text-[1.05rem] font-light leading-snug tracking-[0.06em] text-[#1a1818] sm:text-[1.1rem] lg:text-[1.2rem]">
                    {s.title}
                  </h3>

                  <p className="t-body text-[0.78rem] leading-relaxed">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STUDIO RENTAL ── */}
        <section className="relative h-[clamp(400px,55vw,650px)] overflow-hidden bg-[#1a1818]">
          <img
            src={imagenServicio}
            alt="Estudio fotográfico profesional Studio13"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.55]"
          />

          <div className="absolute inset-0 bg-linear-to-r from-[rgba(12,11,11,0.85)] from-35% to-transparent to-75%" />

          <div className="absolute top-1/2 -translate-y-1/2 left-16 max-w-110">
            <p className="font-['Inter'] font-normal text-[0.6rem] tracking-[0.28em] uppercase text-[rgba(244,243,240,0.4)] mb-4">
              También disponible
            </p>

            <h2 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(2rem,4vw,3.8rem)] text-white leading-[1.05] mb-6 tracking-[0.03em]">
              Alquiler de
              <br />
              estudio
            </h2>

            <p className="font-['Inter'] font-light text-[0.82rem] text-[rgba(244,243,240,0.55)] leading-[1.7] mb-8">
              Iluminación profesional, fondos múltiples, área de maquillaje.
              Disponible por hora o día completo para fotógrafos independientes
              y marcas.
            </p>

            <Link to="/paquetes" className="btn-ghost-white">
              Ver tarifas
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
