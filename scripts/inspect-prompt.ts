/**
 * Inspect Prompt - 실제 생성된 프롬프트 내용을 확인
 */

import { generatePrompt } from "../lib/prompt-generator"
import { sampleSchemas } from "../lib/sample-data"

const result = generatePrompt(sampleSchemas.github, "react", "tailwind")

if (result.success && result.prompt) {
  console.log("=".repeat(80))
  console.log("FULL PROMPT FOR GITHUB SCHEMA")
  console.log("=".repeat(80))
  console.log(result.prompt)
  console.log("\n" + "=".repeat(80))
  console.log(`Total Length: ${result.prompt.length} characters`)
  console.log("=".repeat(80))
} else {
  console.log("❌ Failed to generate prompt")
  console.log(result.errors)
}
