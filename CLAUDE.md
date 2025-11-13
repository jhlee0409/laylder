# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Laylder는 AI 기반 코드 생성을 위한 비주얼 레이아웃 빌더입니다. 사용자가 드래그 앤 드롭으로 컴포넌트를 배치하면 Schema V2를 생성하고, 이를 AI 프롬프트로 변환하여 실제 프로덕션 코드를 생성합니다.

**핵심 기술**: Next.js 15 (App Router), React 19, TypeScript, Zustand, Konva (Canvas), Unit Tests (TypeScript)

## 개발 명령어

```bash
# 개발 서버 실행 (http://localhost:3000)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 검사
pnpm lint

# AI Model Strategies 테스트 실행
npx tsx scripts/test-ai-model-strategies.ts

# Grok Strategy 테스트 실행
npx tsx scripts/test-grok-strategy.ts

# Schema V2 검증 스크립트
npx tsx scripts/validate-schema-v2.ts
```

## 아키텍처 핵심 개념

### Schema V2 - Component Independence

Laylder의 핵심은 **Schema V2**로, 기존 V1의 grid-template-areas 방식을 버리고 **Component Independence** 원칙을 채택했습니다.

**설계 원칙 (types/schema-v2.ts)**:
1. **Component Independence**: 각 컴포넌트가 독립적으로 positioning, layout, styling 정의
2. **Flexbox First, Grid Secondary**: Flexbox를 페이지 구조에, Grid를 카드 배치에 사용
3. **Semantic HTML First**: 시맨틱 태그에 적합한 positioning 전략 적용 (header → fixed/sticky, footer → static)
4. **Responsive Per Component**: 컴포넌트별로 반응형 동작 정의
5. **Separation of Concerns**: Layout(배치)과 Style(스타일) 명확히 분리

**Component 구조**:
```typescript
interface Component {
  id: string
  name: string  // PascalCase
  semanticTag: "header" | "nav" | "main" | "aside" | "footer" | "section" | "article" | "div" | "form"
  positioning: ComponentPositioning  // fixed, sticky, static, absolute, relative
  layout: ComponentLayout  // flex, grid, container, none
  styling?: ComponentStyling  // width, height, background, border, shadow, className
  responsive?: ResponsiveBehavior  // mobile, tablet, desktop별 override
  responsiveCanvasLayout?: ResponsiveCanvasLayout  // Canvas 배치 정보
}
```

**LayoutConfig** (grid-template-areas 없음):
```typescript
interface LayoutConfig {
  structure: "vertical" | "horizontal" | "sidebar-main" | "sidebar-main-sidebar" | "custom"
  components: string[]  // 배치 순서
  containerLayout?: ContainerLayoutConfig  // 전체 컨테이너 레이아웃
  roles?: { header?: string; sidebar?: string; main?: string; footer?: string }
}
```

**V1 vs V2 비교**:
- **V1 문제**: 모든 컴포넌트를 grid-template-areas로 강제 배치 → 비현실적
- **V2 해결**: 각 컴포넌트가 자신의 positioning 전략을 가짐 → 실제 프로덕션 패턴

### State Management - Zustand

**store/layout-store-v2.ts**가 핵심 상태 관리를 담당합니다.

**주요 State**:
- `schema`: LaydlerSchemaV2 (components, breakpoints, layouts)
- `currentBreakpoint`: "mobile" | "tablet" | "desktop"
- `selectedComponentId`: 현재 선택된 컴포넌트

**주요 Actions**:
- Component 관리: `addComponent`, `updateComponent`, `deleteComponent`, `duplicateComponent`
- V2 특화: `updateComponentPositioning`, `updateComponentLayout`, `updateComponentStyling`, `updateComponentResponsive`
- Layout 관리: `updateLayout`, `addComponentToLayout`, `reorderComponentsInLayout`
- Breakpoint 관리: `setCurrentBreakpoint`, `addBreakpoint`, `updateBreakpoint`, `deleteBreakpoint`
- Schema 작업: `exportSchema`, `importSchema`, `loadSampleSchema`, `resetSchema`

**Breakpoint Inheritance**: `normalizeSchemaV2()`를 통해 Mobile → Tablet → Desktop 순서로 상속 처리

### Canvas System - Konva

