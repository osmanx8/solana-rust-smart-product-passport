// Comprehensive polyfills for Node.js modules in browser
import { Buffer } from 'buffer'
import process from 'process'

// Set up global polyfills
globalThis.Buffer = Buffer
globalThis.process = process
window.Buffer = Buffer
window.process = process

// Ensure Buffer is available everywhere
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}
if (typeof window.Buffer === 'undefined') {
  window.Buffer = Buffer
}

// Additional polyfills for common Node.js globals
if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis
}

// Export for use in other modules
export { Buffer, process } 