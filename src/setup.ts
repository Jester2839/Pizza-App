import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Po každém testu vyčistíme DOM, aby se testy neovlivňovaly
afterEach(() => {
  cleanup();
});