**components/canvas-v2/** 디렉토리가 Canvas 렌더링을 담당합니다.

**구조**:
- `KonvaCanvasV2.tsx`: Konva Stage/Layer를 사용한 Canvas 구현
- `ComponentNodeV2.tsx`: 개별 컴포넌트를 Konva Rect로 렌더링
- `CanvasV2.tsx`: Canvas + 컴포넌트 관리 로직

**Canvas Layout**:
```typescript
interface CanvasLayout {
  x: number  // Grid column 시작 위치
  y: number  // Grid row 시작 위치
  width: number  // Grid column span
  height: number  // Grid row span
}
```

Canvas는 **Grid 기반 좌표계** (기본 12×20)를 사용하여 자유로운 드래그 앤 드롭을 지원합니다.

**Smart Layout System** (2025-11-13 추가):

`lib/smart-layout.ts`가 positioning/layout 기반 스마트 배치를 담당합니다.

**핵심 함수**:
- `calculateSmartPosition()`: semanticTag와 positioning을 기반으로 최적 배치 위치 자동 계산
- `findEmptySlot()`: 빈 공간 찾기 (collision 방지)
- `getRecommendedSize()`: 컴포넌트 타입별 추천 크기 반환

**배치 전략 (2025년 최신 웹 레이아웃 패턴 반영)**:
- **Header** (sticky/fixed): 최상단 (y=0), 전체 너비
- **Footer** (static): 최하단, 전체 너비
- **Sidebar** (aside): 좌측 (x=0) 또는 우측 끝단, 전체 높이의 1/4 너비
- **Nav** (sticky/fixed): Header 아래 또는 최상단
- **Main**: 중앙 영역 (header/sidebar 고려하여 가용 공간 최대 활용)
- **기타** (section, article, div, form): 빈 공간에 1x1 크기로 자동 배치

**기본 그리드 크기**: 드롭 시 기본 1×1 크기 (스마트 배치 로직이 semanticTag에 따라 자동 조정)

### AI Prompt Generation

**lib/prompt-generator-v2.ts**가 Schema V2를 AI 프롬프트로 변환합니다.

**생성 흐름**:
1. Schema normalization (breakpoint inheritance 적용)
2. Schema validation (`lib/schema-validation-v2.ts`)
3. Template 선택 (`lib/prompt-templates-v2.ts`)
4. Prompt sections 생성:
   - System prompt (V2 아키텍처 설명)
   - Components section (positioning, layout, styling, responsive)
   - Layouts section (structure 기반)
   - Instructions section (V2 구현 지침)
   - Full Schema JSON (참조용)

**검증 기준** (lib/schema-validation-v2.ts):
- Component name은 PascalCase
- Header는 fixed/sticky 권장, Footer는 static 권장
- Flex layout은 flex config 필요, Grid layout은 cols/rows 필요
- Layout의 components가 실제 component ID를 참조하는지 확인

### Component Library

**lib/component-library-v2.ts**는 사전 정의된 컴포넌트 템플릿을 제공합니다.

**카테고리**:
- **layout**: Sticky Header, Main Content, Footer
- **navigation**: Left Sidebar, Horizontal Navbar
- **content**: Section, Article, Container Div, Hero Section, Card
- **form**: Form, Button Group

각 템플릿은 positioning, layout, styling이 사전 설정되어 있어 드래그 앤 드롭으로 즉시 사용 가능합니다.

### Export & Code Generation

**lib/file-exporter-v2.ts**와 **lib/code-generator-v2.ts**가 Schema를 실제 코드로 변환합니다.

**Export 옵션**:
- **Schema JSON**: Schema V2를 JSON 파일로 내보내기
- **AI Prompt**: Claude/GPT에 복붙할 프롬프트 생성
- **Code Bundle**: React/Tailwind 코드 + 압축 (JSZip)

**코드 생성 전략**:
- Component 단위 독립 파일 생성 (예: `Header.tsx`, `Sidebar.tsx`)
- Tailwind 클래스 자동 변환 (positioning → `fixed top-0`, layout → `flex flex-col`)
- Responsive 처리 (`hidden lg:block`)

## 폴더 구조 특징

```
/app              # Next.js App Router (layout.tsx, page.tsx)
/components       # React 컴포넌트 (V2 suffix)
  /canvas-v2      # Konva Canvas 시스템
  /library-panel-v2
  /properties-panel-v2
  /breakpoint-panel-v2
  /layers-tree-v2
  /export-modal-v2
  /theme-selector-v2
  /initial-breakpoint-modal
  /ui             # shadcn/ui 컴포넌트
/lib              # 핵심 비즈니스 로직 (V2 suffix)
  schema-validation-v2.ts
  schema-utils-v2.ts
  component-library-v2.ts
  prompt-generator-v2.ts
  code-generator-v2.ts
  file-exporter-v2.ts
/store            # Zustand 상태 관리 (V2 suffix)
  layout-store-v2.ts
  theme-store-v2.ts
/types            # TypeScript 타입 정의
  schema-v2.ts    # 핵심 타입 정의
  ai-models.ts    # AI 모델 타입 정의
/scripts          # Unit test scripts
  test-ai-model-strategies.ts
  test-grok-strategy.ts
  validate-schema-v2.ts
/docs             # Schema V2 예시 및 문서
  schema-v2-examples.md
  prompts-v2/
  AI_MODELS_GUIDE.md
```

**V2 Suffix**: V1에서 V2로 마이그레이션 중이며, V2 suffix가 있는 파일이 현재 사용 중인 최신 버전입니다.

## 중요 파일

### 핵심 타입
- **types/schema-v2.ts**: Schema V2 전체 타입 정의

### 상태 관리
- **store/layout-store-v2.ts**: 레이아웃 상태 + actions

### 비즈니스 로직
- **lib/schema-utils-v2.ts**: Schema 생성, 복제, 정규화
- **lib/schema-validation-v2.ts**: Schema 검증 + 에러/경고
- **lib/prompt-generator-v2.ts**: AI 프롬프트 생성
- **lib/component-library-v2.ts**: 사전 정의 템플릿
- **lib/smart-layout.ts**: 스마트 배치 로직 (positioning/semanticTag 기반 자동 배치)

### UI 컴포넌트
- **components/canvas-v2/KonvaCanvasV2.tsx**: Canvas 렌더링
- **components/library-panel-v2/LibraryPanelV2.tsx**: 컴포넌트 라이브러리
- **components/properties-panel-v2/PropertiesPanelV2.tsx**: 속성 편집기

## 🧪 테스트 전략 및 필수 가이드

### 테스트 철학

Laylder는 **Unit 테스트 기반 (Unit-First Testing)** 전략을 사용합니다.

**핵심 원칙**:
1. **비즈니스 로직 검증**: 핵심 로직을 독립적으로 테스트
2. **빠른 피드백**: TypeScript로 작성된 테스트를 즉시 실행
3. **높은 신뢰도**: 각 모듈의 정확성을 보장
4. **회귀 방지**: 모든 주요 기능은 Unit 테스트로 보호

### TypeScript Unit 테스트

**테스트 파일 위치**: `scripts/` 디렉토리

**테스트 실행 환경**: Node.js + TypeScript (tsx)

```bash
# AI Model Strategies 전체 테스트
npx tsx scripts/test-ai-model-strategies.ts

# Grok Strategy 전용 테스트
npx tsx scripts/test-grok-strategy.ts

# Schema V2 검증 테스트
npx tsx scripts/validate-schema-v2.ts
```

### 테스트 파일 구조

```
scripts/
├── test-ai-model-strategies.ts      # AI 모델 전략 종합 테스트
│   ├── Test 1: Factory 기본 동작
│   ├── Test 2: 모델 추천 시스템
│   ├── Test 3: 프롬프트 생성
│   └── Test 4: 프롬프트 차이점 비교
├── test-grok-strategy.ts             # Grok 전략 전용 테스트
└── validate-schema-v2.ts             # Schema 검증 테스트
```

**명명 규칙**:
- `test-[기능명].ts`: 기능별 Unit 테스트
- `validate-[기능명].ts`: 검증 로직 테스트

### 테스트 실행 명령어

```bash
# 모든 AI 모델 전략 테스트 (권장)
npx tsx scripts/test-ai-model-strategies.ts

# Grok 전략만 빠르게 테스트
npx tsx scripts/test-grok-strategy.ts

# Schema 검증 (Schema 수정 시 필수)
npx tsx scripts/validate-schema-v2.ts

# TypeScript 타입 체크 (컴파일 에러 확인)
npx tsc --noEmit

# 린트 검사
pnpm lint
```

### 테스트 작성 필수 규칙

#### 1. 명확한 함수 구조

```typescript
/**
 * Test 1: Factory 기본 동작 테스트
 */
