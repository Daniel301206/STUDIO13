import { desarrolladoPor } from "./contenidoConfiguracion.js";
import TarjetaConfiguracion from "./TarjetaConfiguracion.jsx";

export default function DesarrolladoPor() {
  return (
    <TarjetaConfiguracion
      etiqueta={desarrolladoPor.etiqueta}
      titulo={desarrolladoPor.titulo}
      descripcion={desarrolladoPor.descripcion}
    >
      <ul className="m-0 grid list-none gap-3 p-0">
        {desarrolladoPor.integrantes.map((integrante) => (
          <li key={integrante.nombre} className="border border-neutral-200 p-4">
            <p className="mb-1 text-sm font-semibold! text-neutral-900">{integrante.nombre}</p>
            <p className="mb-0 text-xs text-neutral-500">{integrante.rol}</p>
            {(integrante.github || integrante.linkedin) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {integrante.github && (
                  <a
                    className="inline-flex items-center border border-neutral-300 px-3 py-1.5 text-xs font-semibold! text-neutral-700 no-underline transition-colors hover:border-[#a51c1c] hover:text-[#a51c1c]"
                    href={integrante.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                )}
                {integrante.linkedin && (
                  <a
                    className="inline-flex items-center border border-neutral-300 px-3 py-1.5 text-xs font-semibold! text-neutral-700 no-underline transition-colors hover:border-[#a51c1c] hover:text-[#a51c1c]"
                    href={integrante.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </TarjetaConfiguracion>
  );
}
