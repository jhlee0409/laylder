import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // 테스트 환경 (DOM 환경)
    environment: 'happy-dom',

    // 글로벌 설정
    globals: true,

    // 테스트 파일 패턴
    include: [
      '**/__tests__/**/*.{test,spec}.{ts,tsx}',
      '**/*.{test,spec}.{ts,tsx}'
    ],

    // 제외할 파일/폴더
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'e2e',
      'scripts'
    ],

    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'lib/**/*.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types/**',
        '**/__tests__/**',
        '**/node_modules/**',
        // Zustand stores는 UI/통합 테스트 필요
        'store/**/*.ts',
        // AI 관련 전략은 별도 테스트 필요
        'lib/prompt-strategies/**/*.ts',
        // 샘플 데이터 및 템플릿
        'lib/sample-data.ts',
        'lib/prompt-templates.ts',
        // AI 서비스 및 레지스트리
        'lib/ai-service.ts',
        'lib/ai-model-registry.ts',
        // UI 관련 헬퍼
        'lib/theme-system.ts',
        'lib/utils.ts',
        'lib/component-library.ts',
        'lib/file-exporter.ts',
        'lib/code-generator.ts',
      ],
      // 커버리지 임계값 설정 (점진적으로 개선)
      thresholds: {
        lines: 30,
        functions: 30,
        branches: 20,
        statements: 30
      }
    },

    // 테스트 실행 설정
    testTimeout: 10000,
    hookTimeout: 10000,

    // watch 모드 설정
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/.next/**']
  },

  // Path alias 설정 (Next.js와 동일하게)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/components': path.resolve(__dirname, './components'),
      '@/store': path.resolve(__dirname, './store'),
      '@/types': path.resolve(__dirname, './types'),
    }
  }
})
