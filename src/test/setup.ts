// src/test/setup.ts

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('../config/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn()
  },
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn()
  },
  storage: {
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn()
  },
  googleProvider: {}
}));

// Mock console methods para pruebas más limpias
global.console = {
  ...console,
  // Silenciar logs durante las pruebas
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Mock window.location para pruebas de navegación
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    reload: vi.fn()
  },
  writable: true
});

// Mock IntersectionObserver para componentes que lo usen
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Configuración global para fast-check
import fc from 'fast-check';

// Configurar fast-check para ser más determinístico en CI
fc.configureGlobal({
  numRuns: process.env.CI ? 50 : 100, // Menos iteraciones en CI
  verbose: process.env.NODE_ENV === 'development'
});