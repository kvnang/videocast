import { DetailedHTMLProps, InputHTMLAttributes } from 'react';
import { RegisterOptions, UseFormRegister } from 'react-hook-form';

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

export function RadioFields({
  register,
  options,
  label,
  showLabel = true,
  containerStyle,
  icon,
  fields,
  ...props
}: {
  register: UseFormRegister<any>;
  options?: RegisterOptions;
  label: string;
  showLabel?: boolean;
  containerStyle?: React.CSSProperties;
  icon?: React.ReactNode;
  name: string;
  fields: { label: string; value: string }[];
} & DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  return (
    <fieldset className="relative" style={containerStyle}>
      <legend className={`block mb-2 ${showLabel ? '' : 'sr-only'}`}>
        {label}
      </legend>
      <div className="relative flex flex-wrap gap-8">
        {fields.map((field) => (
          <div key={`${props.id}-${field.value}`}>
            <label
              className="flex items-center mb-4 cursor-pointer group"
              htmlFor={`${props.id}-${field.value}`}
            >
              <input
                className="w-4 h-4 rounded-full text-indigo-600 bg-gray-100 border-gray-300 bg-center bg-no-repeat bg-contain outline-none focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-2 focus:ring-indigo-500  checked:bg-indigo-500 group-hover:bg-indigo-300 group-hover:checked:bg-indigo-500 cursor-pointer transition-colors"
                {...props}
                id={`${props.id}-${field.value}`}
                type="radio"
                value={field.value}
                {...register(props.name, options)}
              />
              <span className="ml-2">{field.label}</span>
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
