/**
 * Lightbox auf <dialog>: Tastatur (←/→/Pos1/Ende/Esc), Wischen, Fokus zurück
 * auf die auslösende Kachel. Navigiert innerhalb der angeklickten Sammlung.
 */
import { bewegungErlaubt } from './bewegung';

const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');

if (dialog) {
  const bild = dialog.querySelector<HTMLImageElement>('[data-lb-bild] img')!;
  const [avif, webp] = dialog.querySelectorAll<HTMLSourceElement>('[data-lb-bild] source');
  const zaehler = dialog.querySelector<HTMLElement>('[data-lb-zaehler]')!;
  const titel = dialog.querySelector<HTMLElement>('[data-lb-titel]')!;
  const buehne = dialog.querySelector<HTMLElement>('[data-lb-buehne]')!;
  let liste: HTMLElement[] = [];
  let index = 0;
  let ausloeser: HTMLElement | null = null;

  const setzeQuellen = (el: HTMLElement) => {
    avif.srcset = el.dataset.avif ?? '';
    webp.srcset = el.dataset.webp ?? '';
    avif.sizes = webp.sizes = '100vw';
    bild.src = el.dataset.src ?? '';
    bild.width = Number(el.dataset.breite) || 0;
    bild.height = Number(el.dataset.hoehe) || 0;
    bild.alt = el.dataset.alt ?? '';
  };

  const vorladen = (i: number) => {
    const el = liste[(i + liste.length) % liste.length];
    if (!el?.dataset.src) return;
    const p = new Image();
    p.src = el.dataset.src;
  };

  const zeige = (i: number, richtung = 0) => {
    index = (i + liste.length) % liste.length;
    const el = liste[index];
    const wechsel = () => {
      setzeQuellen(el);
      zaehler.textContent = `Bild ${index + 1} von ${liste.length}`;
      titel.textContent = el.dataset.titel || el.dataset.alt || '';
      bild.classList.remove('wechselt');
      bild.style.transform = '';
    };
    if (richtung && bewegungErlaubt() && dialog.open) {
      bild.classList.add('wechselt');
      setTimeout(wechsel, 180);
    } else wechsel();
    vorladen(index + 1);
    vorladen(index - 1);
  };

  const oeffne = (el: HTMLElement) => {
    const sammlung = el.closest('[data-lightbox-sammlung]') ?? document;
    liste = [...sammlung.querySelectorAll<HTMLElement>('[data-lightbox-bild]')];
    ausloeser = el;
    zeige(Math.max(0, liste.indexOf(el)));
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    dialog.querySelector<HTMLButtonElement>('[data-lb-vor]')?.focus();
  };

  const schliesse = () => {
    if (dialog.open) dialog.close();
  };

  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    ausloeser?.focus();
  });

  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-lightbox-bild]');
    if (!el || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    oeffne(el);
  });

  dialog.querySelector('[data-lb-zu]')!.addEventListener('click', schliesse);
  dialog.querySelector('[data-lb-vor]')!.addEventListener('click', () => zeige(index + 1, 1));
  dialog.querySelector('[data-lb-zurueck]')!.addEventListener('click', () => zeige(index - 1, -1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      zeige(index + 1, 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      zeige(index - 1, -1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      zeige(0, -1);
    } else if (e.key === 'End') {
      e.preventDefault();
      zeige(liste.length - 1, 1);
    }
  });
  // Klick neben das Bild schließt
  buehne.addEventListener('click', (e) => {
    if (e.target === buehne) schliesse();
  });

  // Wischen
  let startX = 0;
  let startY = 0;
  let zieht = false;
  buehne.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    zieht = true;
    startX = e.clientX;
    startY = e.clientY;
  });
  buehne.addEventListener('pointermove', (e) => {
    if (!zieht || !bewegungErlaubt()) return;
    const dx = e.clientX - startX;
    bild.style.transform = `translateX(${dx * 0.6}px)`;
  });
  const ende = (e: PointerEvent) => {
    if (!zieht) return;
    zieht = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    bild.style.transform = '';
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) zeige(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  };
  buehne.addEventListener('pointerup', ende);
  buehne.addEventListener('pointercancel', () => {
    zieht = false;
    bild.style.transform = '';
  });
}
