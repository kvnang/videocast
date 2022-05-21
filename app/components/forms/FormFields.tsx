import { DetailedHTMLProps, InputHTMLAttributes } from 'react';
import { FieldValues, RegisterOptions, UseFormRegister } from 'react-hook-form';

export function InputField({
  register,
  options,
  label,
  showLabel = true,
  containerStyle,
  icon,
  ...props
}: {
  register: UseFormRegister<any>;
  options?: RegisterOptions;
  label: string;
  showLabel?: boolean;
  containerStyle?: React.CSSProperties;
  icon?: React.ReactNode;
  name: string;
} & DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  return (
    <label htmlFor={props.id} className="relative" style={containerStyle}>
      <span className={`block mb-2 ${showLabel ? '' : 'sr-only'}`}>
        {label}
      </span>
      <div className="relative">
        <input
          className={`bg-slate-800 border-2 border-slate-800 px-3 py-2 rounded-md w-full focus:outline-none focus:border-indigo-500 invalid:border-red-500 transition-colors ${
            icon ? 'pr-9' : ''
          }`}
          {...props}
          {...register(props.name, options)}
        />
        {icon && (
          <div className="absolute top-1/2 right-3 -translate-y-[50%] flex items-center w-4 h-4">
            {icon}
          </div>
        )}
      </div>
    </label>
  );
}
