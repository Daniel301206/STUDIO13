import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import logo from '../assets/studio13_negro.PNG';
import imagenAdmin from '../assets/image_portadaAdmin.jpg';
import { API_BASE_URL } from './useAdminCollection.js';
const inputClass = 'h-12.5 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-[#0a0a0a] outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-[#c8102e] focus:bg-white focus:ring-4 focus:ring-[#c8102e]/10';
const buttonClass = 'flex h-12.5 w-full items-center justify-between rounded-lg bg-linear-to-r from-[#c8102e] to-[#a50d27] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#c8102e]/20 transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[#c8102e]/30 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-[#c8102e] active:translate-y-0 disabled:cursor-wait disabled:opacity-65 disabled:hover:translate-y-0';

const bytesDe = (valor) => new TextEncoder().encode(valor).length;

export default function RecuperarContrasena() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const esRestablecimiento = pathname.startsWith('/restablecer-contrasena');

  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensajeSolicitud, setMensajeSolicitud] = useState('');
  const [errorSolicitud, setErrorSolicitud] = useState('');

  const [estadoEnlace, setEstadoEnlace] = useState(() =>
    esRestablecimiento ? (token ? 'validando' : 'invalido') : '');
  const [mensajeEnlace, setMensajeEnlace] = useState(() =>
    esRestablecimiento && !token ? 'El enlace no es válido. Solicita uno nuevo.' : '');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorRestablecer, setErrorRestablecer] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!esRestablecimiento) return undefined;
    if (!token) return undefined;

    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'No se pudo validar el enlace.');
        if (!data.valid) {
          setEstadoEnlace('invalido');
          setMensajeEnlace(data.error || 'El enlace no es válido. Solicita uno nuevo.');
          return;
        }
        setEstadoEnlace('valido');
      })
      .catch((reason) => {
        if (controller.signal.aborted) return;
        setEstadoEnlace('invalido');
        setMensajeEnlace(reason instanceof TypeError
          ? 'No se pudo contactar con el servidor. Inténtalo más tarde.'
          : (reason.message || 'No se pudo validar el enlace.'));
      });
    return () => controller.abort();
  }, [esRestablecimiento, token]);

  const solicitar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setErrorSolicitud('');
    setMensajeSolicitud('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'No se pudo enviar la solicitud.');
      setMensajeSolicitud(data.message || 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña');
    } catch (reason) {
      setErrorSolicitud(reason instanceof TypeError
        ? 'No se pudo contactar con el servidor. Comprueba que el backend esté disponible.'
        : (reason.message || 'No se pudo enviar la solicitud.'));
    } finally {
      setEnviando(false);
    }
  };

  const restablecer = async (evento) => {
    evento.preventDefault();
    if (guardando || estadoEnlace !== 'valido') return;
    setErrorRestablecer('');

    if (!nueva) return setErrorRestablecer('Escribe la nueva contraseña.');
    if (bytesDe(nueva) < 12) return setErrorRestablecer('La nueva contraseña debe tener al menos 12 caracteres.');
    if (bytesDe(nueva) > 72) return setErrorRestablecer('La nueva contraseña no puede superar los 72 caracteres.');
    if (!confirmar) return setErrorRestablecer('Confirma la nueva contraseña.');
    if (nueva !== confirmar) return setErrorRestablecer('Las contraseñas no coinciden.');

    setGuardando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: nueva, confirmPassword: confirmar }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.code === 'invalid_token' || data.code === 'expired_token' || data.code === 'used_token') {
          setEstadoEnlace('invalido');
          setMensajeEnlace(data.error || 'El enlace no es válido. Solicita uno nuevo.');
          return;
        }
        throw new Error(data.error || 'No se pudo restablecer la contraseña.');
      }
      setNueva('');
      setConfirmar('');
      setExito(true);
    } catch (reason) {
      setErrorRestablecer(reason instanceof TypeError
        ? 'No se pudo contactar con el servidor. Comprueba que el backend esté disponible.'
        : (reason.message || 'No se pudo restablecer la contraseña.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-white p-4 sm:p-7">
      <div className="grid min-h-140 w-full max-w-245 grid-cols-1 overflow-hidden rounded-[22px] bg-white shadow-[0_20px_64px_rgba(10,10,10,0.14)] ring-1 ring-black/5 md:h-[min(620px,calc(100svh-56px))] md:min-h-135 md:grid-cols-2">
        <section className="flex items-center justify-center bg-white px-7 py-8 sm:px-10 sm:py-9 lg:px-12" aria-label="Recuperación de contraseña">
          <div className="w-full max-w-95">
            <header className="mb-7 sm:mb-8">
              <img src={logo} alt="Studio13" className="mb-2.5 h-auto w-45 object-contain object-left" />
              <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Panel de administración
              </p>
            </header>

            <div className="mb-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c8102e]">
                Acceso privado
              </p>
              <h1 className="m-0 font-(--font-display) text-[clamp(30px,3vw,40px)] leading-tight tracking-[-0.03em] text-[#0a0a0a]">
                {esRestablecimiento ? 'Nueva contraseña' : 'Recuperar acceso'}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                {esRestablecimiento
                  ? 'Crea una nueva contraseña para tu cuenta administrativa.'
                  : 'Ingresa el correo de tu cuenta administrativa y te enviaremos un enlace de recuperación.'}
              </p>
            </div>

            {!esRestablecimiento && (
              mensajeSolicitud ? (
                <div>
                  <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-800">
                    {mensajeSolicitud}
                  </div>
                  <Link
                    to="/iniciar-sesion"
                    className="mt-5 flex h-12.5 w-full items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-800 no-underline transition hover:border-[#c8102e] hover:text-[#c8102e]"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              ) : (
                <form onSubmit={solicitar} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-xs font-semibold text-zinc-800">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(evento) => setEmail(evento.target.value)}
                      placeholder="correo@dominio.com"
                      autoComplete="username"
                      required
                      className={inputClass}
                    />
                  </div>

                  {errorSolicitud && (
                    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700">
                      {errorSolicitud}
                    </div>
                  )}

                  <button type="submit" disabled={enviando} className={buttonClass}>
                    <span>{enviando ? 'Enviando…' : 'Enviar enlace de recuperación'}</span>
                    {!enviando && <span aria-hidden="true" className="text-lg font-normal">→</span>}
                  </button>

                  <Link
                    to="/iniciar-sesion"
                    className="block text-center text-xs font-semibold text-[#c8102e] underline-offset-4 transition hover:text-[#a50d27] hover:underline"
                  >
                    Volver al inicio de sesión
                  </Link>
                </form>
              )
            )}

            {esRestablecimiento && (
              estadoEnlace === 'validando' ? (
                <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600" role="status">
                  Validando enlace…
                </p>
              ) : estadoEnlace === 'invalido' || exito ? (
                <div>
                  <div
                    role={exito ? 'status' : 'alert'}
                    className={exito
                      ? 'rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-800'
                      : 'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700'}
                  >
                    {exito ? 'Contraseña actualizada correctamente' : mensajeEnlace}
                  </div>
                  {exito ? (
                    <Link
                      to="/iniciar-sesion"
                      className="mt-5 flex h-12.5 w-full items-center justify-center rounded-lg bg-linear-to-r from-[#c8102e] to-[#a50d27] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white no-underline shadow-lg shadow-[#c8102e]/20 transition hover:brightness-110"
                    >
                      Iniciar sesión
                    </Link>
                  ) : (
                    <Link
                      to="/recuperar-contrasena"
                      className="mt-5 flex h-12.5 w-full items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-800 no-underline transition hover:border-[#c8102e] hover:text-[#c8102e]"
                    >
                      Solicitar otro enlace
                    </Link>
                  )}
                </div>
              ) : (
                <form onSubmit={restablecer} className="space-y-4">
                  <div>
                    <label htmlFor="nueva" className="mb-2 block text-xs font-semibold text-zinc-800">
                      Nueva contraseña
                    </label>
                    <input
                      id="nueva"
                      type="password"
                      value={nueva}
                      onChange={(evento) => { setNueva(evento.target.value); setErrorRestablecer(''); }}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmar" className="mb-2 block text-xs font-semibold text-zinc-800">
                      Confirmar contraseña
                    </label>
                    <input
                      id="confirmar"
                      type="password"
                      value={confirmar}
                      onChange={(evento) => { setConfirmar(evento.target.value); setErrorRestablecer(''); }}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                      className={inputClass}
                    />
                  </div>
                  <p className="m-0 text-xs text-zinc-500">La contraseña debe tener entre 12 y 72 caracteres.</p>

                  {errorRestablecer && (
                    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700">
                      {errorRestablecer}
                    </div>
                  )}

                  <button type="submit" disabled={guardando} className={buttonClass}>
                    <span>{guardando ? 'Guardando…' : 'Guardar nueva contraseña'}</span>
                    {!guardando && <span aria-hidden="true" className="text-lg font-normal">→</span>}
                  </button>

                  <Link
                    to="/iniciar-sesion"
                    className="block text-center text-xs font-semibold text-[#c8102e] underline-offset-4 transition hover:text-[#a50d27] hover:underline"
                  >
                    Volver al inicio de sesión
                  </Link>
                </form>
              )
            )}

            <footer className="mt-6 border-t border-zinc-200 pt-4">
              <p className="m-0 text-center text-[11px] leading-relaxed text-zinc-500">
                Acceso exclusivo para personal autorizado
              </p>
            </footer>
          </div>
        </section>

        <section className="group relative min-h-65 overflow-hidden bg-[#0a0a0a] md:min-h-162.5" aria-label="Fotografía profesional de Studio13">
          <img
            src={imagenAdmin}
            alt="Fotografía profesional de Studio13"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-black/15" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-10">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-red-200">
              Historias en cada encuadre
            </p>
            <p className="m-0 max-w-95 font-(--font-display) text-2xl leading-tight sm:text-3xl">
              Capturamos momentos que merecen quedarse.
            </p>
          </div>
          <span className="absolute right-7 top-7 rounded-full border border-white/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/90 sm:right-10 sm:top-10">
            Studio13 · Est. 2017
          </span>
        </section>
      </div>
    </main>
  );
}
