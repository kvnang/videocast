import debounce from 'just-debounce-it';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlinePencil } from 'react-icons/hi';

interface TitleFormFields {
  title?: string;
}

export default function TitleForm({
  title,
  setTitle,
}: {
  title?: string | null;
  setTitle: (v: string | null) => void;
}) {
  const [isEditing, _setIsEditing] = useState(false);

  const {
    register,
    trigger,
    setFocus,
    formState: { errors },
  } = useForm<TitleFormFields>();

  const setIsEditing = (v: boolean) => {
    _setIsEditing(v);
    setTimeout(() => {
      setFocus('title');
    }, 0);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center">
        <form
          action="/"
          className={`relative pb-6 w-[300px] ${
            !title || isEditing ? 'block' : 'hidden'
          }`}
        >
          <label htmlFor="title" className="block relative w-full">
            <input
              type="text"
              id="title"
              className="bg-transparent border-b-2 border-slate-500 pt-2 pb-1 pr-6 text-xl focus:outline-none focus:border-indigo-500 transition-colors w-full -mt-0.5"
              placeholder="Project Title"
              defaultValue={title || ''}
              aria-invalid={!!errors.title}
              {...register('title', {
                required: true,
                maxLength: {
                  value: 36,
                  message: 'Title must be ≤ 36 chars',
                },
                onChange: debounce(async () => {
                  await trigger('title');
                }, 500),
                onBlur: async (e) => {
                  const result = await trigger('title');
                  if (result) {
                    setTitle(e.target.value);
                    setIsEditing(false);
                  }
                },
              })}
            />
            <HiOutlinePencil className="absolute h-4 w-4 top-1/2 right-0 -translate-y-[50%] text-slate-500" />
          </label>
          <div className="text-center mt-2 text-sm text-red-500 font-semibold absolute bottom-0 left-0 w-full">
            <span>{errors.title?.message}</span>
          </div>
        </form>
        <div
          className={`-mb-1 pb-6 ${title && !isEditing ? 'block' : 'hidden'}`}
        >
          <button
            type="button"
            className="relative py-2 px-4 hover:bg-slate-800 hover:pr-8 rounded-md group transition-all"
            onClick={() => setIsEditing(true)}
          >
            <h1 className="text-xl font-bold">{title}</h1>
            <HiOutlinePencil className="absolute h-4 w-4 top-1/2 right-2 -translate-y-[50%] text-slate-500 opacity-0 group-hover:opacity-100 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
}
