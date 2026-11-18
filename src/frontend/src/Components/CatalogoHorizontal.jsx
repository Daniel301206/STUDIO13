import { useCallback, useEffect, useRef, useState } from "react";

export const claseTarjetaCatalogo = "shrink-0 snap-start basis-[85%] sm:basis-[62%] md:basis-[calc(100%/3)]";

const Flecha = ({ direccion }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d={direccion === "izquierda" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

export default function CatalogoHorizontal({ children, ariaLabel, className = "" }) {
  const pistaRef = useRef(null);
  const [estado, setEstado] = useState({ desborda: false, izquierda: false, derecha: false });

  const recalcular = useCallback(() => {
    const pista = pistaRef.current;
    if (!pista) return;
    const maximo = pista.scrollWidth - pista.clientWidth;
    const siguiente = {
      desborda: maximo > 1,
      izquierda: pista.scrollLeft > 1,
      derecha: pista.scrollLeft < maximo - 1,
    };
    setEstado((actual) =>
      actual.desborda === siguiente.desborda &&
      actual.izquierda === siguiente.izquierda &&
      actual.derecha === siguiente.derecha
        ? actual
        : siguiente,
    );
  }, []);

  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return undefined;

    recalcular();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(recalcular);
    observer?.observe(pista);
    const mutations = new MutationObserver(recalcular);
    mutations.observe(pista, { childList: true, subtree: true });
    pista.addEventListener("scroll", recalcular, { passive: true });
    window.addEventListener("resize", recalcular);

    return () => {
      observer?.disconnect();
      mutations.disconnect();
      pista.removeEventListener("scroll", recalcular);
      window.removeEventListener("resize", recalcular);
    };
  }, [recalcular]);

  const desplazar = (direccion) => {
    const pista = pistaRef.current;
    if (!pista) return;
    const paso = pista.firstElementChild?.getBoundingClientRect().width || pista.clientWidth / 3;
    pista.scrollBy({ left: direccion * paso, behavior: "smooth" });
  };

  return (
    <div className={`relative min-w-0 ${className}`}>
      {estado.izquierda && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-linear-to-r from-white via-white/80 to-transparent md:w-20" />
      )}
      <div
        ref={pistaRef}
        role="region"
        aria-label={ariaLabel}
        className="flex w-full items-stretch overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {estado.derecha && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-linear-to-l from-white via-white/80 to-transparent md:w-20" />
      )}

      {estado.desborda && estado.izquierda && (
        <button
          type="button"
          aria-label="Ver paquetes anteriores"
          onClick={() => desplazar(-1)}
          className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center border border-[rgba(26,24,24,0.18)] bg-white/95 text-[#a51c1c] shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-[#a51c1c] hover:bg-[#a51c1c] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a51c1c] md:grid"
        >
          <Flecha direccion="izquierda" />
        </button>
      )}

      {estado.desborda && estado.derecha && (
        <button
          type="button"
          aria-label="Ver más paquetes"
          onClick={() => desplazar(1)}
          className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center border border-[rgba(26,24,24,0.18)] bg-white/95 text-[#a51c1c] shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-[#a51c1c] hover:bg-[#a51c1c] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a51c1c] md:grid"
        >
          <Flecha direccion="derecha" />
        </button>
      )}
    </div>
  );
}
