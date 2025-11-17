/**
 * Test Prompt Alignment with Component Library
 *
 * Verify that generated prompts reflect the new "layout-only" philosophy
 */

import { githubStyleSchema } from "../lib/sample-data"
import { generatePrompt } from "../lib/prompt-generator"

const result = generatePrompt(githubStyleSchema, "react", "tailwind")

if (result.success && result.prompt) {
  console.log("=".repeat(80))
  console.log("TESTING: Component CSS in Generated Prompt")
  console.log("=".repeat(80))

  // Check for theme colors IN COMPONENT SPECIFICATIONS (NOT in "DO NOT" section)
  // Extract only the Components section of the prompt
  const componentsSectionMatch = result.prompt!.match(/## Components\n\n([\s\S]+?)---\n\n## Responsive Page Structure/)
  const componentsSection = componentsSectionMatch ? componentsSectionMatch[1] : ''

  const themeColors = [
    'bg-white',
    'bg-blue-',
    'bg-purple-',
    'bg-gradient',
    'from-blue',
    'to-purple',
    'shadow-sm',
    'shadow-md',
    'shadow-lg'
  ]

  const foundThemeColors: string[] = []
  themeColors.forEach(color => {
    if (componentsSection.includes(color)) {
      foundThemeColors.push(color)
    }
  })

  if (foundThemeColors.length > 0) {
    console.log("\n❌ ISSUE: Found theme colors/styling in COMPONENT specifications:")
    foundThemeColors.forEach(c => console.log(`   - ${c}`))
  } else {
    console.log("\n✅ No theme colors in component specifications")
  }

  // Check for layout-only elements that SHOULD be present
  const layoutElements = [
    'border-gray',
    'focus-within:ring',
    'motion-reduce',
    'role=',
    'aria-label'
  ]

  const foundLayoutElements: string[] = []
  layoutElements.forEach(elem => {
    if (result.prompt!.includes(elem)) {
      foundLayoutElements.push(elem)
    }
  })

  console.log("\n✅ Layout-only elements found:")
  foundLayoutElements.forEach(e => console.log(`   - ${e}`))

  // Check component sections for alignment
  console.log("\n" + "=".repeat(80))
  console.log("Component Sections Check")
  console.log("=".repeat(80))

  const headerMatch = result.prompt!.match(/### 1\. Header[\s\S]{0,800}?---/)
  if (headerMatch) {
    console.log("\n📋 Header Component:")
    const hasTheme = /bg-white|shadow/.test(headerMatch[0])
    const hasBorder = /border/.test(headerMatch[0])
    const hasARIA = /role|aria/.test(headerMatch[0])
    const hasFocus = /focus-within/.test(headerMatch[0])

    console.log(`   Theme colors: ${hasTheme ? '❌ FOUND' : '✅ NOT FOUND'}`)
    console.log(`   Border (layout): ${hasBorder ? '✅ YES' : '❌ NO'}`)
    console.log(`   ARIA attributes: ${hasARIA ? '✅ YES' : '❌ NO'}`)
    console.log(`   Focus states: ${hasFocus ? '✅ YES' : '❌ NO'}`)
  }

  // Count total components in prompt
  const componentCount = (result.prompt!.match(/### \d+\. \w+/g) || []).length
  console.log(`\n📊 Total components in prompt: ${componentCount}`)

  // Final verdict
  console.log("\n" + "=".repeat(80))
  if (foundThemeColors.length === 0 && foundLayoutElements.length > 0) {
    console.log("✅ PROMPT ALIGNED: Layout-only philosophy confirmed")
  } else {
    console.log("⚠️  PROMPT MISALIGNMENT: Review needed")
  }
  console.log("=".repeat(80))
}
