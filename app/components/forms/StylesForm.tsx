import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CF_WORKER_URL, defaultFonts, defaultStyles } from '../../lib/config';
import { FontProps, StylesProps } from '../../types';
import { InputField, RadioFields } from './FormFields';

interface Props {
  styles: StylesProps;
  setStyles: (v: StylesProps) => void;
  loadedStyles?: StylesProps;
}

export default function StylesForm({ styles, setStyles, loadedStyles }: Props) {
  const [fonts, setFonts] = React.useState<FontProps[]>([]);

  async function getFonts() {
    try {
      const allFonts = await fetch(`${CF_WORKER_URL}/fonts/`).then((r) =>
        r.json()
      );
      setFonts(allFonts);
    } catch (err) {
      console.error(err);
      setFonts(defaultFonts);
    }
  }

  const {
    register,
    watch,
    trigger,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    defaultValues: { ...defaultStyles },
  });

  useEffect(() => {
    if (!fonts?.length) {
      getFonts();
    }
  }, []);

  useEffect(() => {
    const subscription = watch(async (value, { name, type }) => {
      if (typeof name === 'undefined') {
        return;
      }

      if (name === 'textColor') {
        trigger(name);
      }

      setStyles({
        ...styles,
        [name]: value[name],
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, styles, setStyles]);

  useEffect(() => {
    const currentValues = getValues();
    Object.keys(currentValues).forEach((key) => {
      const loadedStylesValue = loadedStyles?.[key];
      if (
        typeof loadedStylesValue !== 'undefined' &&
        loadedStylesValue &&
        loadedStylesValue !== currentValues[key as keyof typeof currentValues]
      ) {
        setValue(key as keyof typeof currentValues, loadedStylesValue);
      }
    });
  }, [loadedStyles]);

  if (!fonts?.length) {
    return null;
  }

  return (
    <ul className="flex flex-wrap -m-2">
      <li className="p-2 shrink-0 grow-0 basis-1/2 max-w-[50%]">
        <InputField
          register={register}
          name="textColor"
          label="Text Color"
          type="text"
          id="textColor"
          placeholder="#000000"
          options={{
            validate: {
              validHex: (value) => /^#([0-9A-F]{3}){1,2}$/i.test(`${value}`),
            },
          }}
          aria-invalid={!!errors?.textColor}
          icon={
            <div
              className="h-full w-full rounded-sm transition-colors"
              style={{
                backgroundColor: getValues('textColor') || 'transparent',
              }}
            />
          }
        />
      </li>
      <li className="p-2 shrink-0 grow-0 basis-1/2 max-w-[50%]">
        <InputField
          register={register}
          name="accentColor"
          label="Accent Color"
          type="text"
          id="accentColor"
          placeholder="#000000"
          options={{
            validate: {
              validHex: (value) => /^#([0-9A-F]{3}){1,2}$/i.test(`${value}`),
            },
          }}
          aria-invalid={!!errors?.accentColor}
          icon={
            <div
              className="h-full w-full rounded-sm transition-colors"
              style={{
                backgroundColor: getValues('accentColor') || 'transparent',
              }}
            />
          }
        />
      </li>
      <li className="p-2 basis-full">
        <label htmlFor="font-family">
          <span className="block mb-2">Font Family</span>
          <div className="select-wrapper">
            <select
              id="font-family"
              aria-invalid={!!errors?.fontFamily}
              className="bg-slate-800 border-2 border-slate-800 px-3 py-2 rounded-md w-full focus:outline-none focus:border-indigo-500 transition-colors"
              {...register('fontFamily', { required: true })}
            >
              {fonts.map((font) => (
                <option key={font.family} value={font.family}>
                  {font.family}
                </option>
              ))}
            </select>
          </div>
        </label>
      </li>
      <li className="p-2 shrink-0 grow-0 basis-1/2 max-w-[50%]">
        <InputField
          register={register}
          label="Font Size (in px)"
          type="number"
          id="font-size"
          aria-invalid={!!errors?.fontSize}
          placeholder="60"
          name="fontSize"
          options={{ required: true }}
        />
      </li>
      <li className="p-2 shrink-0 grow-0 basis-1/2 max-w-[50%]">
        <InputField
          register={register}
          label="Line Height"
          type="number"
          id="line-height"
          aria-invalid={!!errors?.lineHeight}
          placeholder="1.25"
          step="0.05"
          name="lineHeight"
          options={{ required: true }}
        />
      </li>
      <li className="p-2 basis-full">
        <InputField
          register={register}
          label="Title"
          type="text"
          id="title"
          placeholder="e.g. Talk about Web"
          name="title"
        />
      </li>
      <li className="p-2 basis-full">
        <InputField
          register={register}
          label="Subtitle"
          type="text"
          id="subtitle"
          placeholder="e.g. Podcast #23"
          name="subtitle"
        />
      </li>
      <li className="p-2 shrink-0 grow-0 basis-1/2 max-w-[50%]">
        <RadioFields
          register={register}
          label="Audio Visualization"
          id="audioVisualization"
          name="audioVisualization"
          fields={[
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'Mirrored',
              value: 'mirrored',
            },
          ]}
        />
      </li>
    </ul>
  );
}
