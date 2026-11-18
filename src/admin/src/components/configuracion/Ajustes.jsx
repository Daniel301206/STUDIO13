import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado } from "../../pages/useAdminCollection.js";
import { ajustes } from "./contenidoConfiguracion.js";
import TarjetaConfiguracion from "./TarjetaConfiguracion.jsx";

const campo = "w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#a51c1c]";
const etiqueta = "grid gap-1.5 text-xs font-semibold! text-neutral-700";

const bytesDe = (valor) => new TextEncoder().encode(valor).length;

export default function Ajustes() {
  const navigate = useNavigate();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cerrarSesion = () => {
    sessionStorage.removeItem("studio13AdminToken");
    sessionStorage.removeItem("studio13Admin");
    navigate("/iniciar-sesion", { replace: true });
  };

  const validar = () => {
    if (!actual) return "Escribe tu contraseña actual.";
    if (!nueva) return "Escribe la nueva contraseña.";
    if (bytesDe(nueva) < 12) return "La nueva contraseña debe tener al menos 12 caracteres.";
    if (bytesDe(nueva) > 72) return "La nueva contraseña no puede superar los 72 caracteres.";
    if (nueva === actual) return "La nueva contraseña debe ser diferente a la actual.";
    if (!confirmar) return "Confirma la nueva contraseña.";
    if (confirmar !== nueva) return "La confirmación no coincide con la nueva contraseña.";
    return "";
  };

  const cambiarContrasena = async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    setExito("");
    const mensajeValidacion = validar();
    setError(mensajeValidacion);
    if (mensajeValidacion) return;

    setGuardando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/password`, {
        method: "POST",
        headers: adminHeaders(true),
        body: JSON.stringify({ currentPassword: actual, newPassword: nueva }),
      });
      const body = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo cambiar la contraseña.");
      setActual("");
      setNueva("");
      setConfirmar("");
      setExito(ajustes.exito);
    } catch (reason) {
      setError(mensajeError(reason));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <TarjetaConfiguracion
      etiqueta={ajustes.etiqueta}
      titulo={ajustes.titulo}
      descripcion={ajustes.descripcion}
    >
      <form className="grid gap-4" onSubmit={cambiarContrasena} noValidate>
        <h3 className="m-0 text-sm font-semibold! tracking-[.03em] text-neutral-900 uppercase">
          {ajustes.formularioTitulo}
        </h3>
        <label className={etiqueta}>
          Contraseña actual
          <input
            className={campo}
            type="password"
            autoComplete="current-password"
            value={actual}
            onChange={(evento) => { setActual(evento.target.value); setError(""); setExito(""); }}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={etiqueta}>
            Nueva contraseña
            <input
              className={campo}
              type="password"
              autoComplete="new-password"
              value={nueva}
              onChange={(evento) => { setNueva(evento.target.value); setError(""); setExito(""); }}
            />
          </label>
          <label className={etiqueta}>
            Confirmar contraseña
            <input
              className={campo}
              type="password"
              autoComplete="new-password"
              value={confirmar}
              onChange={(evento) => { setConfirmar(evento.target.value); setError(""); setExito(""); }}
            />
          </label>
        </div>
        <p className="m-0 text-xs text-neutral-500">{ajustes.ayudaContrasena}</p>
        {error && <p className="m-0 text-sm text-[#a51c1c]" role="alert">{error}</p>}
        {exito && <p className="m-0 text-sm text-[#187443]" role="status">{exito}</p>}
        <div className="flex justify-end border-t border-neutral-200 pt-4">
          <button
            className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white hover:bg-black disabled:opacity-60"
            type="submit"
            disabled={guardando}
          >
            {guardando ? "Guardando…" : "Actualizar contraseña"}
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-neutral-200 pt-5">
        <h3 className="m-0 text-sm font-semibold! tracking-[.03em] text-neutral-900 uppercase">
          Sesión
        </h3>
        <p className="mb-3 mt-1 text-xs text-neutral-500">{ajustes.cerrarSesionAyuda}</p>
        <button
          className="w-full border border-neutral-800 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-900 transition-colors hover:border-[#a51c1c] hover:bg-[#a51c1c] hover:text-white sm:w-auto"
          type="button"
          onClick={cerrarSesion}
        >
          {ajustes.cerrarSesion}
        </button>
      </div>
    </TarjetaConfiguracion>
  );
}
