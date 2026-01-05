# bsManager 로그인/인증 기능 설계서

## 1. 개요

### 1.1 목적
bsManager 시스템에 사용자 인증 기능을 추가하여 권한이 있는 사용자만 시스템에 접근할 수 있도록 합니다.

### 1.2 요구사항 요약
| 항목 | 내용 |
|------|------|
| 인증 방식 | 이메일/비밀번호 (Supabase Auth) |
| 회원가입 | 포함 |
| UI 형태 | 별도 페이지 (/login, /register) |
| 로그아웃 후 이동 | 랜딩 페이지 (/) |

---

## 2. 시스템 아키텍처

### 2.1 인증 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 인증 흐름                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐    미인증     ┌─────────┐    인증성공    ┌─────────┐ │
│  │ Landing │ ──────────▶ │  Login  │ ──────────▶ │  Main   │ │
│  │   (/)   │              │ (/login)│              │  App    │ │
│  └─────────┘              └─────────┘              └─────────┘ │
│       │                        │                        │       │
│       │                        ▼                        │       │
│       │                  ┌─────────┐                    │       │
│       │                  │Register │                    │       │
│       │                  │(/regist)│                    │       │
│       │                  └─────────┘                    │       │
│       │                                                 │       │
│       │◀───────────────── 로그아웃 ─────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 컴포넌트 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                          App                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    ThemeProvider                          │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                   AuthProvider                      │  │  │
│  │  │                                                     │  │  │
│  │  │   ┌──────────┐  ┌──────────┐  ┌───────────────┐    │  │  │
│  │  │   │  Login   │  │ Register │  │ProtectedRoute │    │  │  │
│  │  │   │  Page    │  │   Page   │  │               │    │  │  │
│  │  │   └──────────┘  └──────────┘  │  ┌─────────┐  │    │  │  │
│  │  │                               │  │MainLayout│ │    │  │  │
│  │  │                               │  │  + Pages │ │    │  │  │
│  │  │                               │  └─────────┘  │    │  │  │
│  │  │                               └───────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 파일 구조

### 3.1 신규 생성 파일 (11개)

```
src/
├── contexts/
│   └── AuthContext.jsx          # 인증 상태 관리 Context
├── hooks/
│   └── useAuth.js               # 인증 접근 Custom Hook
├── services/
│   └── authService.js           # Supabase Auth API 래핑
├── components/
│   └── ProtectedRoute/
│       ├── index.js             # export 파일
│       └── ProtectedRoute.jsx   # 라우트 보호 컴포넌트
└── pages/
    ├── Login/
    │   ├── index.js             # export 파일
    │   ├── Login.jsx            # 로그인 페이지
    │   └── Login.module.css     # 로그인 스타일
    └── Register/
        ├── index.js             # export 파일
        ├── Register.jsx         # 회원가입 페이지
        └── Register.module.css  # 회원가입 스타일
```

### 3.2 수정 파일 (3개)

| 파일 | 변경 내용 |
|------|-----------|
| `src/main.jsx` | AuthProvider 래핑 추가 |
| `src/App.jsx` | 라우트 보호 적용, /login, /register 경로 추가 |
| `src/layouts/MainLayout/MainLayout.jsx` | 로그아웃 버튼, 사용자 이메일 표시 추가 |

---

## 4. 상세 설계

### 4.1 AuthContext (인증 상태 관리)

**파일**: `src/contexts/AuthContext.jsx`

#### 제공 값 (Context Value)

```javascript
{
  user: User | null,        // 현재 로그인된 사용자 객체
  loading: boolean,         // 인증 상태 로딩 중 여부
  error: string | null,     // 에러 메시지
  login: (email, password) => Promise<{data, error}>,
  register: (email, password, metadata?) => Promise<{data, error}>,
  logout: () => Promise<{error}>,
}
```

#### 핵심 로직

1. **초기 세션 로드**: `supabase.auth.getSession()`
2. **상태 변경 구독**: `supabase.auth.onAuthStateChange()`
3. **메모리 누수 방지**: cleanup 함수로 구독 해제

#### 의사 코드

