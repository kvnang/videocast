import * as React from 'react';
import { useForm } from 'react-hook-form';
import { getAudioData } from '@remotion/media-utils';
import { FileProps } from '../../types';
import { fileToBase64 } from '../../utils/helpers';

interface Props {
  audio?: FileProps | null;
  setAudio: (v: FileProps | null) => void;
  audioDuration?: number | null;
  setAudioDuration: (v: number | null) => void;
}

export default function AudioForm({
  audio,
  setAudio,
  audioDuration,
  setAudioDuration,
}: Props) {
  const {
    register,
    watch,
    formState: { errors },
    setError,
    reset,
    // handleSubmit,
  } = useForm();

  const [fileName, setFileName] = React.useState<string | null>(null);

  async function processAudio(src: string, setState?: boolean) {
    const audioData = await getAudioData(src);
    const { numberOfChannels, durationInSeconds, sampleRate } = audioData;

    if (durationInSeconds > 60) {
      setError('audio', {
        type: 'lessThan1Minute',
        message: 'Audio length must be 1 minute or less',
      });
      return {};
    }

    console.log(`Channels: ${numberOfChannels}`);
    console.log(audioData);

    setAudioDuration(durationInSeconds);

    return { durationInSeconds, sampleRate };
  }

  React.useEffect(() => {
    const subscription = watch(async (value) => {
      if (value?.audio?.length && value.audio[0] instanceof File) {
        const base64 = await fileToBase64(value.audio[0]);
        if (base64) {
          const { durationInSeconds, sampleRate } = await processAudio(
            base64 as string
          );

          if (durationInSeconds) {
            setAudio({
              file: value.audio,
              base64: base64 as string,
              sampleRate,
            });
            setFileName(value.audio[0].name);
          }
        }
      } else {
        setAudio(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  React.useEffect(() => {
    // Whenever audio is updated, validate audio
    if (audio?.base64) {
      processAudio(audio.base64 as string);

      if (audio.base64.startsWith('http')) {
        // setFileName(audio.base64.split('/').pop() || null);
        setFileName('Audio File' || null);
      }
    }
  }, [audio]);

  const isAudioReady = !errors.audio && audio?.base64;

  return (
    <>
      <h2 className="text-white mb-4 font-bold text-lg">
        {fileName || 'Select Audio'}
      </h2>
      <div className="min-w-[400px]">
        <form className={`w-full ${isAudioReady ? 'hidden' : 'block'}`}>
          <label
            htmlFor="audio-file"
            className="block bg-slate-800 p-3 rounded-full w-full cursor-pointer border-2 border-slate-800 hover:border-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <span className="sr-only">Choose File</span>
            <input
              id="audio-file"
              type="file"
              className="block w-full text-sm text-gray-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-700 file:text-indigo-50 hover:file:bg-indigo-600 file:cursor-pointer transition-colors"
              aria-invalid={!!errors.audio}
              accept="audio/mpeg"
              {...register('audio', {
                validate: {
                  lessThan2MB: (files) => files[0]?.size < 2000000 || 'Max 2MB',
                  acceptedFormats: (files) =>
                    ['audio/mpeg'].includes(files[0]?.type) || 'Only MP3 file',
                },
              })}
            />
          </label>
        </form>
        {errors.audio && (
          <p
            className="small"
            style={{ margin: '0.5rem 0 0', color: 'var(--color-error)' }}
          >
            {errors.audio.message}
          </p>
        )}
        {isAudioReady && (
          <div className="flex items-center w-full pt-1 pb-1">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls className="w-full invert">
              <source src={audio.base64 as string} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <button
              type="button"
              className="text-2xl h-8 w-8 min-w-[2rem] hover:text-indigo-500 border-2 border-transparent leading-none focus:border-indigo-500 rounded-full transition-colors"
              aria-label="Remove Audio"
              onClick={() => {
                reset();
                setAudio(null);
                setAudioDuration(null);
                setFileName(null);
              }}
            >
              &times;
            </button>
          </div>
        )}
        <p className="text-center text-white mt-2 text-sm">
          {(isAudioReady && (
            <span>
              Duration: {audioDuration ? `${Math.ceil(audioDuration)}s` : 'N/A'}
            </span>
          )) || <span>Max 2MB, MP3 only, Max 1 min.</span>}
        </p>
      </div>
    </>
  );
}
