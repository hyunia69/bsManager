import { forwardRef } from 'react';
import styles from './DatePicker.module.css';

/**
 * DatePicker 컴포넌트
 * 날짜 입력을 위한 input type="date" 래퍼
 */
export const DatePicker = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = '',
      className = '',
      disabled = false,
      min,
      max,
      ...props
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.datePicker} ${className}`}
        disabled={disabled}
        min={min}
        max={max}
        {...props}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';

/**
 * DateRangePicker 컴포넌트
 * 시작일~종료일 범위 선택
 */
export const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startPlaceholder = '시작일',
  endPlaceholder = '종료일',
  className = '',
  disabled = false,
}) => {
  return (
    <div className={`${styles.dateRange} ${className}`}>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        placeholder={startPlaceholder}
        disabled={disabled}
        max={endDate || undefined}
      />
      <span className={styles.separator}>~</span>
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        placeholder={endPlaceholder}
        disabled={disabled}
        min={startDate || undefined}
      />
    </div>
  );
};
