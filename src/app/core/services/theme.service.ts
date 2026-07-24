import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { safeSetItem } from './safe-storage';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'dg.theme';

/**
 * Tema de la app: dark por defecto, light como toggle.
 * La primera vez respeta `prefers-color-scheme`; después persiste la elección.
 * Aplica `data-theme` en <html>.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject: BehaviorSubject<Theme>;

  constructor() {
    this.themeSubject = new BehaviorSubject<Theme>(this.resolveInitial());
    this.apply(this.themeSubject.value);
  }

  get theme$() {
    return this.themeSubject.asObservable();
  }

  get current(): Theme {
    return this.themeSubject.value;
  }

  toggle(): void {
    this.set(this.current === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    safeSetItem(STORAGE_KEY, theme);
    this.apply(theme);
    this.themeSubject.next(theme);
  }

  private resolveInitial(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      // sin storage → seguir con la detección
    }
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
