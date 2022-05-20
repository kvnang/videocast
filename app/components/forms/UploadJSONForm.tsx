import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
// import { FileProps } from '../../types';
// import { fileToBase64 } from '../../utils/helpers';

interface Props {
  setWords: Function;
}

// const UploadJSONStyles = styled.div`
//   display: inline-flex;
//   position: relative;

//   input[type='file'] {
//     clip: rect(0 0 0 0);
//     clip-path: inset(50%);
//     height: 1px;
//     overflow: hidden;
//     position: absolute;
//     white-space: nowrap;
//     width: 1px;
//   }

//   .clear {
//   }
// `;

export default function UploadJSONForm({ setWords }: Props) {
  const {
    register,
    watch,
    formState: { errors },
    setValue,
    trigger,
    // handleSubmit,
  } = useForm();

  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    const subscription = watch(async (value, { name, type }) => {
      if (value?.json?.length && value.json[0] instanceof File) {
        setLoading(true);

        const reader = new FileReader();

        reader.onload = function (event) {
          const jsonObj =
            event.target?.result && typeof event.target.result === 'string'
              ? JSON.parse(event.target.result)
              : {};
          // TODO: Validate JSON
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
    <div className="inline-block font-bold">
      <label
        htmlFor="upload-json"
        className="cursor-pointer hover:text-indigo-200 transition-colors"
      >
        <input
          className="sr-only"
          type="file"
          id="upload-json"
          accept="application/json"
          {...register('json', {
            validate: {
              lessThan2MB: (files) => files[0]?.size < 2000000 || 'Max 2MB',
              acceptedFormats: (files) =>
                ['application/json'].includes(files[0]?.type) ||
                'Only JSON file',
            },
          })}
        />
        {fileName || 'Upload JSON'}
      </label>
      {/* <button
        type="button"
        className="clear"
        onClick={() => {
          setValue('json', null, { shouldValidate: true });
        }}
      >
        &times;
      </button> */}
    </div>
  );
}
