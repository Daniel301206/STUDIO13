import { contactoSoporte } from "./contenidoConfiguracion.js";
import TarjetaConfiguracion from "./TarjetaConfiguracion.jsx";

export default function ContactoSoporte() {
  return (
    <TarjetaConfiguracion
      etiqueta={contactoSoporte.etiqueta}
      titulo={contactoSoporte.titulo}
      descripcion={contactoSoporte.descripcion}
    >
      <dl className="m-0 grid gap-4">
        <div>
          <dt className="mb-1 text-[10px] font-semibold! tracking-[.18em] text-neutral-500 uppercase">Correo</dt>
          <dd className="m-0 wrap-break-word">
            <a
              className="text-sm font-semibold! text-neutral-900 no-underline transition-colors hover:text-[#a51c1c]"
              href={`mailto:${contactoSoporte.correo}`}
            >
              {contactoSoporte.correo}
            </a>
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-[10px] font-semibold! tracking-[.18em] text-neutral-500 uppercase">WhatsApp</dt>
          <dd className="m-0">
            <a
              className="text-sm font-semibold! text-neutral-900 no-underline transition-colors hover:text-[#a51c1c]"
              href={contactoSoporte.whatsappEnlace}
              target="_blank"
              rel="noreferrer"
            >
              {contactoSoporte.whatsapp}
            </a>
          </dd>
        </div>
      </dl>
    </TarjetaConfiguracion>
  );
}
