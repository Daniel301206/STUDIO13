import { useEffect, useState } from "react";
import { Icono } from "../../pages/Layout/AdminLayout.jsx";
import { informacionSistema } from "./contenidoConfiguracion.js";
import TarjetaConfiguracion from "./TarjetaConfiguracion.jsx";

const manualUrl = `${import.meta.env.BASE_URL}${informacionSistema.manual.archivo}`;

export default function InformacionSistema() {
  const [manualDisponible, setManualDisponible] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(manualUrl, { method: "HEAD", signal: controller.signal })
      .then((response) => {
        const tipo = response.headers.get("content-type") || "";
        if (!controller.signal.aborted) setManualDisponible(response.ok && !tipo.includes("text/html"));
      })
      .catch(() => {
        if (!controller.signal.aborted) setManualDisponible(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <TarjetaConfiguracion
      etiqueta={informacionSistema.etiqueta}
      titulo={informacionSistema.titulo}
      descripcion={informacionSistema.descripcion}
    >
      <dl className="m-0 grid gap-4">
        <div className="flex items-center justify-between gap-4 border border-neutral-200 px-4 py-3">
          <dt className="text-xs font-semibold! text-neutral-600">Versión</dt>
          <dd className="m-0 border border-[#a51c1c] bg-[#a51c1c] px-2.5 py-1 text-[10px] font-semibold! text-white uppercase">
            {informacionSistema.version}
          </dd>
        </div>
        <div>
          <dt className="mb-2 text-[10px] font-semibold! tracking-[.18em] text-neutral-500 uppercase">Tecnologías</dt>
          <dd className="m-0 flex flex-wrap gap-2">
            {informacionSistema.tecnologias.map((tecnologia) => (
              <span
                key={tecnologia}
                className="border border-neutral-300 bg-white px-2.5 py-1 text-[10px] font-semibold! text-neutral-600 uppercase"
              >
                {tecnologia}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <p className="mb-0 mt-5 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        © {informacionSistema.anio} {informacionSistema.propietario}. Todos los derechos reservados.
      </p>

      <div className="mt-5 border-t border-neutral-200 pt-5">
        <h3 className="m-0 text-sm font-semibold! tracking-[.03em] text-neutral-900 uppercase">
          {informacionSistema.manual.titulo}
        </h3>
        <p className="mb-4 mt-2 text-sm leading-6 text-neutral-600">
          {informacionSistema.manual.descripcion}
        </p>
        {manualDisponible ? (
          <a
            className="inline-flex w-full items-center justify-center gap-2 border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white no-underline transition-colors hover:bg-black sm:w-auto"
            href={manualUrl}
            download={informacionSistema.manual.archivo}
          >
            <Icono name="download" size={18} />
            {informacionSistema.manual.boton}
          </a>
        ) : (
          <div>
            <button
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white sm:w-auto"
              type="button"
              disabled
            >
              <Icono name="download" size={18} />
              {informacionSistema.manual.boton}
            </button>
            <p className="mb-0 mt-2 text-xs text-neutral-500">
              {informacionSistema.manual.pendiente}
            </p>
          </div>
        )}
      </div>
    </TarjetaConfiguracion>
  );
}
