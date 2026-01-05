import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@components';
import { ThemeToggle } from '@linear/ThemeToggle';
import { useAuth } from '@hooks/useAuth';
import styles from './Register.module.css';

/**
 * 이메일 형식 검증
 * @param {string} email - 이메일 주소
 * @returns {boolean} 유효성 여부
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 회원가입 페이지
 */
export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * 입력 필드 변경 핸들러
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 입력 시 해당 필드 에러 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  /**
   * 폼 유효성 검사
   * @returns {boolean} 유효성 여부
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError('');

    const { error } = await register(formData.email, formData.password);

    if (error) {
      setServerError(error);
      setIsSubmitting(false);
      return;
    }

    // 회원가입 성공
    setIsSuccess(true);
  };

  // 회원가입 성공 화면
  if (isSuccess) {
    return (
      <div className={styles.page}>
        {/* Background Effects */}
        <div className={styles.backgroundEffects}>
          <div className={styles.gridPattern} />
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
        </div>

        {/* Header */}
        <header className={styles.header}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>B</span>
            bsManager
          </Link>
          <ThemeToggle />
        </header>

        {/* Success Message */}
        <main className={styles.main}>
          <div className={styles.formCard}>
            <div className={styles.successContent}>
              <div className={styles.successIcon}>✓</div>
              <h1 className={styles.successTitle}>회원가입 완료!</h1>
              <p className={styles.successMessage}>
                이메일 인증 링크를 확인해주세요.<br />
                받은편지함을 확인하신 후 인증을 완료해주세요.
              </p>
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/login')}
                className={styles.successButton}
              >
                로그인 페이지로
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Background Effects */}
      <div className={styles.backgroundEffects}>
        <div className={styles.gridPattern} />
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
      </div>

      {/* Header */}
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>B</span>
          bsManager
        </Link>
        <ThemeToggle />
      </header>

      {/* Register Form */}
      <main className={styles.main}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>회원가입</h1>
            <p className={styles.subtitle}>새 계정을 만드세요</p>
          </div>

          {serverError && (
            <div className={styles.serverError} role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                이메일 <span className={styles.required}>*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                disabled={isSubmitting}
                autoComplete="email"
              />
              {errors.email && (
                <p className={styles.fieldError}>{errors.email}</p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                비밀번호 <span className={styles.required}>*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="최소 6자 이상"
                value={formData.password}
                onChange={handleChange}
                error={Boolean(errors.password)}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className={styles.fieldError}>{errors.password}</p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>
                비밀번호 확인 <span className={styles.required}>*</span>
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={Boolean(errors.confirmPassword)}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className={styles.fieldError}>{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className={styles.link}>
                로그인
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
