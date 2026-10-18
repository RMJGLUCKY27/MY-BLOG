import HoloCard from "./HoloCard.jsx";
import GhostCursor from "./GhostCursor.jsx";
import TechText from "./TechText.jsx";
import StaggeredMenu from "./StaggeredMenu.jsx";
import HalftoneReveal from "./HalftoneReveal.tsx";
import RunaroundTextWrap from "./RunaroundTextWrap.jsx";
import { changePhotos, changesStory } from "./changes-story.js";
import mimikyuCard from "../images/mimikyu-card.png?no-inline";
import storyMarkdown from "./content/por-si-algun-dia-lo-olvide.md?raw";
import { playlistArtwork, playlistUrl } from "./music-data.js";

const videoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4";
const menuItems = [
  { label: "Inicio", ariaLabel: "Ir al inicio", link: "#inicio" },
  { label: "Mimikyu", ariaLabel: "Ver la sección de Mimikyu", link: "#mimikyu" },
  { label: "Música", ariaLabel: "Ver la playlist de música", link: "#musica" },
  { label: "La bandera", ariaLabel: "Ver la bandera ficticia", link: "#bandera" },
  { label: "Por si lo olvido", ariaLabel: "Leer Por si algún día lo olvido", link: "#por-si-lo-olvide" },
  { label: "Pensamientos", ariaLabel: "Ver Pensamientos", link: "#video" },
  { label: "Cambios pequeños", ariaLabel: "Leer A veces los cambios son más pequeños de lo que imaginamos", link: "#cambios-pequenos" },
];
const [storyHeading, ...storyParagraphs] = storyMarkdown.trim().split(/\n\s*\n/);
const storyTitle = storyHeading.replace(/^#\s*/, "");
const storyHighlightPattern = /(\*\*[^*]+\*\*|\b(?:historias|recuerdos|memoria|olvidar|tiempo)\b)/gi;

function renderStoryParagraph(text) {
  return text.split(storyHighlightPattern).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong className="font-semibold text-white" key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (/^(historias|recuerdos|memoria|olvidar|tiempo)$/i.test(part)) {
      return (
        <span className="font-medium text-violet-200" key={index}>
          {part}
        </span>
      );
    }

    return part;
  });
}

