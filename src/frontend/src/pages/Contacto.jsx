import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import Layout from "../pages/Layout/Layout";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");
const categoriasReserva = [
  { id: "SESION", nombre: "Sesiones", endpoint: "/api/paquetes?seccion=SESION" },
  { id: "ALQUILER", nombre: "Alquiler", endpoint: "/api/paquetes?seccion=ALQUILER" },
  { id: "TARIFA", nombre: "Tarifas", endpoint: "/api/paquetes?seccion=TARIFA" },
  { id: "MEMBRESIAS", nombre: "Membresías", endpoint: "/api/planes-membresia" },
];
const formularioVacio = { nombre: "", email: "", telefono: "", paquete: "", paqueteId: "", mensaje: "" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const formatoMoneda = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});
const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? formatoMoneda.format(numero) : null;
};
const numeroOpcional = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
};
// No hay pasarela de pago configurada en el proyecto. Se mantiene desactivado
// hasta que exista un flujo real verificado por el backend.
const pagoEnLineaDisponible = false;

function PagoAdelantadoModal({ datos, categoria, paquete, precio, adelanto, saldo, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [aviso, setAviso] = useState("");
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab") return;
      const items = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]',
      );
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  const continuar = () => {
    if (!pagoEnLineaDisponible) {
      setAviso("El pago en línea aún no está disponible. No se realizó ningún cargo ni se envió la solicitud. Cancela y usa «Enviar solicitud» para reservar sin pagar.");
      return;
    }
  };

  const precioFormateado = formatearMoneda(precio);
  const adelantoFormateado = formatearMoneda(adelanto);
  const saldoFormateado = formatearMoneda(saldo);

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/65 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pago-adelantado-titulo"
        className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto border border-[rgba(26,24,24,0.18)] bg-[#f8f7f4] p-5 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-8"
      >
        <header className="mb-6 flex items-start justify-between gap-4 border-b border-[rgba(26,24,24,0.12)] pb-4">
          <div>
            <p className="t-label mb-2 text-[#a51c1c]!">Reserva</p>
            <h2 id="pago-adelantado-titulo" className="m-0 font-[Fraunces,Georgia,serif] text-2xl font-extralight italic text-[#1a1818] sm:text-3xl">
              Pago por adelantado
            </h2>
            <p className="t-body mb-0 mt-2 text-[0.8rem]!">Revisa los datos antes de continuar.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Cerrar pago por adelantado"
            onClick={onClose}
            className="border border-[rgba(26,24,24,0.25)] bg-transparent px-3 py-2 text-xl leading-none text-[#1a1818] transition-colors hover:border-[#a51c1c] hover:text-[#a51c1c]"
          >
            ×
          </button>
        </header>

        <div className="grid gap-6">
          <section aria-labelledby="pago-resumen-titulo">
            <p id="pago-resumen-titulo" className="t-label mb-3">Resumen del cliente</p>
            <dl className="grid gap-3 border-y border-[rgba(26,24,24,0.1)] py-4 sm:grid-cols-2">
              <div>
                <dt className="t-label mb-1">Cliente</dt>
                <dd className="m-0 font-['Inter'] text-sm text-[#1a1818]">{datos.nombre.trim()}</dd>
                <dd className="m-0 mt-1 break-words font-['Inter'] text-xs text-[#7a7875]">{datos.email.trim()}</dd>
                <dd className="m-0 mt-0.5 font-['Inter'] text-xs text-[#7a7875]">{datos.telefono.trim()}</dd>
              </div>
              <div>
                <dt className="t-label mb-1">Categoría</dt>
                <dd className="m-0 font-['Inter'] text-sm text-[#1a1818]">{categoria?.nombre || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="t-label mb-1">Paquete</dt>
                <dd className="m-0 font-['Inter'] text-sm text-[#1a1818]">{paquete || "—"}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="pago-detalle-titulo">
            <p id="pago-detalle-titulo" className="t-label mb-3">Detalle de pago</p>
            <dl className="grid gap-3">
              {precioFormateado && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-['Inter'] text-sm text-[#5a5856]">Precio del paquete</dt>
                  <dd className="m-0 font-['Inter'] text-sm text-[#1a1818]">{precioFormateado}</dd>
                </div>
              )}
              {adelantoFormateado && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-['Inter'] text-sm text-[#5a5856]">Importe del adelanto</dt>
                  <dd className="m-0 font-['Inter'] text-sm text-[#1a1818]">{adelantoFormateado}</dd>
                </div>
              )}
              {saldoFormateado && (
                <div className="flex items-baseline justify-between gap-4 border-t border-[rgba(26,24,24,0.1)] pt-3">
                  <dt className="font-['Inter'] text-sm text-[#5a5856]">Saldo pendiente</dt>
                  <dd className="m-0 font-['Inter'] text-sm text-[#1a1818]">{saldoFormateado}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-['Inter'] text-sm text-[#5a5856]">Método de pago</dt>
                <dd className="m-0 font-['Inter'] text-sm text-[#1a1818]">
                  {pagoEnLineaDisponible ? "Pago en línea" : "Pago en línea (no disponible)"}
                </dd>
              </div>
            </dl>
            {!precioFormateado && (
              <p className="t-body mb-0 mt-3 text-[0.75rem]!">El precio de este paquete se confirmará con el estudio.</p>
            )}
            {!adelantoFormateado && (
              <p className="t-body mb-0 mt-1 text-[0.75rem]!">El importe del adelanto y el saldo pendiente se mostrarán cuando el estudio los configure.</p>
            )}
          </section>

          {!pagoEnLineaDisponible && (
            <p id="pago-no-disponible" aria-live="polite" className="m-0 border border-[#dedad4] bg-[#f1efeb] p-4 font-['Inter'] text-sm leading-6 text-[#5a5856]" role="status">
              <strong className="block text-[#1a1818]">Pago en línea aún no disponible.</strong>
              No se realizará ningún cargo ni se solicitan datos de tarjeta. Puedes cancelar y enviar tu solicitud sin pagar; el estudio coordinará el adelanto contigo.
            </p>
          )}

          {aviso && (
            <p aria-live="assertive" className="m-0 border border-[#e3b8bb] bg-[#fdf4f4] p-4 font-['Inter'] text-sm leading-6 text-[#a51c1c]" role="alert">
              {aviso}
            </p>
          )}
        </div>

        <footer className="mt-6 flex flex-col-reverse gap-3 border-t border-[rgba(26,24,24,0.12)] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border border-[rgba(26,24,24,0.25)] bg-transparent px-5 py-3 font-['Inter'] text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#1a1818] transition-colors hover:border-[#1a1818]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={continuar}
            aria-describedby={pagoEnLineaDisponible ? undefined : "pago-no-disponible"}
            className="border border-[#1a1818] bg-[#1a1818] px-5 py-3 font-['Inter'] text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-white transition-colors hover:border-[#a51c1c] hover:bg-[#a51c1c]"
          >
            Continuar
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

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
  const [pagoAbierto, setPagoAbierto] = useState(false);
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

  const opcionSeleccionada = categoriaReserva
    ? opcionesPaquete.find((opcion) =>
        categoriaReserva.id === "MEMBRESIAS" ? opcion.nombre === form.paquete : String(opcion.id) === form.paqueteId,
      )
    : null;
  // Campos opcionales que el backend puede incluir cuando exista configuración de pagos.
  const precioPaquete = numeroOpcional(opcionSeleccionada?.precio);
  const adelanto = numeroOpcional(opcionSeleccionada?.adelanto);
  const saldoConfigurado = numeroOpcional(opcionSeleccionada?.saldoPendiente);
  const saldo = saldoConfigurado ?? (precioPaquete !== null && adelanto !== null ? precioPaquete - adelanto : null);

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

  const handlePagar = () => {
    if (enviandoRef.current) return;
    if (formRef.current && !formRef.current.reportValidity()) return;
    const validacion = validarReserva();
    if (validacion) {
      setErrorEnvio(validacion);
      return;
    }
    setErrorEnvio("");
    setPagoAbierto(true);
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
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&h=900&fit=crop&auto=format&q=85"
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
                    value: "Puerto Cito, Costa Rica",
                    href: "#",
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
                {[
                  "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=400&h=320&fit=crop&auto=format&q=80",
                  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=320&fit=crop&auto=format&q=80",
                  "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=260&fit=crop&auto=format&q=80",
                  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=260&fit=crop&auto=format&q=80",
                ].map((src, i) => (
                  <div
                    key={i}
                    className={`overflow-hidden bg-[#dedad4] ${
                      i < 2 ? "aspect-5/4" : "aspect-4/3"
                    }`}
                  >
                    <img
                      src={src}
                      alt="Studio13"
                      className="w-full h-full object-cover block opacity-[0.88] transition-transform duration-600 ease-out hover:scale-[1.05]"
                    />
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
                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <button
                          type="submit"
                          className="btn-ghost disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={enviando || cargandoOpciones || (!opcionesPaquete.length && categoriaReserva.id !== "SESION")}
                        >
                          {enviando ? "Enviando..." : "Enviar solicitud"}
                        </button>
                        <button
                          type="button"
                          onClick={handlePagar}
                          className="inline-flex items-center justify-center border border-[#1a1818] px-4 py-3 font-['Inter'] text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#1a1818] transition-colors duration-200 hover:border-[#a51c1c] hover:bg-[#1a1818] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={enviando || cargandoOpciones || (!opcionesPaquete.length && categoriaReserva.id !== "SESION")}
                        >
                          Pagar por adelantado
                        </button>
                      </div>

                      <p className="t-body text-[0.7rem]! mt-4 text-[#aaa8a4]!">
                        Respondemos en menos de 24 horas. El pago es opcional.
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
      {pagoAbierto && (
        <PagoAdelantadoModal
          datos={form}
          categoria={categoriaReserva}
          paquete={form.paquete}
          precio={precioPaquete}
          adelanto={adelanto}
          saldo={saldo}
          onClose={() => setPagoAbierto(false)}
        />
      )}
    </Layout>
  );
}
