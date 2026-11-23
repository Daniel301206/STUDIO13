import { Link } from "react-router-dom";
import Layout from "../pages/Layout/Layout";
import studio13LogoWhite from "../assets/studio13_blanco.png";
import fotoDetrasDelLente from "../assets/imagen_alquiler.jpg";

// Importa aquí las tres fotografías pendientes cuando estén disponibles.
import imagenFotografias01 from "../assets/imagen_Inicio01.jpg";
import imagenFotografias02 from "../assets/imagen_Inicio02.jpg";
import imagenFotografias03 from "../assets/imagen_Inicio03.jpg";

const milestones = [
  {
    year: "2017",
    desc: "Primeras sesiones en exteriores. Una cámara, una visión.",
  },
  {
    year: "2019",
    desc: "Apertura del primer estudio. La comunidad respondió.",
  },
  {
    year: "2021",
    desc: "Equipo de tres. Espacio ampliado. Alquiler habilitado.",
  },
  {
    year: "Hoy",
    desc: "1,200+ sesiones. Cientos de familias felices.",
  },
];

const studioPhotos = [
  {
    id: "el-estudio",
    src: fotoDetrasDelLente, // fotoElEstudio
    alt: "Interior del estudio",
    caption: "El estudio",
  },
  {
    id: "herramientas-de-trabajo",
    src: imagenFotografias01, // fotoHerramientas
    alt: "Equipo fotográfico",
    caption: "Herramientas de trabajo",
  },
  {
    id: "preparacion-de-sesion",
    src: imagenFotografias03, // fotoPreparacion
    alt: "Preparación de sesión",
    caption: "Cada detalle importa",
  },
  {
    id: "detras-del-lente",
    src: imagenFotografias02,
    alt: "Fotógrafa trabajando en sesión",
    caption: "Detrás del lente",
  },
];

const tieneImagen = (src) => typeof src === "string" && src.trim().length > 0;

