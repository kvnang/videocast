import * as React from 'react';
import { useForm } from 'react-hook-form';
import { WordProps } from '../../types';

function validateJSON(value: any) {
  const firstWord = value?.[0]?.[0];
  if (!firstWord) {
    console.error('JSON is invalid');
    return false;
  }

  const hasWord = typeof firstWord.word === 'string';

  if (!hasWord) {
    console.error('JSON seems malformatted');
    return false;
  }

  return true;
}

export default function UploadJSONForm({
  words,
  setWords,
}: {
  words: WordProps;
  setWords: (v: WordProps | null) => void;
}) {
  const {
    register,
    watch,
    formState: { errors },
    setValue,
  } = useForm();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [fileName, setFileName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const subscription = watch(async (value, { name, type }) => {
      if (value?.json?.length && value.json[0] instanceof File) {
        setLoading(true);

        const reader = new FileReader();

        reader.onload = function (event) {
          const jsonObj =
            event.target?.result && typeof event.target.result === 'string'
              ? JSON.parse(event.target.result)
              : {};

          setFileName(value.json[0].name);
          setWords(jsonObj);
        };

        reader.readAsText(value.json[0]);

        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setWords]);

  return (
    <div className="inline-block">
      {!fileName && (
        <span className="text-slate-300">Have the transcription JSON? </span>
      )}
      <label
        htmlFor="upload-json"
        className="cursor-pointer font-bold transition-all hover:text-shadow"
      >
        <input
          className="sr-only"
          type="file"
          id="upload-json"
          accept="application/json"
          {...register('json', {
            validate: {
              lessThan2MB: (files) => files?.[0]?.size < 2000000 || 'Max 2MB',
              acceptedFormats: (files) =>
                ['application/json'].includes(files[0]?.type) ||
                'Only JSON file',
            },
          })}
        />
        {fileName || 'Import JSON'}
      </label>
      {fileName && (
        <button
          type="button"
          className="h-6 w-6 text-xl leading-none hover:text-indigo-500 transition-colors"
          onClick={() => {
            setValue('json', null, { shouldValidate: true });
            setFileName(null);
            setWords(null);
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
