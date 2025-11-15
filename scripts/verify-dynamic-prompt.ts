/**
 * Verify Dynamic Breakpoint Prompt Generation
 *
 * This script validates that prompts are correctly generated for custom breakpoints.
 */

import { generatePrompt } from '../lib/prompt-generator'
import type { LaydlerSchema } from '../types/schema'

// Test schema with custom breakpoints
const customBreakpointSchema: LaydlerSchema = {
  schemaVersion: '2.0',
  components: [
    {
      id: 'c1',
      name: 'Header',
      semanticTag: 'header',
      positioning: { type: 'sticky', position: { top: 0 } },
      layout: { type: 'flex', flex: { direction: 'row' } },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 0, width: 4, height: 1 },
        laptop: { x: 0, y: 0, width: 10, height: 1 },
        ultrawide: { x: 0, y: 0, width: 16, height: 1 },
      },
    },
    {
      id: 'c2',
      name: 'Main',
      semanticTag: 'main',
      positioning: { type: 'static' },
      layout: { type: 'container', container: { maxWidth: 'xl', centered: true } },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 1, width: 4, height: 6 },
        laptop: { x: 0, y: 1, width: 10, height: 8 },
        ultrawide: { x: 0, y: 1, width: 16, height: 8 },
      },
    },
  ],
  breakpoints: [
    { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
    { name: 'laptop', minWidth: 1440, gridCols: 10, gridRows: 10 },
    { name: 'ultrawide', minWidth: 2560, gridCols: 16, gridRows: 10 },
  ],
  layouts: {
    mobile: { structure: 'vertical', components: ['c1', 'c2'] },
    laptop: { structure: 'vertical', components: ['c1', 'c2'] },
    ultrawide: { structure: 'vertical', components: ['c1', 'c2'] },
  },
}

console.log('🧪 Testing Dynamic Breakpoint Prompt Generation\n')
console.log('Schema Breakpoints:', customBreakpointSchema.breakpoints.map(bp => bp.name).join(', '))
console.log('')

// Generate prompt
const result = generatePrompt(customBreakpointSchema, 'react', 'tailwind')

if (!result.success || !result.prompt) {
  console.error('❌ Prompt generation failed:')
  console.error('Errors:', result.errors)
  process.exit(1)
}

console.log('✅ Prompt generated successfully\n')

// Verify custom breakpoint names appear in prompt
const checkpoints = [
  { name: 'laptop', expected: true, description: 'Custom breakpoint "laptop"' },
  { name: 'ultrawide', expected: true, description: 'Custom breakpoint "ultrawide"' },
  { name: 'Laptop', expected: true, description: 'Capitalized "Laptop"' },
  { name: 'Ultrawide', expected: true, description: 'Capitalized "Ultrawide"' },
  { name: '1440', expected: true, description: 'laptop minWidth (1440px)' },
  { name: '2560', expected: true, description: 'ultrawide minWidth (2560px)' },
  { name: 'Visual Layout (Canvas Grid)', expected: true, description: 'Canvas Grid section' },
  { name: 'Component Order (DOM)', expected: true, description: 'DOM order section' },
]

let allPassed = true

console.log('📋 Verification Checklist:\n')

for (const checkpoint of checkpoints) {
  const found = result.prompt.includes(checkpoint.name)
  const status = found === checkpoint.expected ? '✅' : '❌'
  const statusText = found === checkpoint.expected ? 'PASS' : 'FAIL'

  console.log(`${status} ${statusText}: ${checkpoint.description}`)

  if (found !== checkpoint.expected) {
    allPassed = false
  }
}

console.log('')

// Show prompt structure
console.log('📊 Prompt Structure:\n')
console.log(`- Total length: ${result.prompt.length} characters`)
console.log(`- Has warnings: ${result.warnings ? result.warnings.length : 0}`)
console.log(`- Breakpoints mentioned: ${customBreakpointSchema.breakpoints.length}`)
console.log('')

// Show sample of generated prompt
console.log('📝 Prompt Sample (first 500 characters):\n')
console.log('---')
console.log(result.prompt.substring(0, 500))
console.log('...')
console.log('---\n')

if (allPassed) {
  console.log('🎉 All verifications passed! Dynamic breakpoint support is working correctly.')
  process.exit(0)
} else {
  console.error('❌ Some verifications failed. Check the output above.')
  process.exit(1)
}