```javascript
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // 3. 클린업
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => { /* ... */ };
  const register = async (email, password) => { /* ... */ };
  const logout = async () => { /* ... */ };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 4.2 authService (Supabase Auth API 래핑)

**파일**: `src/services/authService.js`

#### API 함수

| 함수 | 파라미터 | 반환값 | 설명 |
|------|----------|--------|------|
| `signIn` | email, password | `{data, error}` | 이메일/비밀번호 로그인 |
| `signUp` | email, password, metadata? | `{data, error}` | 회원가입 |
| `signOut` | - | `{error}` | 로그아웃 |
| `getSession` | - | `{data, error}` | 현재 세션 확인 |
| `getErrorMessage` | error | `string` | 에러 → 한글 변환 |

#### 에러 메시지 변환 테이블

| Supabase 에러 | 한글 메시지 |
|---------------|-------------|
| `Invalid login credentials` | 이메일 또는 비밀번호가 올바르지 않습니다. |
| `Email not confirmed` | 이메일 인증이 필요합니다. 받은편지함을 확인해주세요. |
| `User already registered` | 이미 등록된 이메일입니다. |
| `Password should be at least 6 characters` | 비밀번호는 최소 6자 이상이어야 합니다. |
| `Unable to validate email address: invalid format` | 올바른 이메일 형식이 아닙니다. |

### 4.3 ProtectedRoute (라우트 보호)

**파일**: `src/components/ProtectedRoute/ProtectedRoute.jsx`

#### 동작 흐름

```
┌─────────────┐
│ loading=true│────▶ "로딩 중..." 표시
└─────────────┘
       │
       ▼
┌─────────────┐
│  user=null  │────▶ Navigate to /login (원래 경로 state에 저장)
└─────────────┘
       │
       ▼
┌─────────────┐
│  user 존재  │────▶ children 렌더링
└─────────────┘
```

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 보호할 컴포넌트 |
| `redirectTo` | string | `/login` | 미인증 시 리다이렉트 경로 |

### 4.4 LoginPage (로그인 페이지)

**파일**: `src/pages/Login/Login.jsx`

#### UI 구성

```
┌────────────────────────────────────────┐
│  bsManager                 [테마토글]  │  ← 헤더
├────────────────────────────────────────┤
│                                        │
│         ┌──────────────────┐           │
│         │     로그인       │           │
│         │  계정에 로그인   │           │
│         ├──────────────────┤           │
│         │  [에러 메시지]   │           │
│         │                  │           │
│         │  이메일 *        │           │
│         │  ┌────────────┐  │           │
│         │  │            │  │           │
│         │  └────────────┘  │           │
│         │                  │           │
│         │  비밀번호 *      │           │
│         │  ┌────────────┐  │           │
│         │  │            │  │           │
│         │  └────────────┘  │           │
│         │                  │           │
│         │  ┌────────────┐  │           │
│         │  │   로그인   │  │           │
│         │  └────────────┘  │           │
│         │                  │           │
│         │  계정이 없으신   │           │
│         │  가요? 회원가입  │           │
│         └──────────────────┘           │
│                                        │
└────────────────────────────────────────┘
```

#### 유효성 검사 규칙

| 필드 | 규칙 | 에러 메시지 |
|------|------|-------------|
| 이메일 | 필수 | "이메일을 입력해주세요." |
| 이메일 | 형식 검사 | "올바른 이메일 형식이 아닙니다." |
| 비밀번호 | 필수 | "비밀번호를 입력해주세요." |

#### 로직 흐름

1. 폼 입력 → 실시간 유효성 검사
2. 제출 → 전체 유효성 검사
3. 유효 → `login(email, password)` 호출
4. 성공 → 원래 경로로 이동 (없으면 `/`)
5. 실패 → 에러 메시지 표시

### 4.5 RegisterPage (회원가입 페이지)

**파일**: `src/pages/Register/Register.jsx`

#### UI 구성

LoginPage와 유사하나 다음 필드 추가:
- 비밀번호 확인 필드

#### 유효성 검사 규칙

| 필드 | 규칙 | 에러 메시지 |
|------|------|-------------|
| 이메일 | 필수 | "이메일을 입력해주세요." |
| 이메일 | 형식 검사 | "올바른 이메일 형식이 아닙니다." |
| 비밀번호 | 필수 | "비밀번호를 입력해주세요." |
| 비밀번호 | 6자 이상 | "비밀번호는 최소 6자 이상이어야 합니다." |
| 비밀번호 확인 | 필수 | "비밀번호 확인을 입력해주세요." |
| 비밀번호 확인 | 일치 | "비밀번호가 일치하지 않습니다." |

#### 성공 시 UI

```
┌──────────────────────────────────────┐
│                                      │
│         회원가입 완료!               │
│                                      │
│   이메일 인증 링크를 확인해주세요.   │
│                                      │
│       [로그인 페이지로]              │
│                                      │
└──────────────────────────────────────┘
```

### 4.6 MainLayout 수정

**파일**: `src/layouts/MainLayout/MainLayout.jsx`

#### 변경 사항

```jsx
// 기존 navActions
<div className={styles.navActions}>
  <ThemeToggle />
