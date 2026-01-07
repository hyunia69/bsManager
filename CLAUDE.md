# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 기타 지켜야 할 룰
- 코드를 제외한 설계,스펙 문서는 claudedocs 밑에 생성한다.
- 생성된 md 파일은 루트의 CLAUDE.md 에 어떤 파일인지 아주 간략히 기재하고 나중에 참조할 필요가 있을 때 참조하도록 한다.

## 설계 문서 참조

| 파일 | 설명 |
|------|------|
| `claudedocs/bsManager요구사항.md` | 기능 요구사항 정의 |
| `claudedocs/bsManager_Function_PLAN.md` | 페이지별 기능 설계 및 구현 체크리스트 |
| `claudedocs/bsManager_Auth_DESIGN.md` | 로그인/인증 기능 설계서 |  

## Project Overview

**bsManager**는 거래처 정보와 상담 정보를 관리하는 비즈니스 관계 관리(BRM) 시스템입니다.

### 핵심 기능 (향후 구현 예정)
- **거래처 관리**: 회사명, 담당자, 연락처, 이메일 정보 저장/검색/수정
- **상담 관리**: 문의, 클레임, 요청, 수리 분류별 상담 기록
- **진행상태**: 미진행 → 진행 → 완료 상태 관리
- **회사통합내역**: 거래처별 상담 이력 통합 조회

## Commands

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## Architecture

### Tech Stack
| 분류 | 기술 |
|------|------|
| 프론트엔드 | React 18 + Vite |
| 스타일링 | CSS Modules + Linear Design Tokens |
| 백엔드 | Supabase (향후 연동 예정) |
| 상태관리 | React Context + Hooks |
| 라우팅 | React Router DOM v6 |

### Directory Structure

```
src/
├── components/           # Linear 디자인 시스템 컴포넌트
│   ├── index.js          # 중앙 export 파일
│   └── linear/           # 개별 컴포넌트들
│       ├── Badge/        # 상태 배지 (미진행/진행/완료)
│       ├── Button/
│       ├── Card/
│       ├── Form/
│       ├── Input/
│       ├── Modal/
│       ├── Navigation/
│       ├── Select/       # 드롭다운 선택
│       ├── Table/        # 데이터 테이블
│       ├── Textarea/     # 장문 입력
│       └── ThemeToggle/
├── contexts/             # React Context (ThemeContext)
├── hooks/                # Custom hooks (useTheme)
├── layouts/              # 레이아웃 컴포넌트
│   └── MainLayout/       # 메인 레이아웃 (헤더 + 네비게이션)
├── pages/                # 페이지 컴포넌트
│   ├── Landing/          # 홈 페이지
│   ├── Clients/          # 거래처 관리
│   ├── ConsultationNew/  # 상담 기록
│   ├── Consultations/    # 상담 목록
│   └── CompanyHistory/   # 회사통합내역
├── services/             # 백엔드 서비스 레이어
│   ├── supabase.js       # Supabase 클라이언트
│   ├── clientsService.js # 거래처 CRUD
│   └── consultationsService.js # 상담 CRUD
└── styles/
    ├── base/             # reset, global, typography CSS
    ├── tokens/           # Linear 디자인 토큰
    │   └── linear.css    # CSS Variables (dark/light mode)
    └── index.css         # 스타일 진입점
```

### Import Aliases (vite.config.js)

```javascript
'@'           → './src'
'@styles'     → './src/styles'
'@components' → './src/components'
'@linear'     → './src/components/linear'
'@contexts'   → './src/contexts'
'@pages'      → './src/pages'
'@hooks'      → './src/hooks'
'@layouts'    → './src/layouts'
'@services'   → './src/services'
```

### Routes (React Router)

```javascript
/                           → Landing (홈)
/clients                    → ClientsPage (거래처 관리)
/clients/:id/history        → CompanyHistoryPage (회사통합내역)
/consultation/new           → ConsultationNewPage (상담기록)
/consultations              → ConsultationsPage (상담목록)
```

## Linear Design System

### Component Usage

```jsx
// 중앙 export에서 임포트
import { Button, Card, CardHeader, CardContent, Modal, Input, Form } from '@components';
import { ThemeToggle } from '@linear/ThemeToggle';
```

