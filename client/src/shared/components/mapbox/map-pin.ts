export function createMapPinElement(): HTMLDivElement {
  const size = 40;
  const wrapper = document.createElement("div");
  wrapper.className = "mapbox-pin";
  wrapper.style.width = `${size}px`;
  wrapper.style.height = `${size}px`;
  wrapper.style.cursor = "pointer";
  wrapper.style.position = "relative";

  wrapper.innerHTML = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
        fill="var(--color-primary, oklch(0.54 0.27 287))"
      />
      <circle cx="12" cy="9" r="3" fill="var(--color-primary-foreground, white)" />
    </svg>
    <span class="mapbox-pin-pulse"></span>
  `;

  return wrapper;
}

let styleInjected = false;

export function injectPinStyles(): void {
  if (styleInjected || typeof document === "undefined") return;
  styleInjected = true;

  const style = document.createElement("style");
  style.textContent = `
    .mapbox-pin-pulse {
      position: absolute;
      bottom: -2px;
      left: 50%;
      width: 8px;
      height: 8px;
      margin-left: -4px;
      border-radius: 50%;
      background: var(--color-primary, oklch(0.54 0.27 287));
      opacity: 0.6;
      animation: mapbox-pin-pulse-ring 2s ease-out infinite;
    }

    @keyframes mapbox-pin-pulse-ring {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      100% {
        transform: scale(3);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
