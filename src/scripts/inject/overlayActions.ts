import { registerEvents } from './captureActions';

export function registerOverlayEvents() {
  let overlay : HTMLElement = document.querySelector('#overlay');
  const startButton : HTMLElement = document.querySelector('#overlay-wizard-button');
  startButton.onclick = () => {
    overlay.remove();
    overlay = null;
    registerEvents();
  };
}
