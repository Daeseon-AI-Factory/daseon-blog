# Architecture Design: Interactive Learning Playground

## 1. Context & Constraints
- **Context**: 블로그 소유자는 단순한 텍스트 기반의 정보 전달을 넘어, 시스템 설계(System Design), 디자인 패턴, 핵심 알고리즘을 직접 코드로 짜보고 시각적으로 이해할 수 있는 **"완전한 개인 커스텀 학습소(Learning Playground)"**를 블로그 내부에 구축하고자 함.
- **Constraints**:
  - 외부 서비스(CodeSandbox, StackBlitz)의 Iframe 임베드를 지양하고 데이터 소유권 및 UI 커스텀 제어권을 100% 확보할 것.
  - 블로그의 기존 톤앤매너("담담한", 미니멀리즘)를 훼손하지 않을 것.
  - 지나치게 무거운 클라이언트 렌더링으로 인해 블로그 전반의 성능이 저하되지 않도록, Playground 기능은 해당 포스트/위키에서만 Lazy Loading 될 것.

## 2. Goals (Ranked)
1. **Educational Efficacy (교육적 효과)**: 코드를 변경하면 실시간으로 상태나 시각적 요소(다이어그램, 애니메이션)가 반응해야 함.
2. **Total Ownership (완전한 소유권)**: 외부 의존성 없이 Next.js 앱 내에서 에디터와 렌더러가 독립적으로 동작해야 함.
3. **Aesthetic Consistency (디자인 일관성)**: 블로그 테마와 완벽하게 어우러지는 커스텀 UI.

## 3. Options Considered

### Option A: Sandpack (CodeSandbox Engine) + Custom React UI
- **Description**: 브라우저 내장 번들러 엔진인 Sandpack을 사용하되, 에디터 UI 껍데기를 블로그 디자인에 맞게 자체 구현.
- **Cost**: 클라이언트 번들 사이즈 증가 (JS 페이로드 부담).
- **Reversibility**: 보통 (컴포넌트로 분리 시 제거는 쉽지만, 작성된 콘텐츠 수정 필요).
- **Evidence**: React 공식 문서 튜토리얼에서 사용하는 검증된 방식.

### Option B: Interactive MDX Components (Purpose-built Visualizers)
- **Description**: 범용 텍스트 에디터를 띄우는 대신, 특정 디자인 패턴(예: Load Balancer, Circuit Breaker) 전용 React 컴포넌트를 만들어 MDX에 삽입. (입력 폼 + 시각화 캔버스)
- **Cost**: 각 패턴마다 컴포넌트를 새로 개발해야 하는 높은 개발 공수.
- **Reversibility**: 쉬움.
- **Evidence**: Josh W. Comeau 등 최고 수준의 교육 블로그에서 사용하는 방식.

### Option C: Monaco Editor + Server-side Execution
- **Description**: VScode의 코어인 Monaco Editor를 띄우고, 코드를 Next.js API Route(서버)로 전송하여 결과를 받아오는 방식.
- **Cost**: 서버 비용 발생 및 보안(RCE 방지) 처리의 복잡성.
- **Reversibility**: 어려움.

## 4. Proposed Architecture (Hybrid Approach)

**결정된 방향: Option B(Purpose-built Visualizers)를 메인으로 하고, 프론트엔드 코드 학습 시 Option A(Sandpack)를 보조로 사용.**

### 4.1. Core Components
1. **`<InteractiveEditor />`**: 사용자의 입력을 받는 텍스트 영역 또는 컨트롤 패널. (Monaco 라이트 버전 혹은 단순 Textarea + 하이라이터)
2. **`Engine (Evaluator)`**: 
   - UI 로직의 경우: `sandpack-react` 코어 훅(`useSandpack`)을 통해 코드 평가.
   - 알고리즘/수식 로직의 경우: `new Function()` 혹은 Web Worker를 통한 안전한 런타임 평가 후 State 반환.
3. **`<Visualizer />`**: Engine에서 반환된 State를 넘겨받아 Framer Motion이나 SVG로 실시간 다이어그램/애니메이션을 그리는 컴포넌트.

### 4.2. Directory Structure
```text
/components
  /playground
    /Editor.tsx        # 커스텀 테마가 적용된 코드 입력창
    /Visualizer.tsx    # 상태값을 받아 렌더링하는 시각화 영역
    /patterns          # 개별 패턴 시뮬레이터 (CircuitBreaker.tsx 등)
```

## 5. Implementation Plan

- **Phase 1: Proof of Concept (PoC)**
  - 가장 간단한 알고리즘(예: Retry Logic)을 대상으로, 코드를 수정하면 우측의 SVG 공(요청)이 실패/성공하는 애니메이션을 보여주는 단일 컴포넌트 제작.
- **Phase 2: Sandpack Integration**
  - `sandpack-react` 코어만 설치하여 블로그 디자인 톤에 맞는 `<CodePlayground />` 컴포넌트 래퍼 구현.
- **Phase 3: MDX 적용**
  - 기존 `content/knowledge/en/` 위키 문서 중 하나에 컴포넌트를 삽입하고 퍼블리싱.

## 6. Pre-mortem (예상되는 실패 시나리오 및 대비책)
- **번들 사이즈 초과로 인한 로딩 지연**: 모든 컴포넌트에 `next/dynamic`을 사용한 Lazy Loading을 강제하여, 일반 블로그 텍스트 독자의 경험을 해치지 않게 방어.
- **무한 루프 코드로 인한 브라우저 프리징**: 사용자 코드 평가(Evaluation) 시 Web Worker를 분리하거나 실행 시간 제한(Timeout)을 두어 메인 스레드 보호.

---
**Status**: Proposed
**Author**: Antigravity (AI Assistant)