function testFactoryBasics() {
  section("Test 1: Factory 기본 동작 테스트")

  try {
    // 테스트 로직
    const availableModels = getAvailableModelIds()
    log(`✓ 사용 가능한 모델 개수: ${availableModels.length}`, "green")

    return true  // 성공
  } catch (error) {
    log(`❌ 테스트 실패: ${error}`, "red")
    return false  // 실패
  }
}
```

#### 2. AAA 패턴 (Arrange-Act-Assert)

**✅ 권장 (명확한 구조)**:
```typescript
function testPromptGeneration() {
  // Arrange: 초기 데이터 준비
  const schema = sampleSchemas.github
  const strategy = createPromptStrategy('claude-sonnet-4.5')

  // Act: 동작 수행
  const result = strategy.generatePrompt(schema, 'react', 'tailwind', {
    optimizationLevel: 'quality',
    verbosity: 'detailed'
  })

  // Assert: 결과 검증
  if (result.success && result.prompt) {
    log(`✓ 프롬프트 생성 성공`, "green")
    return true
  } else {
    log(`❌ 프롬프트 생성 실패`, "red")
    return false
  }
}
```

#### 3. 명확한 에러 메시지

**❌ 나쁜 예**:
```typescript
if (!result.success) {
  throw new Error("Failed")  // 무엇이 실패했는지 불명확
}
```

**✅ 좋은 예**:
```typescript
if (!result.success) {
  log(`❌ 프롬프트 생성 실패`, "red")
  if (result.errors) {
    result.errors.forEach((error) => log(`  - ${error}`, "red"))
  }
  return false
}
```

#### 4. 검증 포인트 명시

```typescript
// ✅ 좋은 예: 여러 검증 포인트 명시
function testGrokStrategy() {
  const result = strategy.generatePrompt(schema, 'react', 'tailwind', {
    chainOfThought: true
  })

  // 검증 1: 프롬프트 생성 성공
  const hasReasoningPrompt = result.prompt.includes("Reasoning")

  // 검증 2: 실시간 컨텍스트 포함
  const hasCurrentDate = result.prompt.includes("2025")

  // 검증 3: 우선순위 그룹화
  const hasPriorityComponents = result.prompt.includes("Priority Components")

  log(`\n✓ Grok 특화 기능 검증:`, "green")
  log(`  - 추론 기반 접근: ${hasReasoningPrompt ? "✓" : "✗"}`, hasReasoningPrompt ? "green" : "red")
  log(`  - 실시간 컨텍스트: ${hasCurrentDate ? "✓" : "✗"}`, hasCurrentDate ? "green" : "red")
  log(`  - 우선순위 그룹화: ${hasPriorityComponents ? "✓" : "✗"}`, hasPriorityComponents ? "green" : "red")

  return hasReasoningPrompt && hasCurrentDate && hasPriorityComponents
}
```

#### 5. 테스트 독립성 보장

```typescript
// ✅ 좋은 예: 각 테스트가 독립적으로 데이터 준비
function testModelRecommendation() {
  try {
    // 각 테스트마다 독립적으로 데이터 생성
    const recommendations = getModelRecommendations({
      schemaComplexity: "complex",
      responsiveComplexity: "medium",
      costSensitivity: "low"
    })

    // 검증 로직
    return recommendations.length > 0
  } catch (error) {
    return false
  }
}
```

### 테스트 커버리지 기준

**필수 커버리지 (P0)** - AI Model Strategies:
- [x] Factory 기본 동작 (19개 모델 지원)
- [x] 모델 추천 시스템 (3가지 시나리오)
- [x] 프롬프트 생성 (4개 주요 모델)
- [x] 프롬프트 차이점 비교
- [x] Grok 전략 특화 기능
- [x] Token 추정 알고리즘

**권장 커버리지 (P1)**:
- [ ] DeepSeek 비용 최적화 검증
- [ ] Gemini 프레임워크 특화 검증
- [ ] GPT Few-shot Learning 검증
- [ ] Claude Chain-of-Thought 검증
- [ ] 모든 19개 모델 개별 테스트

### 테스트 실패 디버깅

#### 콘솔 로그 활용

```bash
# 테스트 실행 시 상세 로그 출력
npx tsx scripts/test-ai-model-strategies.ts

