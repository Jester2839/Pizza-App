// =========================================
// DOM UTILITY LIBRARY
// =========================================

/**
 * querySelector shortcut
 */
export function $<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: Document | HTMLElement = document
): T | null {
  return parent.querySelector<T>(selector);
}

/**
 * querySelectorAll shortcut - vrací pole
 */
export function $$<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: Document | HTMLElement = document
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

/**
 * getElementById shortcut
 */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/**
 * Najde nejbližšího rodiče odpovídajícího selektoru
 */
export function closest<T extends HTMLElement = HTMLElement>(
  element: HTMLElement,
  selector: string
): T | null {
  return element.closest<T>(selector);
}

// =========================================
// CLASS MANIPULATION
// =========================================

export function addClass(element: HTMLElement | null, ...classes: string[]): void {
  element?.classList.add(...classes);
}

export function removeClass(element: HTMLElement | null, ...classes: string[]): void {
  element?.classList.remove(...classes);
}

export function toggleClass(element: HTMLElement | null, className: string): boolean {
  return element?.classList.toggle(className) ?? false;
}

export function hasClass(element: HTMLElement | null, className: string): boolean {
  return element?.classList.contains(className) ?? false;
}

/**
 * Nahradí jednu třídu jinou
 */
export function replaceClass(
  element: HTMLElement | null,
  oldClass: string,
  newClass: string
): void {
  if (!element) return;
  removeClass(element, oldClass);
  addClass(element, newClass);
}

// =========================================
// CONTENT MANIPULATION
// =========================================

export function setText(element: HTMLElement | null, text: string): void {
  if (element) element.innerText = text;
}

export function setHtml(element: HTMLElement | null, html: string): void {
  if (element) element.innerHTML = html;
}

export function getValue(element: HTMLInputElement | null): string {
  return element?.value ?? '';
}

export function setValue(element: HTMLInputElement | null, value: string): void {
  if (element) element.value = value;
}

// =========================================
// STYLES & VISIBILITY
// =========================================

export function setStyle(
  element: HTMLElement | null,
  styles: Partial<CSSStyleDeclaration>
): void {
  if (!element) return;
  Object.assign(element.style, styles);
}

export function show(element: HTMLElement | null): void {
  if (element) element.style.display = '';
}

export function hide(element: HTMLElement | null): void {
  if (element) element.style.display = 'none';
}

// =========================================
// ANIMATIONS
// =========================================

/**
 * Fade out element a poté ho odstraní
 */
export function fadeOutAndRemove(
  element: HTMLElement | null,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }
    
    setStyle(element, {
      transition: `opacity ${duration}ms, transform ${duration}ms`,
      opacity: '0',
      transform: 'translateX(20px)',
    });
    
    setTimeout(() => {
      element.remove();
      resolve();
    }, duration);
  });
}

/**
 * Fade in element
 */
export function fadeIn(element: HTMLElement | null, duration: number = 300): void {
  if (!element) return;
  
  setStyle(element, { opacity: '0' });
  // Force reflow
  element.offsetHeight;
  setStyle(element, {
    transition: `opacity ${duration}ms`,
    opacity: '1',
  });
}

// =========================================
// EVENT HELPERS
// =========================================

export function on<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | null,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions
): void {
  element?.addEventListener(event, handler, options);
}

export function onClick(
  element: HTMLElement | null,
  handler: (e: MouseEvent) => void
): void {
  on(element, 'click', handler);
}

/**
 * Delegovaný event listener
 */
export function delegate<T extends HTMLElement = HTMLElement>(
  parent: HTMLElement | null,
  selector: string,
  event: keyof HTMLElementEventMap,
  handler: (e: Event, target: T) => void
): void {
  if (!parent) return;
  
  parent.addEventListener(event, (e) => {
    const target = (e.target as HTMLElement).closest<T>(selector);
    if (target && parent.contains(target)) {
      handler(e, target);
    }
  });
}

// =========================================
// DOM CREATION
// =========================================

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes?: Record<string, string>,
  children?: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });
  }
  
  if (children) {
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }
  
  return element;
}

// =========================================
// WINDOW HELPERS
// =========================================

/**
 * Registruje funkci na window objekt pro použití z HTML
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exposeGlobal(name: string, fn: (...args: any[]) => any): void {
  (window as unknown as Record<string, unknown>)[name] = fn;
}

/**
 * Vrací query parametr z URL
 */
export function getQueryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Naviguje na URL
 */
export function navigateTo(url: string): void {
  window.location.href = url;
}
