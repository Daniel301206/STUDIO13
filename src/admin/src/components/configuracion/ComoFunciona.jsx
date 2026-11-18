import { comoFunciona } from "./contenidoConfiguracion.js";
import TarjetaConfiguracion from "./TarjetaConfiguracion.jsx";

export default function ComoFunciona({ className = "" }) {
  return (
    <TarjetaConfiguracion
      className={className}
      etiqueta={comoFunciona.etiqueta}
      titulo={comoFunciona.titulo}
      descripcion={comoFunciona.descripcion}
    >
      <ol className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
        {comoFunciona.pasos.map((paso, indice) => (
          <li key={paso.titulo} className="flex gap-3 border border-neutral-200 bg-[#fafafa] p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center border border-[#a51c1c] bg-[#a51c1c] text-xs font-semibold! text-white">
              {indice + 1}
            </span>
            <div className="min-w-0">
              <h3 className="m-0 text-sm font-semibold! text-neutral-900">{paso.titulo}</h3>
              <p className="mb-0 mt-1 text-sm leading-6 text-neutral-600">{paso.descripcion}</p>
            </div>
          </li>
        ))}
      </ol>
    </TarjetaConfiguracion>
  );
}