# 출력 예시:
# ✓ Factory 기본 동작 테스트 통과
# ✓ 모델 추천 시스템 테스트 통과
# ❌ 프롬프트 생성 테스트 실패
#   - 에러: Model metadata not found for: invalid-model
```

**로그 색상 코드 활용**:
- 🟢 `green`: 성공 메시지
- 🔴 `red`: 실패/에러 메시지
- 🟡 `yellow`: 경고 메시지
- 🔵 `blue`: 정보 메시지
- 🔷 `cyan`: 섹션 제목

#### 에러 스택 추적

```typescript
try {
  const strategy = createPromptStrategy(modelId)
  // ... 테스트 로직
} catch (error) {
  log(`❌ 테스트 실패: ${error}`, "red")
  console.error(error)  // 전체 스택 출력
  return false
}
```

#### 디버깅 팁

**1. 중간 값 출력**:
```typescript
const result = strategy.generatePrompt(schema, 'react', 'tailwind')
log(`Prompt length: ${result.prompt?.length}`, "blue")
log(`Estimated tokens: ${result.estimatedTokens}`, "blue")
log(`Sections: ${result.sections?.length}`, "blue")
```

**2. 조건부 검증**:
```typescript
if (result.warnings && result.warnings.length > 0) {
  log(`⚠ 경고 ${result.warnings.length}개:`, "yellow")
  result.warnings.forEach((warning) => log(`  - ${warning}`, "yellow"))
}
```

**3. 샘플 데이터 확인**:
```typescript
// 프롬프트 일부 출력 (디버깅용)
log(`프롬프트 샘플 (첫 500자):`, "magenta")
log(`"${result.prompt.substring(0, 500)}..."`, "blue")
```

### 테스트 작성 워크플로우

#### 1. 테스트 계획 (Plan)

```markdown
## 테스트 계획: 새로운 AI 모델 추가

### 테스트 시나리오
1. **Given**: 새로운 모델 메타데이터 추가 (예: Llama-3)
2. **When**: Factory로 전략 생성 및 프롬프트 생성
3. **Then**: 올바른 프롬프트가 생성됨

### 검증 포인트
- [ ] Factory가 새 모델 ID 인식
- [ ] 적절한 전략 클래스 매핑
- [ ] 프롬프트 생성 성공
- [ ] 토큰 추정 정확성
- [ ] 모델 추천 시스템에서 반영
```

#### 2. 테스트 작성 (Write)

```typescript
/**
 * Test: 새로운 모델 전략 추가 검증
 */
function testNewModelStrategy() {
  section("Test: 새로운 모델 전략 추가")

  try {
    // Arrange: 새로운 모델로 전략 생성
    const strategy = createPromptStrategy('llama-3')
    const schema = sampleSchemas.github

    // Act: 프롬프트 생성
    const result = strategy.generatePrompt(schema, 'react', 'tailwind', {
      optimizationLevel: 'balanced',
      verbosity: 'normal'
    })

    // Assert: 결과 검증
    if (result.success && result.prompt) {
      log(`✓ Llama-3 전략 테스트 통과`, "green")
      log(`  - 토큰: ${result.estimatedTokens}`, "blue")
      log(`  - 길이: ${result.prompt.length}`, "blue")
      return true
    } else {
      log(`❌ Llama-3 전략 테스트 실패`, "red")
      return false
    }
  } catch (error) {
    log(`❌ 오류 발생: ${error}`, "red")
    return false
  }
}
```

#### 3. 실행 및 디버깅 (Run & Debug)

```bash
# 전체 테스트 실행
npx tsx scripts/test-ai-model-strategies.ts

# 특정 모델만 테스트 (코드 수정으로 분리)
npx tsx scripts/test-llama-strategy.ts
```

#### 4. 검증 완료 (Verify)

- [x] 테스트 통과 (100% success rate)
- [x] 모든 모델에서 프롬프트 생성 확인
- [x] Edge case 추가 (invalid model ID, null schema 등)

### 새로운 기능 개발 시 테스트 작성 필수

**워크플로우에 테스트 단계 추가**:

```markdown
## Phase 3: 구현 (40분)
- [ ] Task 3.1: 기능 구현
- [ ] Task 3.2: **Unit 테스트 작성** ← 필수
- [ ] Task 3.3: 테스트 통과 확인
```

**TDD (Test-Driven Development) 권장**:

1. **Red**: 실패하는 테스트 먼저 작성
2. **Green**: 테스트 통과하는 최소 코드 작성
3. **Refactor**: 코드 리팩토링 (테스트는 계속 통과)

```typescript
// 1. Red: 실패하는 테스트
function testO1ModelStrategy() {
  try {
    // o1 모델 전략 생성 (아직 구현 안 됨 → 실패 예상)
    const strategy = createPromptStrategy('o1')
    const result = strategy.generatePrompt(schema, 'react', 'tailwind', {
      optimizationLevel: 'quality'
    })

    // 검증
    if (!result.success) {
      log(`❌ o1 모델 전략 실패 (예상됨)`, "red")
      return false
    }
    return true
  } catch (error) {
    log(`❌ o1 모델 미구현: ${error}`, "red")
    return false  // Red 단계: 실패
  }
}

// 2. Green: 구현
// lib/ai-model-registry.ts에 o1 메타데이터 추가
// lib/prompt-strategies/gpt-strategy.ts에서 o1 최적화 로직 추가

