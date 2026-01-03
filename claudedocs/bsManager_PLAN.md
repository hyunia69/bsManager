# bsManager 앱 설계 문서

## 1. 프로젝트 개요

### 1.1 앱 설명
**bsManager**는 거래처 정보와 상담 정보를 관리하는 비즈니스 관계 관리(BRM) 시스템입니다.

### 1.2 핵심 기능 (향후 구현 예정)
- **거래처 관리**: 거래처 정보 저장, 검색, 수정, 삭제
- **상담 관리**: 상담 기록 저장, 검색, 수정, 삭제
- **검색 & 필터**: 다양한 조건으로 데이터 검색

### 1.3 현재 작업 범위
✅ **Phase 1**: 랜딩 페이지 구현

---

## 2. 기술 스택

| 분류 | 기술 | 비고 |
|------|------|------|
| **프론트엔드** | React 18 + Vite | 기존 설정 활용 |
| **스타일링** | CSS Modules + Linear 토큰 | 디자인 시스템 재사용 |
| **라우팅** | React Router DOM | SPA 라우팅 |
| **백엔드** | Supabase | 향후 연동 예정 |
| **상태관리** | React Context + Hooks | 필요 시 확장 |

---

## 3. 프로젝트 구조

### 3.1 디렉토리 구조

```
designtemplete/
├── bsManager.html                    # [신규] 앱 entry point
├── src/
│   └── apps/
│       └── bsManager/
│           ├── main.jsx              # React 진입점
│           ├── App.jsx               # 앱 루트 컴포넌트
│           ├── index.css             # 앱 전용 스타일
│           ├── pages/
│           │   ├── Landing/          # 랜딩 페이지
│           │   │   ├── Landing.jsx
│           │   │   ├── Landing.module.css
│           │   │   └── index.js
│           │   ├── Dashboard/        # [향후] 대시보드
│           │   ├── Clients/          # [향후] 거래처 관리
│           │   └── Consultations/    # [향후] 상담 관리
│           ├── components/           # 앱 전용 컴포넌트
│           ├── hooks/                # 앱 전용 훅
│           ├── services/             # Supabase API 레이어
│           └── utils/                # 유틸리티 함수
└── vite.config.js                    # [수정] bsManager entry 추가
```

### 3.2 컴포넌트 임포트 전략

```javascript
// Linear 디자인 시스템 컴포넌트 사용
import { Button, Card, CardHeader, CardContent } from '@components';
import { useTheme } from '@shared/hooks/useTheme';
```

---

## 4. 설정 파일 변경 사항

### 4.1 vite.config.js

```javascript
// 기존 rollupOptions.input에 추가
build: {
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
      'file-manager': resolve(__dirname, 'file-manager.html'),
      'bsManager': resolve(__dirname, 'bsManager.html')  // 추가
    }
  }
}

// alias에 추가
resolve: {
  alias: {
    // 기존 별칭 유지...
    '@bsManager': './src/apps/bsManager'  // 추가
  }
}
```

### 4.2 package.json 스크립트

```json
{
  "scripts": {
    "dev:bsManager": "vite --open /bsManager.html"
  }
}
```

### 4.3 bsManager.html

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>bsManager - 거래처 & 상담 관리</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/apps/bsManager/main.jsx"></script>
</body>
</html>
```

---

## 5. 랜딩 페이지 설계

### 5.1 페이지 구성

| 섹션 | 설명 | 사용 컴포넌트 |
|------|------|---------------|
| **Hero** | 앱 소개 및 주요 CTA | Button |
| **Features** | 주요 기능 소개 (3개 카드) | Card, CardHeader, CardContent |
| **CTA** | 시작하기 유도 | Button |
| **Footer** | 저작권, 링크 | 자체 구현 |

### 5.2 Hero 섹션

```jsx
<section className={styles.hero}>
  <h1>거래처 & 상담 관리 시스템</h1>
  <p>효율적인 비즈니스 관계 관리를 위한 통합 솔루션</p>
  <Button variant="primary" size="large">
    시작하기
  </Button>
</section>
```

### 5.3 Features 섹션

```jsx
<section className={styles.features}>
  <h2>주요 기능</h2>
  <div className={styles.featureGrid}>
    <Card>
      <CardHeader>거래처 관리</CardHeader>
      <CardContent>
        거래처 정보를 체계적으로 저장하고 관리하세요.
      </CardContent>
    </Card>
    <Card>
      <CardHeader>상담 기록</CardHeader>
      <CardContent>
        모든 상담 내용을 기록하고 추적하세요.
      </CardContent>
    </Card>
    <Card>
      <CardHeader>검색 & 필터</CardHeader>
      <CardContent>
        강력한 검색 기능으로 원하는 정보를 빠르게 찾으세요.
      </CardContent>
    </Card>
  </div>
</section>
```

### 5.4 CTA 섹션

```jsx
<section className={styles.cta}>
  <h2>지금 바로 시작하세요</h2>
  <p>무료로 시작하고 비즈니스를 성장시키세요.</p>
  <div className={styles.ctaButtons}>
    <Button variant="primary">무료 시작</Button>
    <Button variant="secondary">더 알아보기</Button>
  </div>
