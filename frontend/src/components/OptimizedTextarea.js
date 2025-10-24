import React from 'react';

const OptimizedTextarea = React.memo(({ 
  name,
  value,
  onChange,
  placeholder,
  className,
  rows,
  disabled,
  ...props 
}) => {
  return (
    <textarea
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      rows={rows}
      disabled={disabled}
      {...props}
    />
  );
});

OptimizedTextarea.displayName = 'OptimizedTextarea';

export default OptimizedTextarea;
