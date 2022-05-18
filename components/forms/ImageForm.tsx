import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import Image from 'next/image';
import { FiUpload } from 'react-icons/fi';
import { fileToBase64 } from '../../utils/helpers';
import { FileProps } from '../../types';

interface Props {
  image?: FileProps | null;
  setImage: Function;
}

const FormStyles = styled.div`
  position: relative;
  height: 100px;
  width: 100px;

  input[type='file'] {
    width: 1px;
    height: 1px;
    opacity: 0;
    position: absolute;
    overflow: hidden;
    z-index: -1;
  }

  label {
    display: flex;
    height: 100%;
    width: 100%;
    cursor: pointer;
    position: relative;
    z-index: 0;

    &:hover {
      &::before {
        opacity: 0.5;
      }
    }

    &::before {
      content: '';
      position: absolute;
      z-index: -2;
      height: 100%;
      width: 100%;
      top: 0;
      left: 0;
      opacity: 1;
      background: var(--stripe-gradient);
      transition: opacity var(--transition);
    }
  }
`;

const PreviewStyles = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  position: relative;
  z-index: 0;

  > div {
    position: absolute !important;
    height: 100%;
    width: 100%;
    z-index: 1;
  }

  > span {
    font-size: 0.875rem;
    line-height: 1.5;
  }

  > svg {
    height: 1.5rem;
    width: auto;
  }
`;

const ImageClearStyles = styled.button`
  font-size: 1.5rem;
  line-height: 0.5;
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.25rem;

  &:hover {
    background-color: rgba(var(--color-p-rgb), 0.25);
  }
`;

export default function ImageForm({ image, setImage }: Props) {
  const {
    register,
    watch,
    formState: { errors },
    setValue,
  } = useForm();

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const subscription = watch(async (value, { name, type }) => {
      if (value?.image?.length && value.image[0] instanceof Blob) {
        setLoading(true);
        const base64 = await fileToBase64(value.image[0]);
        if (base64) {
          setImage({
            file: value.image,
            base64,
          });
        }
        setLoading(false);
      } else {
        setImage(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, image, setImage]);

  return (
    <>
      <FormStyles>
        <label htmlFor="upload-image">
          <input
            id="upload-image"
            type="file"
            accept="image/jpeg, image/png"
            {...register('image', {
              validate: {
                lessThan1MB: (files) => files[0]?.size < 1000000 || 'Max 1MB',
                acceptedFormats: (files) =>
                  ['image/jpeg', 'image/png'].includes(files[0]?.type) ||
                  'Only JPG / PNG file',
              },
            })}
          />
          <PreviewStyles>
            {image?.base64 && (
              <Image src={image.base64} alt="" height={75} width={75} />
            )}
            {!image?.base64 && (
              <>
                {!loading ? (
                  <FiUpload title="Upload Image" />
                ) : (
                  <span>Loading ...</span>
                )}
              </>
            )}
          </PreviewStyles>
        </label>
        {image?.base64 && (
          <ImageClearStyles
            type="button"
            onClick={() => {
              // setImage(null);
              setValue('image', null);
            }}
          >
            &times;
          </ImageClearStyles>
        )}
      </FormStyles>
      <p className="small" style={{ marginTop: '0.5rem' }}>
        Max 1MB, JPG/PNG only
      </p>
    </>
  );
}
