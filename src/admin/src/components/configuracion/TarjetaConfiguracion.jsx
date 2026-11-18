export default function TarjetaConfiguracion({ etiqueta, titulo, descripcion, className = "", children }) {
  return (
    <section className={`border border-neutral-200 bg-white p-5 sm:p-6 ${className}`}>
      <header className="mb-5 border-b border-neutral-200 pb-4">
        {etiqueta && (
          <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-[#a51c1c] uppercase">
            {etiqueta}
          </p>
        )}
        <h2 className="m-0 text-lg font-semibold! tracking-[.03em] text-neutral-900 uppercase sm:text-xl">
          {titulo}
        </h2>
        {descripcion && <p className="mb-0 mt-2 text-sm leading-6 text-neutral-600">{descripcion}</p>}
      </header>
      {children}
    </section>
  );
}
