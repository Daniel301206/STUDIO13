import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../pages/Layout/Layout";

// PORTADA: reemplaza este import por la fotografía definitiva de Contacto.
import imagenPortadaContacto from "../assets/imagen_Inicio02.jpg";

// GALERÍA: importa aquí las fotografías de Contacto cuando estén disponibles
// y asígnalas en la entrada correspondiente de `fotosContacto`.
import fotoContactoAlquiler from "../assets/imagen_alquiler.jpg";
// import fotoContactoPendiente from "../assets/contacto-04.jpg";
import imagenFotografias01 from "../assets/imagen_Inicio01.jpg";
import imagenFotografias02 from "../assets/imagen_Inicio02.jpg";
import imagenFotografias03 from "../assets/imagen_Inicio03.jpg";
// Galería de Contacto: cuatro espacios fijos. Los que aún no tienen foto
// usan `src: null` y se muestran con su fondo neutro, sin imagen rota.
const fotosContacto = [
  {
    id: "contacto-alquiler",
    src: imagenFotografias01,
    alt: "Espacio de alquiler del estudio Studio13",
  },
  {
    id: "contacto-estudio",
    src: imagenFotografias03,
    alt: "Sesión fotográfica en el estudio Studio13",
  },
  {
    id: "contacto-detalle",
    src: fotoContactoAlquiler,
    alt: "Detalle editorial capturado en Studio13",
  },
  {
    id: "contacto-pendiente",
    src: imagenFotografias02, // fotoContactoPendiente
    alt: "Área de trabajo del estudio Studio13",
  },
];

const tieneImagen = (src) => typeof src === "string" && src.trim().length > 0;