</section>
```

### 5.5 Footer

```jsx
<footer className={styles.footer}>
  <p>© 2025 bsManager. All rights reserved.</p>
  <nav>
    <a href="#">개인정보처리방침</a>
    <a href="#">이용약관</a>
    <a href="#">문의하기</a>
  </nav>
</footer>
```

---

## 6. 스타일 가이드

### 6.1 CSS Modules + Linear 토큰 활용

```css
/* Landing.module.css */
.landing {
  min-height: 100vh;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  padding: var(--page-paddingBlock) var(--page-paddingInline);
}

.hero h1 {
  font-size: var(--title-5-size);
  font-weight: var(--font-weight-semibold);
  margin-bottom: 16px;
}

.hero p {
  font-size: var(--text-large-size);
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.features {
  max-width: var(--page-maxWidth);
  margin: 0 auto;
  padding: var(--page-paddingBlock) var(--page-paddingInline);
}

.features h2 {
  font-size: var(--title-4-size);
  text-align: center;
  margin-bottom: 48px;
}

.featureGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.cta {
  background: var(--color-bg-secondary);
  padding: calc(var(--page-paddingBlock) * 2) var(--page-paddingInline);
  text-align: center;
}

.cta h2 {
  font-size: var(--title-4-size);
  margin-bottom: 16px;
}

.cta p {
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.ctaButtons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.footer {
  padding: 32px var(--page-paddingInline);
  border-top: 1px solid var(--color-border-primary);
  text-align: center;
}

.footer nav {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 16px;
}

.footer a {
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: color var(--speed-quickTransition) var(--ease-out-quad);
}

.footer a:hover {
  color: var(--color-text-primary);
}
```

### 6.2 반응형 디자인

```css
/* 모바일 대응 */
@media (max-width: 768px) {
  .hero h1 {
    font-size: var(--title-3-size);
  }

  .ctaButtons {
    flex-direction: column;
    align-items: center;
  }

  .footer nav {
    flex-direction: column;
    gap: 12px;
  }
}
```

---

## 7. 파일 생성 목록

### Phase 1: 랜딩 페이지 (현재)

| 파일 경로 | 설명 |
|-----------|------|
| `bsManager.html` | HTML entry point |
| `src/apps/bsManager/main.jsx` | React 진입점 |
| `src/apps/bsManager/App.jsx` | 앱 루트 컴포넌트 |
| `src/apps/bsManager/index.css` | 앱 전용 스타일 |
| `src/apps/bsManager/pages/Landing/Landing.jsx` | 랜딩 페이지 |
| `src/apps/bsManager/pages/Landing/Landing.module.css` | 랜딩 페이지 스타일 |
| `src/apps/bsManager/pages/Landing/index.js` | 내보내기 |

### 수정 파일

| 파일 경로 | 변경 내용 |
|-----------|-----------|
| `vite.config.js` | bsManager entry 및 alias 추가 |
| `package.json` | dev:bsManager 스크립트 추가 |

---

## 8. 독립 배포 전략

### 8.1 현재 개발 환경
- designtemplete 프로젝트 내에서 개발
- Linear 컴포넌트 및 토큰 공유

### 8.2 독립 배포 시 필요 작업
1. **bsManager 폴더 추출**: `src/apps/bsManager/` 복사
2. **Linear 컴포넌트 복사**: 사용하는 컴포넌트만 선별 복사
3. **토큰 파일 복사**: `src/styles/tokens/linear.css`
4. **별도 vite.config.js 생성**: 독립 빌드 설정
5. **Supabase 환경 변수 설정**: `.env` 파일 구성

### 8.3 Supabase 연동 (향후)

```
src/apps/bsManager/
├── services/
│   ├── supabase.js           # Supabase 클라이언트 초기화
│   ├── clientsService.js     # 거래처 CRUD
│   └── consultationsService.js # 상담 CRUD
```

```javascript
// supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## 9. 구현 체크리스트

### Phase 1: 랜딩 페이지 ✅

- [ ] `bsManager.html` 생성
- [ ] `vite.config.js` 수정 (entry, alias)
- [ ] `package.json` 스크립트 추가
- [ ] `src/apps/bsManager/main.jsx` 생성
- [ ] `src/apps/bsManager/App.jsx` 생성
- [ ] `src/apps/bsManager/index.css` 생성
- [ ] `src/apps/bsManager/pages/Landing/` 구현
- [ ] 개발 서버 테스트

### Phase 2: 거래처 관리 (향후)

- [ ] Supabase 연동
- [ ] 거래처 목록 페이지
- [ ] 거래처 상세/수정 페이지
- [ ] 거래처 등록 폼

### Phase 3: 상담 관리 (향후)

- [ ] 상담 목록 페이지
- [ ] 상담 상세/수정 페이지
- [ ] 상담 등록 폼
- [ ] 거래처-상담 연결

---

## 10. 참고 자료

- **Linear 컴포넌트**: `src/components/linear/`
- **디자인 토큰**: `src/styles/tokens/linear.json`
- **테마 컨텍스트**: `src/shared/contexts/ThemeContext.jsx`
- **기존 앱 예시**: `src/apps/file-manager/`