</div>

// 변경 후
<div className={styles.navActions}>
  <span className={styles.userEmail}>{user.email}</span>
  <ThemeToggle />
  <Button variant="ghost" size="small" onClick={handleLogout}>
    로그아웃
  </Button>
</div>
```

### 4.7 라우팅 변경

**파일**: `src/App.jsx`

#### 변경 전

```jsx
<Routes>
  <Route path="/" element={<Landing />} />
  <Route element={<MainLayout />}>
    <Route path="/clients" element={<ClientsPage />} />
    {/* ... */}
  </Route>
</Routes>
```

#### 변경 후

```jsx
<Routes>
  {/* 공개 라우트 */}
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* 보호된 라우트 */}
  <Route element={
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  }>
    <Route path="/clients" element={<ClientsPage />} />
    <Route path="/clients/:id/history" element={<CompanyHistoryPage />} />
    <Route path="/consultation/new" element={<ConsultationNewPage />} />
    <Route path="/consultations" element={<ConsultationsPage />} />
    <Route path="/todos" element={<TodosPage />} />
  </Route>
</Routes>
```

---

## 5. 구현 순서

| 순서 | 파일 | 설명 |
|------|------|------|
| 1 | `src/services/authService.js` | Supabase Auth API 래핑 |
| 2 | `src/contexts/AuthContext.jsx` | 인증 상태 Context |
| 3 | `src/hooks/useAuth.js` | 인증 접근 Hook |
| 4 | `src/main.jsx` | AuthProvider 추가 |
| 5 | `src/components/ProtectedRoute/` | 라우트 보호 컴포넌트 |
| 6 | `src/pages/Login/` | 로그인 페이지 |
| 7 | `src/pages/Register/` | 회원가입 페이지 |
| 8 | `src/App.jsx` | 라우팅 변경 |
| 9 | `src/layouts/MainLayout/MainLayout.jsx` | 로그아웃 버튼 추가 |
| 10 | 테스트 | 전체 플로우 검증 |

---

## 6. 참조 파일

| 파일 | 참조 목적 |
|------|-----------|
| `src/contexts/ThemeContext.jsx` | Context 패턴 참조 |
| `src/hooks/useTheme.js` | Hook 패턴 참조 |
| `src/services/clientsService.js` | 서비스 레이어 패턴 참조 |
| `src/pages/Landing/Landing.jsx` | 페이지 스타일 참조 |
| `src/components/linear/Form/` | 폼 컴포넌트 사용법 |

---

## 7. 환경 설정

### 7.1 필수 환경변수

`.env.local` 또는 Vercel 대시보드에 설정:

```
VITE_SUPABASE_URL=<your_supabase_project_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

### 7.2 Supabase 설정 (권장)

Supabase 대시보드에서:
1. Authentication → Settings → Email Auth 활성화
2. Site URL 설정: 배포 URL 또는 `http://localhost:5173`
3. Redirect URLs 설정: `http://localhost:5173/**`

---

## 8. 테스트 시나리오

### 8.1 로그인 테스트

| 시나리오 | 예상 결과 |
|----------|-----------|
| 올바른 이메일/비밀번호 입력 | 로그인 성공, 원래 페이지로 이동 |
| 잘못된 비밀번호 | "이메일 또는 비밀번호가 올바르지 않습니다." |
| 존재하지 않는 이메일 | "이메일 또는 비밀번호가 올바르지 않습니다." |
| 빈 필드 제출 | 각 필드 에러 메시지 표시 |

### 8.2 회원가입 테스트

| 시나리오 | 예상 결과 |
|----------|-----------|
| 올바른 정보 입력 | 가입 성공, 이메일 인증 안내 |
| 이미 등록된 이메일 | "이미 등록된 이메일입니다." |
| 비밀번호 불일치 | "비밀번호가 일치하지 않습니다." |
| 6자 미만 비밀번호 | "비밀번호는 최소 6자 이상이어야 합니다." |

### 8.3 보호된 라우트 테스트

| 시나리오 | 예상 결과 |
|----------|-----------|
| 미인증 상태로 /clients 접근 | /login으로 리다이렉트 |
| 로그인 후 원래 경로로 복귀 | /clients로 이동 |
| 로그아웃 후 보호된 페이지 접근 | /login으로 리다이렉트 |

---

## 9. 향후 확장 고려사항

- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 비밀번호 재설정 기능
- [ ] 이메일 인증 재발송
- [ ] 사용자 프로필 관리
- [ ] 로그인 유지 (Remember me)
- [ ] 세션 타임아웃 처리

---

*문서 작성일: 2025-01-05*
*버전: 1.0*