### Available Components
- **Button**: `variant` (primary, secondary, ghost), `size` (small, medium, large)
- **Card**: CardHeader, CardContent, CardFooter
- **Modal**: ModalHeader, ModalContent, ModalFooter
- **Input**: 텍스트 입력 필드
- **Form**: FormField, FormLabel, FormError, useFormValidation hook
- **Navigation**: NavItem
- **ThemeToggle**: 다크/라이트 모드 전환
- **Select**: 드롭다운 선택 (options, value, onChange)
- **Table**: TableHeader, TableBody, TableRow, TableCell
- **Badge/StatusBadge**: 상태 배지 (pending, progress, completed)
- **Textarea**: 장문 텍스트 입력

### CSS Variables

디자인 토큰은 `src/styles/tokens/linear.css`에 정의되어 있으며 `[data-theme]` 속성으로 테마 전환:

```css
/* 색상 */
--color-bg-primary, --color-bg-secondary, --color-bg-tertiary
--color-text-primary, --color-text-secondary, --color-text-tertiary
--color-accent, --color-brand-bg
--color-border-primary, --color-line-primary

/* 타이포그래피 */
--title-1-size ~ --title-9-size
--text-tiny-size ~ --text-large-size
--font-weight-light ~ --font-weight-bold

/* 레이아웃 */
--page-max-width, --page-padding-inline, --page-padding-block
--radius-4 ~ --radius-rounded
--shadow-low, --shadow-medium, --shadow-high

/* 애니메이션 */
--speed-quick-transition, --speed-regular-transition
--ease-out-quad, --ease-out-cubic
```

### Theme System

```jsx
// main.jsx에서 ThemeProvider로 앱 래핑
import { ThemeProvider } from '@contexts/ThemeContext';

// 컴포넌트에서 useTheme 사용
import { useTheme } from '@hooks/useTheme';
const { theme, toggleTheme } = useTheme();
```

테마 우선순위: localStorage → system preference → 기본값 (dark)

## CSS Modules Convention

- 파일명: `ComponentName.module.css`
- 클래스 참조: `styles.className` (camelCase로 자동 변환)
- 전역 CSS 변수 적극 활용

## Supabase Integration

### 서비스 레이어 구조 (구현 완료, 연동 대기)

```
src/services/
├── supabase.js               # 클라이언트 초기화
├── clientsService.js         # 거래처 CRUD
└── consultationsService.js   # 상담 CRUD
```

### 연동 활성화 절차
1. `npm install @supabase/supabase-js` 실행
2. `.env.local` 파일에 환경변수 설정
3. `src/services/supabase.js`의 주석 해제

### 환경변수
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Implementation Progress

### Phase 1: 기반 구조 ✅
- [x] React Router 라우팅 설정
- [x] MainLayout 컴포넌트
- [x] 추가 컴포넌트 (Select, Table, Badge, Textarea)
- [x] 페이지 스켈레톤 4개 (Clients, ConsultationNew, Consultations, CompanyHistory)
- [x] Supabase 서비스 레이어 구조

### Phase 2~5: 구현 예정
- [ ] 거래처 관리 기능 (CRUD)
- [ ] 상담내역기록 기능
- [ ] 상담내역리스트 기능
- [ ] 회사통합내역 기능

## Deployment

### 배포 플랫폼
| 항목 | 값 |
|------|-----|
| 플랫폼 | Vercel |
| GitHub 레포 | https://github.com/hyunia69/bsManager.git |
| 배포 URL | (Vercel 연결 후 생성) |
| 배포 방식 | GitHub 연동 자동 배포 |

### 빌드 설정
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

### 환경변수 (Vercel 대시보드에서 설정)
```
VITE_SUPABASE_URL=<supabase_project_url>
VITE_SUPABASE_ANON_KEY=<supabase_anon_key>
```

### 배포 흐름
```
git push origin main → Vercel 자동 감지 → 빌드 → 배포
```

### 유용한 기능
- **자동 배포**: main 브랜치 push 시 자동 배포
- **Preview 배포**: PR 생성 시 별도 Preview URL 생성
- **롤백**: Vercel 대시보드에서 이전 버전으로 롤백 가능

### 참조 사이트 아이디 
- 아래 내용을 참조해서 claude agent 가 직접 작업을 하도록 한다.
- claudedocs/bsManager_ID.md