// 3. Refactor: 코드 정리 (테스트는 계속 통과)
// 중복 코드 제거, 함수 분리 등
```

### CI/CD 통합

**GitHub Actions 예시** (`.github/workflows/unit-tests.yml`):

```yaml
name: Unit Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Run TypeScript type check
        run: npx tsc --noEmit

      - name: Run lint
        run: pnpm lint

      - name: Run AI Model Strategy tests
        run: npx tsx scripts/test-ai-model-strategies.ts

      - name: Run Grok Strategy tests
        run: npx tsx scripts/test-grok-strategy.ts

      - name: Run Schema validation
        run: npx tsx scripts/validate-schema-v2.ts

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            test-results/
            *.log
```

### 테스트 베스트 프랙티스

#### ✅ DO (해야 할 것)

1. **비즈니스 로직 직접 테스트**
   ```typescript
   function testPromptGeneration() {
     // AI 모델 전략의 핵심 로직 직접 검증
     const strategy = createPromptStrategy('claude-sonnet-4.5')
     const result = strategy.generatePrompt(schema, 'react', 'tailwind', {
       optimizationLevel: 'quality',
       verbosity: 'detailed'
     })

     // 결과 직접 검증
     return result.success && result.prompt.length > 0
   }
   ```

2. **명확한 테스트 함수 이름**
   ```typescript
   // ✅ 좋은 예
   function testModelRecommendationForComplexSchema() { ... }

   // ❌ 나쁜 예
   function test1() { ... }
   ```

3. **AAA 패턴 (Arrange-Act-Assert) 필수**
   ```typescript
   function testTokenEstimation() {
     // Arrange: 테스트 데이터 준비
     const schema = sampleSchemas.github
     const strategy = createPromptStrategy('gpt-4.1')

     // Act: 동작 수행
     const result = strategy.generatePrompt(schema, 'react', 'tailwind')

     // Assert: 결과 검증
     const hasValidTokens = result.estimatedTokens && result.estimatedTokens > 0
     log(`Token count: ${result.estimatedTokens}`, hasValidTokens ? "green" : "red")
     return hasValidTokens
   }
   ```

4. **상세한 로그 출력**
   ```typescript
   function testGrokStrategy() {
     log(`Testing Grok Strategy...`, "cyan")

     const result = strategy.generatePrompt(schema, 'react', 'tailwind')

     // 상세한 검증 포인트 출력
     log(`✓ Prompt generated`, "green")
     log(`  - Length: ${result.prompt.length}`, "blue")
     log(`  - Tokens: ${result.estimatedTokens}`, "blue")
     log(`  - Sections: ${result.sections?.length}`, "blue")

     return true
   }
   ```

#### ❌ DON'T (하지 말아야 할 것)

1. **하드코딩된 값 사용 금지**
   ```typescript
   // ❌ 나쁜 예
   if (result.estimatedTokens === 2513) { ... }  // 정확한 숫자에 의존

   // ✅ 좋은 예
   if (result.estimatedTokens > 2000 && result.estimatedTokens < 3000) { ... }
   ```

2. **Silent failures (조용한 실패)**
   ```typescript
   // ❌ 나쁜 예
   try {
     const result = strategy.generatePrompt(...)
     return true
   } catch {
     return false  // 에러 내용 숨김
   }

   // ✅ 좋은 예
   try {
     const result = strategy.generatePrompt(...)
     return true
   } catch (error) {
     log(`❌ 오류: ${error}`, "red")
     console.error(error)  // 스택 트레이스 출력
     return false
   }
   ```

3. **테스트 간 의존성**
   ```typescript
   // ❌ 나쁜 예
   let globalStrategy: IPromptStrategy
   function test1() {
     globalStrategy = createPromptStrategy('claude-sonnet-4.5')
   }
   function test2() {
     const result = globalStrategy.generatePrompt(...)  // test1에 의존
   }

   // ✅ 좋은 예: 각 테스트가 독립적
   function test1() {
     const strategy = createPromptStrategy('claude-sonnet-4.5')
     // 독립적으로 테스트
   }
   function test2() {
     const strategy = createPromptStrategy('gpt-4.1')
     // 독립적으로 테스트
   }
   ```

### 테스트 리뷰 체크리스트

새로운 테스트 작성 시 다음을 확인하세요:

```markdown
## 테스트 리뷰 체크리스트
- [ ] 테스트 함수 이름이 명확한가? (testXxxYyy 형식)
- [ ] AAA 패턴을 따르는가? (Arrange-Act-Assert)
- [ ] 모든 검증 포인트에 명확한 로그를 출력하는가?
- [ ] 하드코딩된 값이 없는가? (범위 검증 사용)
- [ ] 테스트가 독립적으로 실행 가능한가?
- [ ] Edge case를 고려했는가? (null, undefined, empty 등)
- [ ] 실패 시 디버깅이 쉬운가? (명확한 에러 메시지 + 스택 트레이스)
- [ ] try-catch로 에러를 적절히 처리하는가?
- [ ] 성공/실패 결과를 명확히 반환하는가? (boolean)
```

### 테스트 유지보수

#### 정기 리뷰 (월 1회)

```markdown
## 테스트 유지보수 체크리스트
- [ ] 주석 처리된 테스트 재활성화 시도
- [ ] 깨진 테스트 수정
- [ ] 중복 테스트 제거
- [ ] 느린 테스트 최적화 (불필요한 처리 제거)
- [ ] Deprecated API 업데이트
- [ ] 새로운 AI 모델 추가 시 테스트 작성
- [ ] Token 추정 정확도 검증 (실제 API와 비교)
```

#### 테스트 실패 시 대응

1. **로컬에서 재현**: `npx tsx scripts/test-ai-model-strategies.ts`
2. **로그 확인**: 콘솔 출력, 에러 메시지, 스택 트레이스
3. **디버거 활용**: VS Code debugger 또는 console.log 추가
4. **데이터 검증**: 입력 스키마, 옵션 값 확인
5. **수정 후 재검증**: 테스트 100% 통과 확인

## 샘플 데이터

**lib/sample-data-v2.ts**에 4가지 실제 레이아웃 샘플이 있습니다:
1. **github**: GitHub 스타일 (Header + Sidebar + Main)
2. **dashboard**: 대시보드 레이아웃 (Fixed Header + Side Menu + Content)
3. **marketing**: 마케팅 사이트 (Sticky Header + Hero + Features + Footer)
4. **cardGallery**: 카드 갤러리 (Header + Grid Layout)

UI에서 `loadSampleSchema("github")`로 로드 가능합니다.

## 개발 시 주의사항

### Schema 정규화 필수

`addComponent`, `addComponentToLayout` 등 Schema를 수정하는 모든 작업 후에는 반드시 `normalizeSchemaV2()`를 호출하여 Breakpoint Inheritance를 적용해야 합니다.

```typescript
// ❌ 잘못된 예
const updatedSchema = {
  ...state.schema,
  components: [...state.schema.components, newComponent]
}

