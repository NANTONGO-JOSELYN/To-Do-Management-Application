import React from 'react';

const OptimizedInput = React.memo(({ 
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  className,
  disabled,
  ...props 
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      autoComplete="off"
      {...props}
    />
  );
});

OptimizedInput.displayName = 'OptimizedInput';

export default OptimizedInput;
