import { createRoot } from "react-dom/client";
import ASCIIText from "./ASCIIText.jsx";
import GhostCursor from "./GhostCursor.jsx";
import TechText from "./TechText.jsx";
import StaggeredMenu from "./StaggeredMenu.jsx";
import TiltedCard from "./TiltedCard.jsx";
import mexicoFlag from "../images/mexico-flag.png?no-inline";
import { playlistArtwork } from "./music-data.js";

const menuItems = [
  { label: "Inicio", ariaLabel: "Ir al inicio", link: "#inicio" },
  { label: "Mimikyu", ariaLabel: "Ver la sección de Mimikyu", link: "#mimikyu" },
  { label: "Música", ariaLabel: "Ver la playlist de música", link: "#musica" },
  { label: "La bandera", ariaLabel: "Ver la bandera ficticia", link: "#bandera" },
  { label: "Por si lo olvido", ariaLabel: "Leer Por si algún día lo olvido", link: "#por-si-lo-olvide" },
  { label: "Pensamientos", ariaLabel: "Ver Pensamientos", link: "#video" },
];

const menuMount = document.getElementById("hero-menu-mount");

if (menuMount) {
  createRoot(menuMount).render(
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
  );
}

const welcome = document.getElementById("hero-welcome");

if (welcome) {
  createRoot(welcome).render(
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
      className="hero-tech-text"
      style={{ color: "#f5f0ff" }}
    />
  );
}

const title = document.getElementById("mimikyu-ascii-title");

if (title) {
  title.classList.add("ascii-active");
  createRoot(title).render(
    <ASCIIText
      text="Mimikyu ♡"
      asciiFontSize={5}
      colors={["#d9c5ff", "#ec9fce", "#fff0fa"]}
      textColor="#f7efff"
      fontWeight={500}
      textScale={1.7}
      blocks={0.45}
      waves={0.25}
      waveSpeed={0.45}
      chroma={0.35}
      tilt={0.35}
      hueShift={0.25}
      scramble={0.2}
      clickRipple
      idle
      interactive
    />
  );
}

const cursorMount = document.getElementById("mimikyu-cursor-mount");

if (cursorMount) {
  createRoot(cursorMount).render(
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
  );
}

const musicCardMount = document.getElementById("music-card-mount");

if (musicCardMount) {
  createRoot(musicCardMount).render(
    <div className="music-cover">
      <img src={playlistArtwork} alt="Portada de la playlist We Love Cygnus" />
      <div className="music-card-overlay" aria-hidden="true">
        <span>Apple Music · Playlist</span>
        <h3>We Love Cygnus</h3>
      </div>
    </div>
  );
}

const flagCardMount = document.getElementById("flag-card-mount");

if (flagCardMount) {
  createRoot(flagCardMount).render(
    <TiltedCard
      imageSrc={mexicoFlag}
      altText="Bandera ficticia de México con franjas verde, blanca y roja; en el centro aparecen un águila estilizada, una luna y estrellas"
      captionText="La luna y las estrellas"
      containerWidth="100%"
      containerHeight="100%"
      imageWidth="100%"
      imageHeight="100%"
      rotateAmplitude={12}
      scaleOnHover={1.04}
      glare={0.42}
      glareColor="#d7c3ff"
      shadow={0.48}
      parallax={0.6}
      smoothness={0.7}
      gyroscope={false}
      intro
    />
  );
}