// ✅ 올바른 예
const updatedSchema = {
  ...state.schema,
  components: [...state.schema.components, newComponent]
}
const normalizedSchema = normalizeSchemaV2(updatedSchema)
```

### V2 타입 사용

V1 타입 (LaydlerSchemaV1, LayoutStoreV1 등)은 레거시이며 사용하지 마세요. 항상 V2 타입을 사용하세요.

### Component Name은 PascalCase

Schema validation에서 PascalCase를 강제합니다. `MyComponent`, `Header`, `MainContent` 형식을 사용하세요.

### Positioning 전략 이해

- **header**: `fixed top-0` 또는 `sticky top-0` 권장
- **footer**: `static` 권장
- **sidebar**: `sticky top-16` (header 아래) 또는 `fixed left-0`
- **main**: `static` + `flex-1` 또는 `container` 권장

### Breakpoint Inheritance

- Mobile 설정이 기본값
- Tablet은 Mobile을 상속 (명시적 override만 적용)
- Desktop은 Tablet을 상속 (명시적 override만 적용)

이 패턴은 `normalizeSchemaV2()`에서 자동 처리되므로, 사용자는 변경된 부분만 입력하면 됩니다.

## 코드 작성 가이드

### Zustand Action 작성 시

모든 action은 `set()` 함수 마지막 인자로 action 이름을 전달하여 Redux DevTools에서 추적 가능하게 하세요.

```typescript
addComponent: (component) => {
  set((state) => ({
    schema: { ...state.schema, components: [...state.schema.components, component] }
  }), false, "addComponent")  // ← action 이름
}
```

### Canvas 좌표 계산

Canvas는 Grid 기반이므로, 실제 픽셀 좌표를 Grid 좌표로 변환해야 합니다.

```typescript
const gridX = Math.floor(pixelX / cellWidth)
const gridY = Math.floor(pixelY / cellHeight)
```

### 새로운 Component Template 추가

`lib/component-library-v2.ts`의 `COMPONENT_LIBRARY` 배열에 추가하세요. Template은 반드시 `positioning`, `layout` 필드를 포함해야 합니다.

### AI Prompt Template 수정

`lib/prompt-templates-v2.ts`에서 framework별 template을 수정할 수 있습니다. System prompt, component section, layout section, instructions section으로 구분됩니다.

## 🚨 필수 개발 워크플로우 (MANDATORY)

**모든 작업은 반드시 다음 워크플로우를 따라야 합니다. 이 프로세스는 품질 보증과 컨텍스트 유지를 위해 필수입니다.**

### 1. Plan First (계획 수립)

**모든 작업 시작 전에 반드시 계획을 수립하세요.**

```markdown
## 작업 계획
- [ ] Phase 1: 요구사항 분석 및 관련 파일 파악
- [ ] Phase 2: 구현 설계 및 아키텍처 검토
- [ ] Phase 3: 코드 작성 및 단위 검증
- [ ] Phase 4: Unit 테스트 작성 및 검증
- [ ] Phase 5: 문서화 및 컨텍스트 저장
```

**계획 작성 규칙**:
- 최소 3개 이상의 Phase로 구성
- 각 Phase는 검증 가능한 단위로 분할
- 예상 소요 시간 및 리스크 명시
- Phase 간 의존성 명확히 표시

### 2. Task Breakdown (태스크 분해)

**각 Phase를 구체적인 Task로 분해하세요.**

```markdown
## Phase 1: 요구사항 분석
- [ ] Task 1.1: Schema V2 타입 정의 확인 (types/schema-v2.ts)
- [ ] Task 1.2: 기존 validation 로직 분석 (lib/schema-validation-v2.ts)
- [ ] Task 1.3: 영향받는 컴포넌트 목록 작성
- [ ] Task 1.4: 테스트 케이스 시나리오 설계

## Phase 2: 구현 설계
- [ ] Task 2.1: 새로운 타입 인터페이스 설계
- [ ] Task 2.2: Zustand store action 설계
- [ ] Task 2.3: Validation rule 설계
- [ ] Task 2.4: 에러 핸들링 전략 수립
```

**Task 작성 규칙**:
- Task는 30분 이내 완료 가능한 단위
- 각 Task는 명확한 완료 조건 포함
- Task 번호는 Phase.Task 형식 (예: 1.1, 1.2)
- 의존 관계 있는 Task는 순서 명시

### 3. Continuous Verification (지속적 검증)

**각 Task 완료 후 반드시 검증을 수행하세요.**

#### ✅ Task Level 검증

```bash
# 코드 작성 후 즉시 검증
pnpm lint  # 린트 통과 확인

# TypeScript 타입 검증
npx tsc --noEmit

