import Ajustes from "../components/configuracion/Ajustes.jsx";
import ComoFunciona from "../components/configuracion/ComoFunciona.jsx";
import ContactoSoporte from "../components/configuracion/ContactoSoporte.jsx";
import DesarrolladoPor from "../components/configuracion/DesarrolladoPor.jsx";
import InformacionSistema from "../components/configuracion/InformacionSistema.jsx";

export default function ConfiguracionPanel() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-7">
        <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Administración</p>
        <h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Configuración</h1>
        <p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Guía, soporte y ajustes del espacio administrativo de Studio 13.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <ComoFunciona className="lg:col-span-2" />
        <DesarrolladoPor />
        <ContactoSoporte />
        <InformacionSistema />
        <Ajustes />
      </div>
    </main>
  );
}