export default function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#080a0d] font-geist text-white">
      <section className="relative isolate h-screen min-h-[560px] overflow-hidden bg-black [height:100svh]" id="inicio">
        <video
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
          src={videoUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 z-[1] h-[25vh] bg-gradient-to-b from-transparent to-[#080a0d]" />
        <div className="absolute inset-0 z-40 pointer-events-none">
          <StaggeredMenu
            position="right"
            items={menuItems}
            displaySocials={false}
            displayItemNumbering={false}
            showLogo={false}
            menuButtonColor="#ffffff"
            openMenuButtonColor="#ffffff"
            changeMenuColorOnOpen
            colors={["#b38add", "#6d5388", "#342742", "#14121b"]}
            accentColor="#c9a9ff"
            closeOnClickAway
          />
        </div>

        <main className="relative z-10 grid h-full place-items-center px-6 text-center">
          <h1 className="mx-auto w-[90vw] max-w-[1200px]">
            <TechText
              text="RichOflucky Blog"
              fontFamily="Montserrat, sans-serif"
              fontWeight={700}
              fontSize={145}
              letterSpacing={-0.055}
              color="#f5f0ff"
              accentColor="#c9a9ff"
              align="center"
              reveal="letter"
              reach={190}
              softness={0.76}
              dashLength={4}
              dashGap={2}
              lineStyle="dashed"
              strokeWidth={1.4}
              specks={16}
              selection
              labels
              draggable
              bounce={0.4}
              clickKick
              intro="assemble"
              introDuration={1.8}
              guides={false}
              sweep
              speed={0.8}
              className="h-[clamp(150px,28vw,260px)] w-full"
              style={{ color: "#f5f0ff" }}
            />
          </h1>
        </main>
      </section>

      <section
        className="relative isolate mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 sm:px-10 sm:py-20 md:grid-cols-[1fr_auto] md:px-12 lg:px-16"
        id="mimikyu"
      >
        <GhostCursor
          color="#B497CF"
          size={68}
          trailLength={38}
          inertia={0.55}
          turbulence={0.65}
          drift={0.18}
          detail={0.78}
          grainIntensity={0.025}
          bloomStrength={0.55}
          bloomRadius={1}
          intro={false}
          targetPixels={360000}
          maxDevicePixelRatio={1.5}
          zIndex={4}
        />
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-medium tracking-tight sm:text-5xl">Mimikyu ♡</h2>
          <div className="mx-auto mt-6 max-w-xl space-y-4 font-montserrat text-base leading-[1.8] text-justify text-white/70 [text-justify:inter-word] [hyphens:auto] md:mx-0">
            <p>No sé si algún día cambiaré de opinión, pero por ahora, entre tantos Pokémon, <strong className="font-semibold text-violet-200">siempre termino eligiendo a Mimikyu.</strong></p>
            <p>Quizá dentro de unos años vuelva a encontrar esta publicación y recuerde cuánto me gustaba. <strong className="font-semibold text-violet-200">O quizá siga siendo mi favorito.</strong></p>
            <p className="pt-1 text-white/90">Por ahora, quería dejarlo aquí.</p>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <HoloCard
            image={mimikyuCard}
            alt="Carta holográfica de Mimikyu"
            preset="bursts"
            foilColor="#d7c3ff"
            intensity={0.9}
            edgeSparkle={0.85}
            frame={5}
            glare={0.55}
            width={300}
            tiltMax={12}
            hoverScale={1.04}
            idle
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20 md:px-12 lg:px-16" id="musica">
        <header className="mb-7">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-200/70">Apple Music · 12 canciones</p>
          <h2 className="text-4xl font-medium tracking-tight sm:text-5xl">Música</h2>
        </header>
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)] md:gap-12">
          <div className="mx-auto w-full max-w-[460px] md:mx-0">
            <div className="music-cover">
              <img src={playlistArtwork} alt="Portada de la playlist We Love Cygnus" />
              <div className="music-card-overlay" aria-hidden="true">
                <span>Apple Music · Playlist</span>
                <h3>We Love Cygnus</h3>
              </div>
            </div>
            <a className="mt-5 inline-flex text-sm font-medium text-violet-200 transition-colors hover:text-white" href={playlistUrl} target="_blank" rel="noopener noreferrer">
              Abrir playlist en Apple Music ↗
            </a>
          </div>
          <div className="music-embed">
            <iframe
              src="https://embed.music.apple.com/mx/playlist/we-love-cygnus/pl.u-11zBJWBfKG62g7J?l=es-MX&theme=dark"
              title="Playlist We Love Cygnus en Apple Music"
              loading="lazy"
              allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20 md:px-12 lg:px-16" id="bandera">
        <div className="grid items-center gap-9 md:grid-cols-[minmax(0,1fr)_minmax(420px,1.05fr)] md:gap-14">
          <article>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-200/70">Bandera ficticia</p>
            <h2 className="text-4xl font-medium leading-[1.08] tracking-[-0.05em] sm:text-5xl">La luna y las estrellas</h2>
            <p className="mt-6 font-montserrat text-[15px] leading-[1.8] text-white/72">
              Esta es una bandera ficticia que decidí crear porque estaba bien aburrida xd y aquí van los significados de algunos símbolos:
            </p>
            <div className="mt-7 space-y-6 font-montserrat text-[14px] leading-[1.8] text-justify text-white/70 [text-justify:inter-word] [hyphens:auto]">
              <div>
                <h3 className="text-base font-semibold text-violet-200">La luna 🌕</h3>
                <p className="mt-2">El nombre de México significa “el ombligo de la luna” en náhuatl “Metztli” (luna) y “xictli” (ombligo). Los aztecas lo pronunciaban “Meshico”. Entonces, aunque sería buena idea ponerla.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-violet-200">Las estrellas 🌌</h3>
                <p className="mt-2">Las estrellas forman la constelación “águila” y representarían al águila de la bandera</p>
              </div>
            </div>
          </article>
          <figure className="w-full">
            <div
              className="aspect-[1170/660] w-full overflow-hidden rounded-[18px] bg-[#120f17]"
              role="img"
              aria-label="Bandera ficticia de México con franjas verde, blanca y roja; en el centro aparecen un águila estilizada, una luna y estrellas"
            >
              <HalftoneReveal
                src="/images/mexico-flag.png"
                mode="mono"
                shape="dot"
                cellSize={6}
                angle={45}
                inkColor="#f4f1ea"
                paperColor="#120f17"
                revealRadius={160}
              />
            </div>
            <figcaption className="mt-3 text-[10px] uppercase tracking-[0.12em] text-white/40">
              Compartido en <a className="text-violet-200/75 transition-colors hover:text-white" href="https://www.reddit.com/r/vexillology/" target="_blank" rel="noopener noreferrer">r/vexillology</a>
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        className="px-6 py-16 sm:px-10 sm:py-20 md:px-12 lg:px-16"
        id="por-si-lo-olvide"
      >
        <article className="mx-auto max-w-3xl">
          <h2 className="max-w-2xl text-4xl font-medium leading-[1.08] tracking-[-0.05em] sm:text-6xl">
            {storyTitle}
          </h2>
          <div className="mt-10 space-y-4 font-montserrat text-base leading-[1.85] text-justify text-white/70 [text-justify:inter-word] [hyphens:auto] sm:mt-14 sm:text-[17px]">
            {storyParagraphs.map((paragraph, index) => (
              <p
                className={index === 0 ? "text-lg leading-[1.8] text-white/90 sm:text-xl" : ""}
                key={`${index}-${paragraph.slice(0, 24)}`}
              >
                {renderStoryParagraph(paragraph)}
              </p>
            ))}
          </div>
          <div className="mt-12 space-y-4 font-montserrat text-base leading-[1.85] text-justify text-white/70 [text-justify:inter-word] [hyphens:auto] sm:text-[17px]">
            <h3 className="mb-5 max-w-2xl text-left text-3xl font-semibold leading-tight tracking-tight text-white/95 sm:text-4xl">
              Pensar demasiado no es solo pensar… <span className="text-violet-200">es no poder parar.</span>
            </h3>
            <p>
              Este video trata sobre el <span className="font-medium text-violet-200">overthinking</span>, la <span className="font-medium text-violet-200">ansiedad mental</span> y lo que se siente vivir con una mente que nunca se apaga.
            </p>
            <p>
              Mi mente va en <span className="font-medium text-violet-200">X2</span> todo el tiempo. Pensamientos, recuerdos, escenarios… todo al mismo tiempo. A veces estoy aquí… pero mi cabeza está en otro lugar.
            </p>
            <p>
              Esto no es un vlog. No es una explicación. Es una experiencia real de lo que se siente sobrepensar, vivir con ruido mental constante y no encontrar un <span className="font-medium text-violet-200">botón de pausa.</span>
            </p>
            <p>
              Si alguna vez has sentido ansiedad, si tu mente no te deja descansar o si te pierdes en tus propios pensamientos… <span className="font-medium text-violet-200">este video también es tuyo.</span>
            </p>
          </div>
          <div className="mt-12 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/30" id="video">
            <iframe
              className="h-full w-full"
              src="https://www.youtube-nocookie.com/embed/lLRaqIM1xUs?rel=0"
              title="Video de Por si algún día lo olvido"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </article>
      </section>

      <section
        className="px-6 py-16 sm:px-10 sm:py-20 md:px-12 lg:px-16"
        id="cambios-pequenos"
      >
        <article className="mx-auto max-w-6xl">
          <header className="max-w-3xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-200/70">
              Diario personal
            </p>
            <h2 className="text-4xl font-medium leading-[1.08] tracking-[-0.05em] sm:text-6xl">
              A veces los cambios son más pequeños de lo que imaginamos
            </h2>
          </header>

          <div className="mt-8">
            <RunaroundTextWrap paragraphs={changesStory} images={changePhotos} />
          </div>
        </article>
      </section>

      <footer className="px-6 py-6 text-xs text-white/40 sm:px-10 md:px-12 lg:px-16">
        Blog
      </footer>
    </div>
  );
}