# Schema 관련 작업 시
npx tsx scripts/validate-schema-v2.ts
```

**검증 실패 시**:
- 다음 Task로 절대 진행하지 마세요
- 실패 원인 분석 → 수정 → 재검증
- 3회 이상 실패 시 접근 방법 재검토

#### ✅ Phase Level 검증

```bash
# Phase 완료 시 통합 검증
pnpm build  # 빌드 성공 확인

# AI Model Strategies 테스트 실행
npx tsx scripts/test-ai-model-strategies.ts

# Grok Strategy 테스트 실행
npx tsx scripts/test-grok-strategy.ts

# Schema 검증 (Schema 관련 작업 시)
npx tsx scripts/validate-schema-v2.ts

# Dev 서버 동작 확인 (UI 작업 시)
pnpm dev
# → http://localhost:3000 접속하여 UI 동작 검증
```

**Phase 완료 기준**:
- 모든 Task 완료 체크
- 빌드 성공 (pnpm build)
- 관련 Unit 테스트 통과 (기존 테스트 깨지지 않음)
- 새로운 기능의 Unit 테스트 작성 및 통과 (기능 추가 시)
- 수동 UI 검증 완료 (UI 작업 시)

#### ✅ 테스트 작성 필수 시점

**다음 작업 시 Unit 테스트 반드시 작성**:

1. **새로운 AI 모델 추가**
   ```markdown
   - [ ] Task 3.1: 모델 메타데이터 추가 (lib/ai-model-registry.ts)
   - [ ] Task 3.2: Unit 테스트 작성 (scripts/test-[model-name]-strategy.ts)
   - [ ] Task 3.3: 테스트 통과 확인 (100% success rate)
   ```

2. **전략 로직 변경**
   ```markdown
   - [ ] Task 2.1: 전략 수정 (예: Token 추정 알고리즘 개선)
   - [ ] Task 2.2: 기존 테스트 업데이트 (scripts/test-ai-model-strategies.ts)
   - [ ] Task 2.3: 새로운 검증 포인트 추가
   ```

3. **버그 수정**
   ```markdown
   - [ ] Task 1.1: 버그 재현 테스트 작성 (실패하는 테스트)
   - [ ] Task 1.2: 버그 수정
   - [ ] Task 1.3: 테스트 통과 확인 (회귀 방지)
   ```

**테스트 작성 생략 가능** (예외):
- 내부 리팩토링 (동작 변경 없음)
- 타입 정의 추가
- 문서화 작업
- 스타일 변경 (CSS만)
- UI 컴포넌트 수정 (비즈니스 로직 없음)

### 4. Documentation & Context Preservation (문서화 및 컨텍스트 보존)

**Phase 완료 시마다 반드시 문서화하세요.**

#### 📝 Phase Summary 작성

**docs/dev-log/** 디렉토리에 작업 로그 작성:

```markdown
# Dev Log: [작업명] - [날짜]

## Phase 1: 요구사항 분석 ✅
- **완료 시간**: 2024-01-15 10:30
- **주요 발견사항**:
  - Schema V2는 Component Independence 원칙 기반
  - normalizeSchemaV2()가 Breakpoint Inheritance 처리
  - validation은 PascalCase naming 강제
- **영향받는 파일**:
  - types/schema-v2.ts (타입 정의)
  - lib/schema-validation-v2.ts (검증 로직)
  - store/layout-store-v2.ts (상태 관리)
- **다음 Phase 전제조건**: Schema 구조 이해 완료

## Phase 2: 구현 설계 ✅
- **완료 시간**: 2024-01-15 12:00
- **설계 결정사항**:
  1. ComponentPositioning에 새로운 type 추가
  2. Validation rule 확장 (semantic tag 검증 강화)
  3. Error message 한글화
- **검증 완료**:
  - TypeScript 컴파일 통과
  - 기존 테스트 모두 통과
- **리스크**: 기존 샘플 데이터 호환성 확인 필요
```

#### 📚 Context File 업데이트

**중요 결정사항은 CLAUDE.md나 별도 context 파일에 기록**:

```markdown
## Context: [기능명] Implementation

### 핵심 개념
- **문제**: 기존 방식의 한계점 설명
- **해결**: 새로운 접근 방법 설명
- **근거**: 왜 이 방법을 선택했는지

### 중요 파일 및 역할
- `lib/schema-validation-v2.ts`: 검증 로직, line 150-200 참조
- `store/layout-store-v2.ts`: normalizeSchemaV2() 호출 패턴, line 145

### 주의사항
- normalizeSchemaV2() 누락 시 Breakpoint Inheritance 동작 안 함
- PascalCase 검증 실패 시 명확한 에러 메시지 제공 필요

### 테스트 시나리오
1. 정상 케이스: 모든 필드 올바른 값
2. 에러 케이스: Component name이 camelCase
3. 경계 케이스: Breakpoint 없는 상태에서 추가

