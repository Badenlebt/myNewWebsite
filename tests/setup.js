/**
 * Vitest setup file
 * Ensures localStorage is properly available for module-level code
 * that runs during component imports.
 */

// If localStorage doesn't have getItem (Node.js built-in without --localstorage-file),
// provide a proper implementation
if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
  const store = {}
  globalThis.localStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(k => delete store[k]) },
    get length() { return Object.keys(store).length },
    key: (i) => Object.keys(store)[i] || null
  }
}
