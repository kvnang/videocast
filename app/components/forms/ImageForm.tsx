import * as React from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { FiUpload } from 'react-icons/fi';
import { FileProps } from '../../types';

interface Props {
  image?: FileProps | null;
  setImage: Function;
}

export default function ImageForm({ image, setImage }: Props) {
  const {
    register,
    watch,
    formState: { errors },
    setValue,
  } = useForm();

  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const subscription = watch(async (value, { name, type }) => {
      if (value?.image?.length && value.image[0] instanceof Blob) {
        setLoading(true);
        const file = value.image[0];
        const fileUrl = URL.createObjectURL(file);

        setImage({
          file: value.image,
          src: fileUrl,
        });

        setLoading(false);
      } else {
        setImage(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, image, setImage]);

  React.useEffect(() => {
    if (image?.src && image.src.startsWith('blob:')) {
      URL.revokeObjectURL(image.src);
    }
  }, []);

  return (
    <>
      <div className="h-24 w-24 relative">
        <label
          htmlFor="upload-image"
          className="block w-full h-full relative cursor-pointer before:absolute before:w-full before:h-full before:bg-stripes before:transition-opacity hover:before:opacity-50"
        >
          <input
            id="upload-image"
            type="file"
            accept="image/jpeg, image/png"
            className="sr-only"
            {...register('image', {
              validate: {
                lessThan1MB: (files) => files[0]?.size < 1000000 || 'Max 1MB',
                acceptedFormats: (files) =>
                  ['image/jpeg', 'image/png'].includes(files[0]?.type) ||
                  'Only JPG / PNG file',
              },
            })}
          />
          <div className="h-full w-full absolute flex items-center justify-center overflow-hidden">
            {(image?.src && (
              <Image
                src={image.src}
                alt=""
                layout="fill"
                className="w-full h-full"
              />
            )) || (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {!loading ? (
                  <FiUpload className="h-8 w-8" title="Upload Image" />
                ) : (
                  <span className="text-sm">Loading ...</span>
                )}
              </>
            )}
          </div>
        </label>
        {image?.src && (
          <button
            type="button"
            className="absolute top-0 right-0 leading-[0] text-4xl h-8 w-8 flex items-center justify-center"
            onClick={() => {
              // setImage(null);
              setValue('image', null);
            }}
          >
            &times;
          </button>
        )}
      </div>
      <p className="small" style={{ marginTop: '0.5rem' }}>
        Max 1MB, JPG/PNG only
      </p>
    </>
  );
}
