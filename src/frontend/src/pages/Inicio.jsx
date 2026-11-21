import { useEffect, useMemo, useState } from "react";
import Layout from "../pages/Layout/Layout.jsx";
import studio13Logo from "../assets/studio13_blanco.png";
import imagenHero from "../assets/imagen_Inicio01.png";
import imagenFotografias01 from "../assets/imagen_fotografias01.jpg";
import imagenFotografias02 from "../assets/imagen_fotografias02.jpg";
import imagenFotografias03 from "../assets/imagen_fotografias03.jpg";
import { Link } from "react-router-dom";
import Testimonios from "../Components/Testimonios.jsx";
import AnuncioEmergente from "../Components/AnuncioEmergente.jsx";
import CampaniaTemporada from "../Components/CampaniaTemporada.jsx";
import { estiloEnfoque, normalizarEncuadre } from "../utils/encuadre.js";

const API_BASE_URL = (import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001`).replace(/\/+$/, "");
const normalizarNombre = (value) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
const mismosDatos = (anterior, siguiente) => JSON.stringify(anterior) === JSON.stringify(siguiente);

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
      {imagenSiguiente && <img src={imagenSiguiente.url} alt="" aria-hidden="true" style={estiloEnfoque(imagenSiguiente)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1500 ease-in-out ${fundiendo ? "opacity-100" : "opacity-0"}`} />}
      <img src={imagenActual.url} alt={etiqueta} style={estiloEnfoque(imagenActual)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1500 ease-in-out ${fundiendo ? "opacity-0" : "opacity-100"}`} />
    </div>
  );
}

const categories = [
  { label: "Bodas", secciones: ["Bodas"] },
  { label: "Familia", secciones: ["Familia", "Fotos Familiares"] },
  { label: "Quinceañeros", secciones: ["Quinceañero"], filtro: "Quinceañero" },
  { label: "Corporativa", secciones: ["Corporativa", "Corporativas"] },
  { label: "Exteriores", secciones: ["Exteriores"] },
];

const Inicio = () => {
  const [imagenes, setImagenes] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [anuncioAbierto, setAnuncioAbierto] = useState(null);
  useEffect(() => {
    let controller;
    const actualizarGaleria = async () => {
      if (document.visibilityState !== "visible") return;
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        const options = { signal: request.signal, cache: "no-store" };
        const response = await fetch(`${API_BASE_URL}/api/imagenes`, options);
        if (!response.ok) return;
        const listaImagenes = await response.json();
        if (!request.signal.aborted && Array.isArray(listaImagenes)) setImagenes(listaImagenes);
      } catch { /* conserva las imágenes actuales si la red no está disponible */ }
    };
    actualizarGaleria();
    window.addEventListener("focus", actualizarGaleria);
    document.addEventListener("visibilitychange", actualizarGaleria);
    return () => { controller?.abort(); window.removeEventListener("focus", actualizarGaleria); document.removeEventListener("visibilitychange", actualizarGaleria); };
  }, []);

  useEffect(() => {
    let controller = null;
    let timerVencimiento = null;
    let actualizando = false;
    let desmontado = false;
    let inicial = true;
    const retirarVencidos = () => {
      const ahora = Date.now();
      setAnuncios((actuales) => {
        const vigentes = actuales.filter((item) => !item.visibleHasta || new Date(item.visibleHasta).getTime() > ahora);
        return mismosDatos(actuales, vigentes) ? actuales : vigentes;
      });
    };
    const cargar = async () => {
      if (desmontado || actualizando || document.visibilityState !== "visible") return;
      actualizando = true;
      const request = new AbortController();
      controller = request;
      try {
        const response = await fetch(`${API_BASE_URL}/api/publicidad`, { signal: request.signal, cache: "no-store" });
        if (!response.ok) throw new Error("No se pudieron actualizar los anuncios.");
        const data = await response.json();
        if (request.signal.aborted || desmontado || !Array.isArray(data)) return;
        const vigentes = data.filter((item) => !item.visibleHasta || new Date(item.visibleHasta).getTime() > Date.now());
        setAnuncios((actuales) => mismosDatos(actuales, vigentes) ? actuales : vigentes);
        let anuncioInicial = null;
        if (inicial) {
          inicial = false;
          let cerrado = false;
          try { cerrado = sessionStorage.getItem("studio13-anuncio-cerrado") === "true"; } catch { /* continúa */ }
          if (!cerrado) anuncioInicial = vigentes[0] || null;
        }
        setAnuncioAbierto((actual) => {
          if (actual) {
            const actualizado = vigentes.find((item) => item.id === actual.id);
            return actualizado ? (mismosDatos(actual, actualizado) ? actual : actualizado) : actual;
          }
          return anuncioInicial;
        });
        window.clearTimeout(timerVencimiento);
        const vencimientos = vigentes.map((item) => item.visibleHasta ? new Date(item.visibleHasta).getTime() : Infinity).filter(Number.isFinite);
        if (vencimientos.length) timerVencimiento = window.setTimeout(() => { retirarVencidos(); cargar(); }, Math.max(0, Math.min(...vencimientos) - Date.now() + 25));
      } catch {
        // Mantiene el listado actual y reintenta en el intervalo o al volver a la pestaña.
      } finally {
        if (controller === request) controller = null;
        actualizando = false;
      }
    };
    const alVolver = () => {
      if (document.visibilityState !== "visible") return;
      retirarVencidos();
      cargar();
    };
    cargar();
    const intervalo = window.setInterval(cargar, 30000);
    document.addEventListener("visibilitychange", alVolver);
    window.addEventListener("focus", alVolver);
    return () => {
      desmontado = true;
      controller?.abort();
      window.clearInterval(intervalo);
      window.clearTimeout(timerVencimiento);
      document.removeEventListener("visibilitychange", alVolver);
      window.removeEventListener("focus", alVolver);
    };
  }, []);

  const imagenesPorCategoria = useMemo(() => {
    const normalizarUrl = (url) => typeof url === "string" && url.startsWith("/uploads/") ? `${API_BASE_URL}${url}` : url;
    return Object.fromEntries(categories.map(({ label, secciones }) => {
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
        {/* ── HERO ── */}
        <section className="relative h-svh min-h-[100svh] overflow-hidden bg-black md:min-h-150">
          <img
            src={imagenHero}
            alt="Fotógrafo de Studio13 con su cámara"
            className="absolute inset-0 z-0 h-full w-full object-cover object-[70%_center] md:object-right"
          />
          <div className="absolute inset-0 z-1 bg-[linear-gradient(0deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.62)_34%,transparent_76%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.58)_30%,rgba(0,0,0,0.24)_52%,transparent_78%)]" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 z-1 h-24 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,transparent_100%)] md:h-36" aria-hidden="true" />

          <div className="absolute bottom-12 left-5 z-10 w-[calc(100%-2.5rem)] max-w-140 md:bottom-16 md:left-12 md:w-auto">
            <p className="mb-3 hidden font-['Inter'] text-[0.52rem] font-normal tracking-[0.2em] text-white/70 uppercase md:mb-[1.1rem] md:block md:text-[0.62rem] md:tracking-[0.32em]">
              Fotografía profesional — Momentos que perduran.
            </p>
            <img
              src={studio13Logo}
              alt="Studio13"
              className="mb-5 h-22 w-auto object-contain md:mb-8 md:h-26"
            />
            <p className="mb-5 max-w-85 font-['Inter'] text-[0.7rem] leading-[1.65] font-light tracking-[0.06em] text-white/80 md:mb-8 md:text-[0.82rem] md:leading-[1.7] md:tracking-[0.12em]">
              Fotografía profesional que convierte momentos en imágenes que
              duran para siempre.
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
              <Link
                to="/contacto"
                className="inline-flex min-h-12 w-full items-center justify-center border border-[#a51c1c] bg-[#a51c1c] px-5 py-3 font-['Inter'] text-xs tracking-[0.16em] text-white uppercase transition-colors hover:bg-[#861717] md:hidden"
              >
                Reservar
              </Link>
              <Link
                to="/portafolio"
                className="inline-flex min-h-12 w-full items-center justify-center border border-white bg-transparent px-3 py-3 font-['Inter'] text-[0.62rem] tracking-[0.12em] text-white uppercase transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:bg-gray-200 hover:text-black md:min-h-11 md:w-auto md:justify-start md:bg-white md:px-6 md:text-[0.7rem] md:tracking-[0.18em] md:text-black"
              >
                Ver portafolio
              </Link>
              <Link
                to="/paquetes"
                className="hidden min-h-11 items-center border border-white/80 bg-transparent px-3 py-3 font-['Inter'] text-[0.58rem] tracking-[0.12em] text-white uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black md:inline-flex md:px-6 md:text-[0.7rem] md:tracking-[0.18em]"
              >
                Paquetes
              </Link>
            </div>
          </div>

          <div className="absolute bottom-8 right-5 z-10 hidden flex-col items-center gap-2 md:right-12 md:flex">
            <div className="w-px h-12 bg-linear-to-b from-transparent to-[rgba(244,243,240,0.35)]" />
            <p className="font-['Inter'] text-[0.58rem] tracking-[0.2em] uppercase text-[rgba(244,243,240,0.3)] [writing-mode:vertical-rl]">
              scroll
            </p>
          </div>
        </section>

        <CampaniaTemporada />
        {anuncios.length > 0 && <section className="bg-[#f4f3f0] px-6 py-12 sm:px-12 sm:py-16" aria-labelledby="anuncios-inicio-titulo">
          <div className="mx-auto max-w-340"><p className="mb-3 text-[0.62rem] tracking-[0.32em] text-[#a51c1c] uppercase">Studio13</p><h2 id="anuncios-inicio-titulo" className="mb-8 font-[Fraunces,Georgia,serif] text-[clamp(2rem,4vw,3.5rem)] text-[#1a1818]">Anuncios</h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{anuncios.map((anuncio) => <article key={anuncio.id} className="overflow-hidden border border-neutral-200 bg-white shadow-sm"><img src={anuncio.url?.startsWith("http") ? anuncio.url : `${API_BASE_URL}${anuncio.url || ""}`} alt={anuncio.nombre} style={estiloEnfoque(anuncio)} className="h-25 w-full object-cover sm:h-30" /><div className="p-4"><p className="mb-1.5 text-[10px] tracking-[.18em] text-[#a51c1c] uppercase">{anuncio.seccion}</p><h3 className="mb-2 font-[Fraunces,Georgia,serif] text-xl text-neutral-900">{anuncio.nombre}</h3>{anuncio.descripcion && <p className="mb-4 text-sm leading-6 text-neutral-600">{anuncio.descripcion}</p>}<button type="button" onClick={() => setAnuncioAbierto(anuncio)} className="inline-flex min-h-11 items-center bg-[#a51c1c] px-5 py-3 text-xs tracking-wide text-white uppercase hover:bg-[#111010]">Ver anuncio</button></div></article>)}</div>
          </div>
        </section>}
        <AnuncioEmergente anuncio={anuncioAbierto} disponible={Boolean(anuncioAbierto && anuncios.some((item) => item.id === anuncioAbierto.id))} onClose={() => { try { sessionStorage.setItem("studio13-anuncio-cerrado", "true"); } catch { /* continúa */ } setAnuncioAbierto(null); }} />

        <section className="min-h-212.5 py-24 px-8 md:px-12 max-w-340 mx-auto flex items-center">
          <div className="w-full grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-10 xl:gap-12 items-left">
            {/* Texto */}
           <div className="w-full h-full flex flex-col items-left text-left">
              {/* Etiqueta */}
              <div className="mb-10">
                <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846]">
                  Nuestra especialidad
                </p>
              </div>

              {/* Título completo */}
              <div className="w-full mb-10 flex justify-left">
                <h2 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(3.5rem,5vw,5.5rem)] leading-[0.95] tracking-[-0.02em] text-[#1a1818] text-left">
                  Fotografías
                  <span className="block">que</span>
                  <span className="block">cuentan</span>
                  <span className="block">tu historia</span>
                </h2>
              </div>

              {/* Línea */}
              <div className="w-full mb-2 flex text-left justify-left">
                <span className="block w-5 h-px bg-[#a51c1c]" />
              </div>

              {/* Descripción */}
              <div className="w-full mb-10">
                <p className="font-['Inter'] font-light text-[0.95rem] leading-[1.9] tracking-[0.01em] text-[#5a5856] max-w-90">
                  Desde sesiones íntimas en nuestro estudio equipado hasta
                  exteriores y eventos. Cada encuadre, deliberado.
                </p>
              </div>

              {/* Botón */}
              <div>
                <Link
                  to="/servicios"
                  className="inline-block font-['Inter'] text-[0.7rem] tracking-[0.18em] uppercase text-[#1a1818] border-b border-[#1a1818] pb-3 transition-all duration-300 hover:text-[#a51c1c] hover:border-[#a51c1c]"
                >
                  Conocer servicios
                </Link>
              </div>
            </div>

            {/* Imágenes */}
            <div className="grid grid-cols-[1.15fr_1fr] gap-3 w-full max-w-195 h-130">
              {/* Imagen principal */}
              <div className="relative overflow-hidden h-130">
                <img
                  src={imagenFotografias01}
                  alt="Mujer con un ramo de rosas"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Columna derecha */}
              <div className="grid grid-rows-2 gap-3 h-130">
                <div className="relative overflow-hidden">
                  <img
                    src={imagenFotografias02}
                    alt="Retrato familiar de una pareja con su bebé"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="relative overflow-hidden">
                  <img
                    src={imagenFotografias03}
                    alt="Retrato con vestimenta y pintura corporal tradicional"
                    className="w-full h-full object-cover object-[center_70%]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ── CATEGORIES ── */}
        <section className="bg-[#111010]">
          <div className="px-12 pt-12 pb-6">
            <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846]">
              Categorías
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] lg:grid-rows-[480px_340px]">
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                to={cat.filtro ? `/portafolio?categoria=${encodeURIComponent(cat.filtro)}` : "/portafolio"}
                className={`relative block h-105 overflow-hidden no-underline bg-[#1a1818] group sm:h-90 lg:h-auto ${i === 0 ? "lg:row-span-2" : ""}`}
              >
                <ImagenRotativa imagenes={imagenesPorCategoria[cat.label]} etiqueta={cat.label} />
                {/* Degradado discreto solo en la franja del título. */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-linear-to-t from-[rgba(12,11,11,0.86)] via-[rgba(12,11,11,0.45)] to-transparent">
                  <p
                    className={`font-[Fraunces,Georgia,serif] italic font-extralight text-white tracking-[0.04em] ${i === 0 ? "text-[1.6rem] sm:text-[1.9rem] lg:text-[2.2rem]" : "text-[1rem] sm:text-[1.2rem] lg:text-[1.4rem]"}`}
                  >
                    {cat.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="px-12 py-8 flex justify-end">
            <Link
              to="/portafolio"
              className="inline-block font-['Inter'] text-[0.7rem] tracking-[0.18em] uppercase text-[rgba(244,243,240,0.8)] border border-[rgba(244,243,240,0.25)] px-6 py-3 transition-all duration-300 hover:bg-[#f4f3f0] hover:text-[#0c0b0b] hover:border-[#f4f3f0]"
            >
              Ver portafolio completo
            </Link>
          </div>
        </section>
        {/* ── STATEMENT ── */}
        <section className="py-32 px-12 max-w-225 mx-auto text-center">
          <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846] mb-10">
            Filosofía
          </p>
          <blockquote className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(1.8rem,3.5vw,3.2rem)] leading-tight tracking-[0.02em] text-[#1a1818]">
            &ldquo;Cada fotografía es una forma de volver a vivir.&rdquo;
          </blockquote>
          <span className="block w-10 h-px bg-[#a51c1c] mx-auto my-8" />
          <p className="font-['Inter'] font-light text-[0.875rem] leading-relaxed tracking-wide text-[#5a5856] max-w-105 mx-auto">
            En Studio13 creamos imágenes que resisten el paso del tiempo. No
            poses forzadas — momentos auténticos, luz cuidada, historias
            verdaderas.
          </p>
        </section>
        {/* ── TESTIMONIALS ── */}
        <Testimonios />

        {/* ── CTA ── */}
        <section className="py-28 px-12 text-center">
          <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846] mb-8">
            ¿Listo para comenzar?
          </p>
          <h2 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(2rem,4vw,3.8rem)] tracking-[0.03em] text-[#1a1818] mb-10 leading-[1.1]">
            Agenda tu sesión
          </h2>
          <Link
            to="/contacto"
            className="inline-block font-['Inter'] text-[0.7rem] tracking-[0.18em] uppercase text-[#1a1818] border border-[rgba(26,24,24,0.25)] px-6 py-3 transition-all duration-300 hover:bg-[#1a1818] hover:text-white hover:border-[#1a1818]"
          >
            Reservar ahora
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default Inicio;
