# V2 수정 계획

## 수정 우선순위
1. **문제 2 (브레이크포인트)** - 가장 근본적인 설계 문제
2. **문제 1 (겹침)** - UX 크리티컬 문제
3. **문제 3 (참조값)** - 세부 버그

## 문제 2: 브레이크포인트별 그리드 사이즈
- types/schema-v2.ts: Breakpoint에 gridCols, gridRows 추가
- lib/sample-data-v2.ts: 샘플 데이터 업데이트
- components/canvas-v2/KonvaCanvasV2.tsx: 동적 그리드 사이즈 적용
- lib/schema-utils-v2.ts: 헬퍼 함수 업데이트

## 문제 1: 컴포넌트 겹침
- KonvaCanvasV2.tsx: collision detection에서 fresh state 사용

## 문제 3: 리사이즈 참조값
- ComponentNodeV2.tsx: handleResize 반환값 직접 사용
