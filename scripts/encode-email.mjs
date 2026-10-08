// Prints the value for `emailEncoded` in src/config/site.ts.
// Usage: npm run encode-email -- you@example.com
const address = process.argv[2]?.trim()
if (!address || !address.includes('@')) {
  console.error('Usage: npm run encode-email -- you@example.com')
  process.exit(1)
}
console.log(Buffer.from([...address].reverse().join('')).toString('base64'))
