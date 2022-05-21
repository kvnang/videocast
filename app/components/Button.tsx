import Link from 'next/link';
import React from 'react';
import Spinner from './Spinner';

interface Props {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonStyle?: 'secondary';
  isLink?: boolean;
  href?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function Button({
  loading,
  loadingText,
  icon,
  buttonStyle,
  className = '',
  href,
  children,
  ...props
}: Props) {
  const isLink = !!href;

  const defaultClassName =
    buttonStyle === 'secondary'
      ? 'inline-block relative text-slate-100 font-bold bg-transparent backdrop-blur border-2 border-slate-500 hover:bg-indigo-800 focus:outline-none focus:border-indigo-500 hover:border-indigo-800 font-medium rounded-full text-sm px-5 py-2.5 transition-colors cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-800 disabled:cursor-not-allowed'
      : 'inline-block relative text-white font-bold bg-indigo-700 border-2 border-indigo-800 hover:bg-indigo-800 focus:outline-none focus:border-indigo-500 hover:border-indigo-800 font-medium rounded-full text-sm px-5 py-2.5 transition-colors cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-800 disabled:cursor-not-allowed';

  if (isLink) {
    return (
      <Link href={href}>
        <a className={`${defaultClassName} ${className}`} {...props}>
          {(loading && (
            <span className="flex items-center gap-2 font-semibold text-base relative pl-6 ">
              <Spinner className="absolute left-0 top-1/2 -translate-y-[50%] h-4 w-4" />
              {loadingText || children}
            </span>
          )) || (
            <span className="flex items-center gap-2 font-semibold text-base">
              {icon && <span>{icon}</span>}
              {children}
            </span>
          )}
        </a>
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={`${defaultClassName} ${className}`}
      {...props}
    >
      {(loading && (
        <span className="flex items-center gap-2 font-semibold text-base relative pl-6 ">
          <Spinner className="absolute left-0 top-1/2 -translate-y-[50%] h-4 w-4" />
          {loadingText || children}
        </span>
      )) || (
        <span className="flex items-center gap-2 font-semibold text-base">
          {icon && <span>{icon}</span>}
          {children}
        </span>
      )}
    </button>
  );
}