export default function Nosotros() {
  const [fotoEstudio, fotoHerramientas, fotoPreparacion, fotoGrupo] = studioPhotos;

  return (
    <Layout>
      <div className="bg-white">
        {/* HERO */}
        <section className="relative h-[80vh] min-h-125 overflow-hidden bg-[#1a1818]">
          <img
            src={imagenFotografias03}
            alt="Fotógrafo en acción — Studio13"
            className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-[center_25%]
            opacity-[0.62]
          "
          />

          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,11,11,0.85)_0%,transparent_60%)]" />

          <div className="absolute bottom-14 left-8 md:left-12 max-w-200">
            <p className="t-label text-[rgba(244,243,240,0.4)] mb-4">
              Nosotros
            </p>

            <h1 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(2.5rem,5.5vw,5rem)] text-white tracking-[0.04em] leading-none">
              Somos 
              <img src={studio13LogoWhite} alt="Studio13" className="inline-block h-20 w-auto object-contain mx-5" />
            </h1>
          </div>
        </section>

        {/* INTRO */}
        <section className="px-8 md:px-12 py-24 max-w-340 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-20 items-start">
            <div>
              <p className="t-label mb-8">La historia</p>

              <h2 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(2rem,3.5vw,3.2rem)] text-[#1a1818] leading-[1.1] mb-8">
                Una historia de
                <br />
                pasión y arte
              </h2>

              <span className="accent-rule" />

              <p className="t-body max-w-100 mb-5">
                Studio13 nació en 2017 de la convicción de que cada familia,
                cada pareja y cada momento merecen ser inmortalizados con arte y
                dedicación real.
              </p>

              <p className="t-body max-w-100 mb-5">
                Lo que comenzó como sesiones en parques y playas se convirtió en
                un estudio fotográfico profesional completo — equipado con
                iluminación de primer nivel y disponible también para alquiler.
              </p>

              <p className="t-body max-w-100">
                Hoy somos tres fotógrafos especializados con un espacio que
                produce desde retratos íntimos hasta campañas comerciales.
              </p>
            </div>

            {/* MILESTONES */}
            <div className="pt-4">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`
                  grid
                  grid-cols-[80px_1fr]
                  gap-6
                  items-start
                  pb-8
                  ${index > 0 ? "pt-8" : ""}
                  ${
                    index < milestones.length - 1
                      ? "border-b border-[rgba(26,24,24,0.08)]"
                      : ""
                  }
                `}
                >
                  <p
                    className={`
                    font-[Fraunces,Georgia,serif]
                    italic
                    font-extralight
                    text-[1.5rem]
                    leading-none
                    ${
                      milestone.year === "Hoy"
                        ? "text-[#a51c1c]"
                        : "text-[#c8c5c0]"
                    }
                  `}
                  >
                    {milestone.year}
                  </p>

                  <p className="t-body pt-[0.15rem]">{milestone.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BTS PHOTO GRID */}
        <section className="bg-[#111010] px-8 md:px-12 py-12">
          <p className="t-label text-[#4a4846] mb-8">
            El estudio · Detrás de cámaras
          </p>

          {/* Móvil: mosaico actual. Desde md: grid original de escritorio. */}
          <div className="grid w-full max-w-195 grid-cols-[1.15fr_1fr] grid-rows-[254px_254px_auto] gap-3 md:max-w-none md:grid-cols-[2fr_1fr_1fr] md:grid-rows-[400px_280px] md:gap-0.5">
            {/* ESTUDIO: grande en móvil; segunda foto en escritorio. */}
            <div className="relative col-start-1 row-start-1 row-span-2 overflow-hidden bg-[#2a2826] md:col-start-2 md:row-start-1 md:row-span-1">
              {tieneImagen(fotoEstudio?.src) && (
                <img
                  src={fotoEstudio.src}
                  alt={fotoEstudio.alt}
                  className="
                  w-full
                  h-full
                  object-cover
                  object-center
                  block
                  opacity-[0.85]
                  md:opacity-[0.8]
                  transition-transform
                  duration-800
                  ease-out
                  hover:scale-[1.04]
                  md:hover:scale-[1.05]
                "
                />
              )}

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/55 to-transparent px-3 pt-12 pb-3 md:inset-x-auto md:bottom-3 md:left-3 md:bg-none md:p-0">
                <p className="font-['Inter'] font-light text-[0.6rem] leading-relaxed tracking-[0.18em] uppercase text-[rgba(244,243,240,0.4)] wrap-break-word md:leading-normal md:break-normal">
                  {fotoEstudio?.caption}
                </p>
              </div>
            </div>

            {/* HERRAMIENTAS: pequeña arriba a la derecha en móvil; tercera en escritorio. */}
            <div className="relative col-start-2 row-start-1 overflow-hidden bg-[#2a2826] md:col-start-3 md:row-start-1">
              {tieneImagen(fotoHerramientas?.src) && (
                <img
                  src={fotoHerramientas.src}
                  alt={fotoHerramientas.alt}
                  className="
                  w-full
                  h-full
                  object-cover
                  object-[30%_center]
                  md:object-center
                  block
                  opacity-[0.8]
                  transition-transform
                  duration-800
                  ease-out
                  hover:scale-[1.05]
                "
                />
              )}

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/55 to-transparent px-3 pt-10 pb-3 md:inset-x-auto md:bottom-3 md:left-3 md:bg-none md:p-0">
                <p className="font-['Inter'] font-light text-[0.55rem] leading-normal tracking-[0.14em] uppercase text-[rgba(244,243,240,0.4)] wrap-break-word md:text-[0.6rem] md:tracking-[0.18em] md:break-normal">
                  {fotoHerramientas?.caption}
                </p>
              </div>
            </div>

            {/* PREPARACIÓN: pequeña abajo a la derecha en móvil; cuarta en escritorio. */}
            <div className="relative col-start-2 row-start-2 overflow-hidden bg-[#2a2826] md:col-start-2 md:row-start-2">
              {tieneImagen(fotoPreparacion?.src) && (
                <img
                  src={fotoPreparacion.src}
                  alt={fotoPreparacion.alt}
                  className="
                  w-full
                  h-full
                  object-cover
                  object-[38%_center]
                  md:object-center
                  block
                  opacity-[0.8]
                  transition-transform
                  duration-800
                  ease-out
                  hover:scale-[1.05]
                "
                />
              )}

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/55 to-transparent px-3 pt-10 pb-3 md:inset-x-auto md:bottom-3 md:left-3 md:bg-none md:p-0">
                <p className="font-['Inter'] font-light text-[0.55rem] leading-normal tracking-[0.14em] uppercase text-[rgba(244,243,240,0.4)] wrap-break-word md:text-[0.6rem] md:tracking-[0.18em] md:break-normal">
                  {fotoPreparacion?.caption}
                </p>
              </div>
            </div>

            {/* GRUPO: panorámica inferior en móvil; imagen principal original en escritorio. */}
            <div className="relative col-span-2 row-start-3 aspect-video w-full overflow-hidden bg-[#2a2826] md:col-span-1 md:col-start-1 md:row-start-1 md:row-span-2 md:aspect-auto">
              {tieneImagen(fotoGrupo?.src) && (
                <img
                  src={fotoGrupo.src}
                  alt={fotoGrupo.alt}
                  className="
                  w-full
                  h-full
                  object-cover
                  object-center
                  block
                  opacity-[0.8]
                  md:opacity-[0.85]
                  transition-transform
                  duration-800
                  ease-out
                  hover:scale-[1.04]
                "
                />
              )}

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/55 to-transparent px-4 pt-16 pb-4 md:hidden">
                <p className="font-['Inter'] font-light text-[0.6rem] leading-relaxed tracking-[0.18em] uppercase text-[rgba(244,243,240,0.4)]">
                  {fotoGrupo?.caption}
                </p>
              </div>
            </div>

            {/* FOTOS EXTRA (>4): ancho completo en móvil; en escritorio siguen el flujo original. */}
            {studioPhotos.slice(4).map((photo) => (
              <div
                key={photo.id}
                className="relative col-span-2 aspect-video w-full overflow-hidden bg-[#2a2826] md:col-span-1 md:row-auto md:aspect-auto"
              >
                {tieneImagen(photo.src) && (
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="
                    w-full
                    h-full
                    object-cover
                    object-center
                    block
                    opacity-[0.8]
                    transition-transform
                    duration-800
                    ease-out
                    hover:scale-[1.05]
                  "
                  />
                )}

                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/55 to-transparent px-4 pt-16 pb-4 md:inset-x-auto md:bottom-3 md:left-3 md:bg-none md:p-0">
                  <p className="font-['Inter'] font-light text-[0.6rem] leading-relaxed tracking-[0.18em] uppercase text-[rgba(244,243,240,0.4)] md:leading-normal md:break-normal">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-8 md:px-12 py-20 border-t border-[rgba(26,24,24,0.08)] text-center">
          <p className="t-label mb-8">¿Trabajamos juntos?</p>

          <h2 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(2rem,4vw,3.5rem)] text-[#1a1818] mb-10 tracking-[0.03em]">
            Tu historia merece
            <br />
            ser contada bien
          </h2>

          <Link to="/contacto" className="btn-ghost">
            Agendar sesión
          </Link>
        </section>
      </div>
    </Layout>
  );
}