const API_BASE_URL = (import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001`).replace(/\/+$/, "");
const categoriasReserva = [
  { id: "SESION", nombre: "Sesiones", endpoint: "/api/paquetes?seccion=SESION" },
  { id: "ALQUILER", nombre: "Alquiler", endpoint: "/api/paquetes?seccion=ALQUILER" },
  { id: "TARIFA", nombre: "Tarifas", endpoint: "/api/paquetes?seccion=TARIFA" },
  { id: "MEMBRESIAS", nombre: "Membresías", endpoint: "/api/planes-membresia" },
];
const formularioVacio = { nombre: "", email: "", telefono: "", paquete: "", paqueteId: "", mensaje: "" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function Contacto() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paqueteCampaniaId = searchParams.get("paqueteId");
  const [form, setForm] = useState(formularioVacio);
  const [categoriaReserva, setCategoriaReserva] = useState(() => paqueteCampaniaId ? categoriasReserva[0] : null);
  const [opcionesPaquete, setOpcionesPaquete] = useState([]);
  const [cargandoOpciones, setCargandoOpciones] = useState(false);
  const [errorOpciones, setErrorOpciones] = useState("");
  const [sent, setSent] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const formRef = useRef(null);
  const enviandoRef = useRef(false);

  useEffect(() => {
    if (!categoriaReserva) return undefined;
    const controller = new AbortController();
    setCargandoOpciones(true);
    setErrorOpciones("");
    setOpcionesPaquete([]);
    const endpointPaquetes = categoriaReserva.id === "SESION" && paqueteCampaniaId
      ? `/api/paquetes/${encodeURIComponent(paqueteCampaniaId)}`
      : categoriaReserva.endpoint;
    fetch(`${API_BASE_URL}${endpointPaquetes}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        const body = Array.isArray(payload) ? payload : payload && typeof payload === "object" ? [payload] : payload;
        if (!response.ok) throw new Error(body.error || `No se pudieron cargar ${categoriaReserva.nombre.toLowerCase()}.`);
        if (!Array.isArray(body)) throw new Error("El servidor devolvió un formato de opciones no válido.");
        return body;
      })
      .then((body) => {
        if (controller.signal.aborted) return;
        setOpcionesPaquete(body);
        if (categoriaReserva.id === "SESION" && paqueteCampaniaId) {
          const paqueteSeleccionado = body.find((opcion) => String(opcion.id) === paqueteCampaniaId);
          if (paqueteSeleccionado) {
            setForm((actual) => ({ ...actual, paquete: paqueteSeleccionado.nombre, paqueteId: String(paqueteSeleccionado.id) }));
          } else {
            setErrorOpciones("El paquete de esta campaña ya no está disponible. Elige otra sesión.");
          }
        }
      })
      .catch((error) => { if (!controller.signal.aborted) setErrorOpciones(error.message); })
      .finally(() => { if (!controller.signal.aborted) setCargandoOpciones(false); });
    return () => controller.abort();
  }, [categoriaReserva, paqueteCampaniaId]);

  const validarReserva = () => {
    if (!categoriaReserva) return "Selecciona una categoría para reservar.";
    if (!form.nombre.trim()) return "Escribe tu nombre completo.";
    if (!emailPattern.test(form.email.trim())) return "Escribe un correo electrónico válido.";
    if (!form.telefono.trim()) return "Escribe tu teléfono o WhatsApp.";
    if (!form.paquete) {
      return categoriaReserva.id === "MEMBRESIAS" ? "Selecciona un plan de membresía." : "Selecciona un paquete.";
    }
    if (form.paquete === "Cotización personalizada" && !form.mensaje.trim()) {
      return "Describe qué necesitas para la cotización personalizada.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviandoRef.current) return;
    const validacion = validarReserva();
    if (validacion) {
      setErrorEnvio(validacion);
      return;
    }

    enviandoRef.current = true;
    setEnviando(true);
    setErrorEnvio("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/reservaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
          tipoSesion: form.paquete,
          paqueteId: form.paqueteId ? Number(form.paqueteId) : undefined,
          categoriaServicio: categoriaReserva.id,
          mensaje: form.mensaje.trim(),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || "No se pudo enviar la solicitud. Inténtalo nuevamente.");

      setForm(formularioVacio);
      setCategoriaReserva(null);
      setSent(true);
    } catch (error) {
      setErrorEnvio(error instanceof TypeError
        ? "No se pudo contactar con el servidor. Inténtalo nuevamente más tarde."
        : error.message);
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white">
        {/* ── HERO ── */}
        <section className="relative h-[60vh] min-h-100 overflow-hidden bg-[#1a1818]">
          <img
            src={imagenPortadaContacto}
            alt="Estudio fotográfico Studio13"
            className="absolute inset-0 w-full h-full object-cover object-[center_40%] opacity-[0.55]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,11,11,0.8)_0%,transparent_65%)]" />

          <div className="absolute bottom-12 left-12 max-w-125">
            <p className="t-label mb-4 text-[rgba(244,243,240,0.4)]!">
              Contacto
            </p>

            <h1 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(2.5rem,5vw,4.5rem)] text-white tracking-[0.04em] leading-none">
              Agenda tu sesión
            </h1>
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <section className="mx-auto max-w-340 px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            {/* ── LEFT: info ── */}
            <div>
              <p className="t-label mb-8">Contáctanos</p>

              <div className="mb-12">
                {[
                  {
                    label: "WhatsApp",
                    value: "+506 8886-2187",
                    href: "https://wa.me/50688862187",
                  },
                  {
                    label: "Correo",
                    value: "studio13@gmail.com",
                    href: "mailto:studio13@gmail.com",
                  },
                  {
                    label: "Ubicación",
                    value: "Miraflores 311, Pucallpa 25006",
                    href: "https://maps.app.goo.gl/kmZuzA8TyBrQyhjb9",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="border-b border-[rgba(26,24,24,0.08)] py-5"
                  >
                    <p className="t-label mb-[0.35rem]">{c.label}</p>

                    <a
                      href={c.href}
                      className="font-[Fraunces,Georgia,serif] font-light text-[1.05rem] text-[#1a1818] no-underline tracking-[0.03em] transition-colors duration-200 hover:text-[#a51c1c]"
                    >
                      {c.value}
                    </a>
                  </div>
                ))}
              </div>

              {/* Hours */}
              <p className="t-label mb-5">Horario</p>

              {[
                ["Lunes – Viernes", "8:00 – 18:00"],
                ["Sábados", "8:00 – 16:00"],
                ["Domingos", "Con cita previa"],
              ].map(([day, time]) => (
                <div
                  key={day}
                  className="flex justify-between py-[0.6rem] border-b border-[rgba(26,24,24,0.06)]"
                >
                  <span className="t-body text-[0.8rem]!">{day}</span>

                  <span className="font-['Inter'] font-normal text-[0.8rem] text-[#1a1818]">
                    {time}
                  </span>
                </div>
              ))}

              {/* Studio photos */}
              <div className="mt-12 grid grid-cols-2 gap-3">
                {fotosContacto.map((foto, i) => (
                  <div
                    key={foto.id}
                    className={`overflow-hidden bg-[#dedad4] ${
                      i < 2 ? "aspect-5/4" : "aspect-4/3"
                    }`}
                  >
                    {tieneImagen(foto.src) && (
                      <img
                        src={foto.src}
                        alt={foto.alt}
                        className={`w-full h-full object-cover block opacity-[0.88] transition-transform duration-600 ease-out hover:scale-[1.05] ${
                          foto.id === "contacto-detalle" ? "md:object-[50%_5%]" : ""
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: form ── */}
            <div>
              {sent ? (
                <div className="py-16 text-center">
                  <span className="accent-rule mx-auto mb-8" />

                  <h2 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[2.5rem] text-[#1a1818] mb-4">
                    ¡Listo!
                  </h2>

                  <p className="t-body max-w-[20rem] mx-auto mb-10">
                    El estudio confirmó la recepción de tu solicitud. Te contactaremos en menos de 24 horas para coordinar los detalles.
                  </p>

                  <button onClick={() => { setSent(false); setErrorEnvio(""); }} className="btn-ghost">
                    Enviar otra solicitud
                  </button>
                </div>
              ) : !categoriaReserva ? (
                <div>
                  <p className="t-label mb-4">Formulario de reserva</p>
                  <h2 className="mb-8 font-[Fraunces,Georgia,serif] text-3xl font-extralight italic text-[#1a1818]">Elige una categoría</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {categoriasReserva.map((categoria) => (
                      <button
                        key={categoria.id}
                        type="button"
                        onClick={() => { setSearchParams({}, { replace: true }); setForm((actual) => ({ ...actual, paquete: "", paqueteId: "", mensaje: "" })); setOpcionesPaquete([]); setErrorOpciones(""); setCategoriaReserva(categoria); }}
                        className="group border border-[rgba(26,24,24,0.15)] bg-transparent p-5 text-left transition-colors duration-200 hover:border-[#a51c1c]"
                      >
                        <span className="t-label block">{categoria.nombre}</span>
                        <span className="mt-3 block text-xs text-[#8a8880]">Ver opciones y reservar <span className="transition-transform group-hover:translate-x-1">→</span></span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="t-label mb-2">Formulario de reserva</p>
                      <h2 className="m-0 font-[Fraunces,Georgia,serif] text-3xl font-extralight italic text-[#1a1818]">{categoriaReserva.nombre}</h2>
                    </div>
                    <button type="button" onClick={() => { setSearchParams({}, { replace: true }); setCategoriaReserva(null); setOpcionesPaquete([]); setErrorOpciones(""); setForm((actual) => ({ ...actual, paquete: "", paqueteId: "", mensaje: "" })); }} className="border-0 bg-transparent p-0 text-xs text-[#8a8880] underline decoration-[#a51c1c] underline-offset-4 hover:text-[#a51c1c]">← Elegir otra categoría</button>
                  </div>

                  <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
                    <div>
                      <label className="t-label block mb-2">Nombre</label>

                      <input
                        type="text"
                        required
                        value={form.nombre}
                        onChange={(e) =>
                          setForm({ ...form, nombre: e.target.value })
                        }
                        placeholder="Tu nombre completo"
                        className="w-full bg-transparent border-0 border-b border-[rgba(26,24,24,0.2)] py-3 font-['Inter'] font-light text-sm text-[#1a1818] outline-none transition-colors duration-200 focus:border-[#1a1818]"
                      />
                    </div>

                    <div>
                      <label className="t-label block mb-2">
                        Correo electrónico
                      </label>

                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="ejemplo@gmail.com"
                        className="w-full bg-transparent border-0 border-b border-[rgba(26,24,24,0.2)] py-3 font-['Inter'] font-light text-sm text-[#1a1818] outline-none transition-colors duration-200 focus:border-[#1a1818]"
                      />
                    </div>

                    <div>
                      <label className="t-label block mb-2">
                        Teléfono / WhatsApp
                      </label>

                      <input
                        type="tel"
                        required
                        value={form.telefono}
                        onChange={(e) =>
                          setForm({ ...form, telefono: e.target.value })
                        }
                        placeholder="+506 0000-0000"
                        className="w-full bg-transparent border-0 border-b border-[rgba(26,24,24,0.2)] py-3 font-['Inter'] font-light text-sm text-[#1a1818] outline-none transition-colors duration-200 focus:border-[#1a1818]"
                      />
                    </div>

                    <div>
                      <label className="t-label block mb-2">
                        {categoriaReserva.id === "MEMBRESIAS" ? "Plan de membresía" : "Paquete de interés"}
                      </label>

                      {cargandoOpciones && <p className="t-body py-2 text-sm">Cargando opciones…</p>}
                      {errorOpciones && <p className="py-2 text-sm text-[#a51c1c]" role="alert">{errorOpciones}</p>}
                      <select
                        required
                        disabled={cargandoOpciones || (opcionesPaquete.length === 0 && categoriaReserva.id !== "SESION")}
                        value={form.paqueteId || form.paquete}
                        onChange={(e) => {
                          const opcion = opcionesPaquete.find((item) => String(item.id) === e.target.value);
                          setForm({
                            ...form,
                            paquete: opcion?.nombre || e.target.value,
                            paqueteId: categoriaReserva.id !== "MEMBRESIAS" && opcion ? String(opcion.id) : "",
                          });
                        }}
                        className={`w-full bg-transparent border-0 border-b border-[rgba(26,24,24,0.2)] py-3 font-['Inter'] font-light text-sm outline-none transition-colors duration-200 cursor-pointer appearance-none focus:border-[#1a1818] ${form.paquete ? "text-[#1a1818]" : "text-[#9a9490]"}`}
                      >
                        <option value="" disabled>Seleccionar opción…</option>
                        {opcionesPaquete.map((opcion) => (
                          <option key={opcion.id} value={categoriaReserva.id === "MEMBRESIAS" ? opcion.nombre : String(opcion.id)}>
                            {opcion.nombre}{opcion.precio != null ? ` — ${new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(Number(opcion.precio))}` : ""}
                          </option>
                        ))}
                        {categoriaReserva.id === "SESION" && <option value="Cotización personalizada">Cotización personalizada — Precio por definir</option>}
                      </select>
                      {!cargandoOpciones && !errorOpciones && opcionesPaquete.length === 0 && categoriaReserva.id !== "SESION" && <p className="t-body mt-2 text-sm">No hay opciones publicadas en esta categoría.</p>}
                    </div>

                    <div>
                      <label className="t-label block mb-2" htmlFor="mensaje-reservacion">
                        {form.paquete === "Cotización personalizada" ? "Describe qué necesitas para la cotización" : "Cuéntanos tu idea"}
                      </label>
                      <textarea
                        id="mensaje-reservacion"
                        rows={5}
                        required={form.paquete === "Cotización personalizada"}
                        value={form.mensaje}
                        onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                        placeholder="Detalles de la sesión o solicitud..."
                        className="w-full bg-transparent resize-none border border-[rgba(26,24,24,0.15)] p-3 font-['Inter'] font-light text-sm text-[#1a1818] outline-none transition-colors duration-200 focus:border-[#1a1818]"
                      />
                      {form.paquete === "Cotización personalizada" && <p className="t-body mt-2 text-[0.75rem]!">Precio por definir según lo que necesites.</p>}
                    </div>

                    <div className="pt-2">
                      {errorEnvio && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{errorEnvio}</p>}
                      <button
                        type="submit"
                        className="btn-ghost disabled:cursor-not-allowed disabled:opacity-45"
                        disabled={enviando || cargandoOpciones}
                      >
                        {enviando ? "Enviando..." : "Enviar solicitud"}
                      </button>
                      <p className="t-body mt-4 text-[0.7rem]! text-[#aaa8a4]!">
                        Respondemos en menos de 24 horas.
                      </p>
                    </div>
                  </form>
                </>
              )}

              {/* Why Studio13 */}
              <div className="mt-16 pt-12 border-t border-[rgba(26,24,24,0.08)]">
                <p className="t-label mb-6">¿Por qué Studio13?</p>

                {[
                  [
                    "8+ años de experiencia",
                    "Más de 1,200 sesiones realizadas en Costa Rica.",
                  ],
                  [
                    "Equipo profesional certificado",
                    "Iluminación, composición y edición de nivel editorial.",
                  ],
                  [
                    "Galería digital privada",
                    "Entrega segura en alta resolución, lista para imprimir.",
                  ],
                  [
                    "Estudio disponible para alquiler",
                    "Equipamiento completo. Fotógrafos y marcas bienvenidos.",
                  ],
                ].map(([title, desc]) => (
                  <div key={title} className="flex gap-4 mb-5">
                    <span className="w-px bg-[#a51c1c] shrink-0 mt-0.75" />

                    <div>
                      <p className="font-['Inter'] font-normal text-[0.78rem] text-[#1a1818] mb-[0.2rem]">
                        {title}
                      </p>

                      <p className="t-body text-[0.75rem]!">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
