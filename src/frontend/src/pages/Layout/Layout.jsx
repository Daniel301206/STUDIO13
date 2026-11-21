import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import studio13Logo from "../../assets/studio13_negro.PNG";
import studio13LogoWhite from "../../assets/studio13_blanco.png";

export const WHATSAPP_ESTUDIO = "50688862187";

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/servicios", label: "Servicios" },
  { to: "/portafolio", label: "Portafolio" },
  { to: "/paquetes", label: "Paquetes" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/contacto", label: "Contacto" },
];

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuEntering, setMenuEntering] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hamburgerRef = useRef(null);
  const closeMenuRef = useRef(null);
  const menuWasOpen = useRef(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const onLight = !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const breakpointEscritorio = window.matchMedia("(min-width: 768px)");
    const cerrarEnEscritorio = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    breakpointEscritorio.addEventListener("change", cerrarEnEscritorio);
    return () => breakpointEscritorio.removeEventListener("change", cerrarEnEscritorio);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      menuWasOpen.current = true;
      closeMenuRef.current?.focus();
      return;
    }
    if (menuWasOpen.current) {
      menuWasOpen.current = false;
      if (window.matchMedia("(max-width: 767px)").matches) hamburgerRef.current?.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || window.matchMedia("(min-width: 768px)").matches) return undefined;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const frame = window.requestAnimationFrame(() => setMenuEntering(true));
    return () => window.cancelAnimationFrame(frame);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const cerrarConEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMenuEntering(false);
      }
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [menuOpen]);

  const abrirMenuMovil = () => {
    setMenuEntering(false);
    setMenuOpen(true);
  };
  const cerrarMenuMovil = () => {
    setMenuOpen(false);
    setMenuEntering(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── NAV ── */}
      <nav
        className={[
          "site13-nav fixed top-0 left-0 right-0 z-100 border-b transition-all duration-400",
          isHome
            ? scrolled
              ? "bg-[rgba(12,11,11,0.97)] border-white/5 backdrop-blur-md"
              : "bg-transparent border-transparent"
            : "bg-white border-black/8",
        ].join(" ")}
      >
        <div className="max-w-340 mx-auto px-5 sm:px-10 h-14.5 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="no-underline flex items-baseline">
            <img
              src={location.pathname === "/" ? studio13LogoWhite : studio13Logo}
              alt="Studio13"
              className="h-8 w-auto object-contain"
            />
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  [
                    "font-['Inter'] text-[0.65rem] tracking-[0.22em] uppercase no-underline transition-all duration-200",
                    isActive
                      ? "text-[#a51c1c] opacity-100"
                      : onLight
                        ? "text-[#1a1818] opacity-75 hover:opacity-100"
                        : "text-white opacity-75 hover:opacity-100",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}

            <NavLink
              to="/contacto"
              className={[
                "font-['Inter'] text-[0.65rem] tracking-[0.22em] uppercase no-underline pb-0.5 border-b border-[#a51c1c] transition-colors duration-200",
                onLight ? "text-[#1a1818]" : "text-white",
              ].join(" ")}
            >
              Reservar
            </NavLink>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            type="button"
            onClick={abrirMenuMovil}
            className="md:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff5a52]"
            aria-expanded={menuOpen}
            aria-controls="menu-movil-panel"
            aria-label="Abrir menú"
          >
            <span className="flex w-4 flex-col items-center gap-0.75" aria-hidden="true">
              {[0, 1, 2].map((line) => (
                <span
                  key={line}
                  className={`block h-px w-4 rounded-full ${onLight ? "bg-[#1a1818]/70" : "bg-white/70"}`}
                />
              ))}
            </span>
          </button>
        </div>
      </nav>

      {menuOpen && typeof document !== "undefined" && createPortal(
        <div id="menu-movil-panel" role="dialog" aria-modal="true" aria-label="Menú de navegación" className={`site13-menu-movil fixed inset-0 z-1000 h-dvh w-full overflow-y-auto overscroll-contain text-white transition-opacity duration-200 ease-out motion-reduce:transition-none md:hidden ${menuEntering ? "opacity-100" : "opacity-0"}`}>
          <div className="relative z-10 mx-auto flex min-h-full w-full max-w-340 flex-col px-5 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] sm:px-10">
            <div className="flex h-14.5 shrink-0 items-center justify-between border-b border-[rgba(255,255,255,0.14)]">
              <NavLink to="/" onClick={cerrarMenuMovil} className="flex items-baseline no-underline" aria-label="Studio13, inicio">
                <img src={studio13LogoWhite} alt="Studio13" className="h-8 w-auto object-contain" />
              </NavLink>
              <button
                ref={closeMenuRef}
                type="button"
                onClick={cerrarMenuMovil}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.08)] text-3xl font-light text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff5a52]"
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center" aria-label="Navegación móvil">
              {navLinks.map((link, index) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={cerrarMenuMovil}
                  style={{ transitionDelay: `${index * 40}ms` }}
                  className={({ isActive }) => [
                    `site13-menu-link flex min-h-16 items-center gap-4 border-b border-[rgba(255,255,255,0.14)] font-sans text-[28px] font-medium leading-none normal-case tracking-normal no-underline transition-[opacity,transform,color] duration-200 ease-out motion-reduce:transition-none ${menuEntering ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`,
                    isActive ? "text-[#ff5a52]" : "text-white",
                  ].join(" ")}
                >
                  <span className="font-sans text-xs tracking-[0.18em] text-[#ff6b63]" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className={`border-b pb-1 ${location.pathname === link.to ? "border-b-2 border-[#a61c1c]" : "border-transparent"}`}>{link.label}</span>
                </NavLink>
              ))}
            </nav>
            <NavLink
              to="/contacto"
              onClick={cerrarMenuMovil}
              className="mt-6 inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-3 bg-[#a51c1c] px-5 py-3 font-['Inter'] text-xs tracking-[0.2em] text-white uppercase no-underline transition-colors hover:bg-[#861717]"
            >
              Reservar <span aria-hidden="true">→</span>
            </NavLink>
          </div>
        </div>,
        document.body,
      )}

      {/* ── PAGE ── */}
      <main className={`site13-main flex-1 ${isHome ? "pt-0" : "site13-main-con-nav"}`}>
        {children ?? <Outlet />}
      </main>

      {/* ── FOOTER ── */}
      <footer className="site13-footer bg-[#111010] text-white mt-auto">
        <div className="max-w-340 mx-auto px-10 pt-16 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
          <div>
            <div className="font-[Fraunces,Georgia,serif] italic font-extralight text-[1.8rem] mb-5 tracking-[0.04em]">
              <img
                src={studio13LogoWhite}
                alt="Studio13"
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="font-['Inter'] font-light text-[0.875rem] leading-[1.8] tracking-wide text-[#5a5856] max-w-65">
              Cada imagen es una forma de volver a vivir.
            </p>
          </div>

          {[
            {
              label: "Páginas",
              links: navLinks.map((l) => ({ href: l.to, text: l.label })),
            },
            {
              label: "Contacto",
              links: [
                { href: `https://wa.me/${WHATSAPP_ESTUDIO}`, text: "+506 8886‑2187" },
                {
                  href: "mailto:studio13@gmail.com",
                  text: "studio13@gmail.com",
                },
                { href: "https://maps.app.goo.gl/w2ATHL57T6s8QwDo9", text: "Miraflores 311, Pucallpa 25006" },
              ],
            },
            {
              label: "Horario",
              links: [
                { href: "#", text: "L–V  8–18 h" },
                { href: "#", text: "Sáb  8–16 h" },
                { href: "#", text: "Dom  con cita" },
              ],
            },
          ].map((col) => (
            <div key={col.label}>
              <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846] mb-5">
                {col.label}
              </p>
              <div className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <a
                    key={l.text}
                    href={l.href}
                    className="font-['Inter'] font-light text-[0.8rem] text-[#7a7875] no-underline transition-colors duration-200 hover:text-white"
                  >
                    {l.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/6 px-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-['Inter'] font-light text-[0.7rem] text-[#3a3836] tracking-wider">
            © 2026 Studio13
          </p>
          <p className="font-['Inter'] font-light text-[0.7rem] text-[#3a3836] tracking-wider">
            Fotografía Profesional 
          </p>
        </div>
      </footer>
    </div>
  );
}
