// Replacement for next/dist/build/polyfills/polyfill-module.
// Our .browserslistrc targets only modern browsers (Chrome 111+, Safari 16.4+,
// etc.) that already implement Array.prototype.at/flat/flatMap,
// Object.fromEntries/hasOwn, String.prototype.trimStart/trimEnd, and friends.
// Shipping the polyfills costs ~11 KiB on every page for nothing.
export {}