### 다음 작업자를 위한 힌트
- Schema 수정 시 반드시 normalizeSchemaV2() 호출
- Validation 추가 시 ValidationError/Warning 타입 사용
- Unit 테스트는 AAA 패턴 기반으로 작성
- 새 AI 모델 추가 시 Factory 매핑 필수
```

### 5. Gate Keeping (게이트 키핑)

**다음 Phase로 이동하기 전 체크리스트:**

```markdown
## Phase 완료 체크리스트 (Gate)
- [ ] 모든 Task 완료 확인
- [ ] 린트 통과 (pnpm lint)
- [ ] 빌드 성공 (pnpm build)
- [ ] TypeScript 타입 체크 통과 (npx tsc --noEmit)
- [ ] 관련 Unit 테스트 통과 (npx tsx scripts/test-*.ts)
- [ ] Schema 검증 통과 (해당 시)
- [ ] Dev 서버 정상 동작 확인 (UI 작업 시)
- [ ] Phase Summary 문서 작성 완료
- [ ] Context 파일 업데이트 완료
- [ ] Git commit 완료 (의미 있는 단위)
```

**⚠️ 하나라도 미완료 시 다음 Phase 진행 금지**

### 6. Session Context Maintenance (세션 컨텍스트 유지)

**장시간 작업 시 컨텍스트 손실 방지:**

#### 30분마다 Checkpoint

```markdown
## Checkpoint: [시간]
- **현재 Phase**: Phase 2 - Task 2.3 진행 중
- **완료된 작업**: Task 2.1, 2.2 완료
- **현재 상태**: Validation rule 작성 중
- **다음 할 일**: Task 2.3 완료 → Task 2.4 시작
- **기억해야 할 것**:
  - normalizeSchemaV2()는 모든 Schema 수정 후 호출
  - PascalCase 검증은 regex: /^[A-Z][a-zA-Z0-9]*$/
  - 테스트 파일: scripts/test-ai-model-strategies.ts
  - Factory는 provider 기반 매핑 사용
```

#### Context Loss 복구 프로토콜

**세션 재개 시 (새로운 대화 시작 등):**

1. **CLAUDE.md 재확인**: 아키텍처 재숙지
2. **최신 Dev Log 읽기**: 마지막 작업 상태 파악
3. **Git log 확인**: 최근 변경사항 확인
4. **진행 중인 Plan 확인**: 다음 Task 식별
5. **검증 재수행**: 현재 상태 확인 (lint, build, test)

### 7. Quality Gates (품질 게이트)

**최종 완료 전 필수 통과 항목:**

```bash
# Gate 1: 코드 품질
pnpm lint
npx tsc --noEmit

# Gate 2: 기능 검증 (Unit Tests)
pnpm build
npx tsx scripts/test-ai-model-strategies.ts
npx tsx scripts/test-grok-strategy.ts

# Gate 3: Schema 일관성 (Schema 관련 작업 시)
npx tsx scripts/validate-schema-v2.ts

# Gate 4: 수동 검증 (UI 작업 시)
pnpm dev
# → 브라우저에서 실제 UI 동작 확인
```

**모든 Gate 통과 시에만 작업 완료로 간주**

## 워크플로우 예시

### Example: 새로운 Component Type 추가

```markdown
## Plan: "grid-item" Positioning Type 추가

### Phase 1: 분석 (30분)
- [ ] Task 1.1: ComponentPositioning 타입 구조 분석
- [ ] Task 1.2: 기존 positioning type 사용 패턴 조사
- [ ] Task 1.3: grid-item이 필요한 use case 정의
- [ ] Task 1.4: 영향받는 파일 목록 작성
- **검증**: 타입 구조 이해 완료, use case 명확화

### Phase 2: 타입 정의 (20분)
- [ ] Task 2.1: types/schema-v2.ts에 "grid-item" 추가
- [ ] Task 2.2: ComponentPositioning 인터페이스 확장
- **검증**: TypeScript 컴파일 통과

### Phase 3: Validation (30분)
- [ ] Task 3.1: lib/schema-validation-v2.ts 업데이트
- [ ] Task 3.2: grid-item 전용 validation rule 추가
- [ ] Task 3.3: 에러 메시지 작성
- **검증**: Schema validation 테스트 통과

### Phase 4: Store 통합 (40분)
- [ ] Task 4.1: store/layout-store-v2.ts action 업데이트
- [ ] Task 4.2: updateComponentPositioning 테스트
- **검증**: Dev 서버 정상 동작, UI 반영 확인

### Phase 5: 테스트 및 문서화 (50분)
- [ ] Task 5.1: Unit 테스트 케이스 추가 (해당 시)
- [ ] Task 5.2: sample-data-v2.ts에 예시 추가 (Schema 작업 시)
- [ ] Task 5.3: Dev Log 작성
- [ ] Task 5.4: CLAUDE.md 업데이트
- **검증**: 전체 테스트 통과, 문서화 완료

### 최종 검증
- [ ] pnpm lint ✅
- [ ] pnpm build ✅
- [ ] npx tsx scripts/test-ai-model-strategies.ts ✅
- [ ] npx tsx scripts/validate-schema-v2.ts ✅ (Schema 작업 시)
- [ ] Dev 서버 수동 테스트 ✅ (UI 작업 시)
- [ ] 문서화 완료 ✅
```

## 워크플로우 체크리스트 (Quick Reference)

**모든 작업 시작 시:**
```
[ ] Plan 작성 (Phase 분할)
[ ] Task 분해 (30분 단위)
[ ] Context 파일 확인 (CLAUDE.md, dev-log)
```

**각 Task 완료 시:**
```
[ ] 코드 작성
[ ] 즉시 검증 (lint, tsc)
[ ] Task 체크 완료
```

**각 Phase 완료 시:**
```
[ ] 통합 검증 (build, test)
[ ] Phase Summary 작성
[ ] Context 파일 업데이트
[ ] Git commit (의미 있는 단위)
[ ] 다음 Phase 진행 여부 결정
```

**30분마다:**
```
[ ] Checkpoint 작성 (현재 상태 기록)
```

**최종 완료 시:**
```
[ ] 모든 Quality Gate 통과
[ ] 전체 문서화 완료
[ ] Dev Log 최종 업데이트
```

## 문서 참조

- **docs/schema-v2-examples.md**: Schema V2 예시 및 생성 코드 샘플
- **docs/prompts-v2/**: 각 샘플 레이아웃별 AI 프롬프트 예시
- **docs/dev-log/**: 개발 작업 로그 및 컨텍스트 (작업 시 생성)
