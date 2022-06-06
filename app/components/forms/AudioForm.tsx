import * as React from 'react';
import { useForm } from 'react-hook-form';
import { getAudioData } from '@remotion/media-utils';
import { FileProps } from '../../types';
import Button from '../Button';
import { CF_WORKER_URL } from '../../lib/config';

interface Props {
  audio?: FileProps | null;
  setAudio: (v: FileProps | null) => void;
  audioDuration?: number | null;
  setAudioDuration: (v: number | null) => void;
  isDemo?: boolean;
}

export default function AudioForm({
  audio,
  setAudio,
  audioDuration,
  setAudioDuration,
  isDemo,
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
  const [isLoadingDemo, setIsLoadingDemo] = React.useState<boolean>(false);

  async function processAudio(src: string) {
    const audioData = await getAudioData(src);
    const { numberOfChannels, durationInSeconds, sampleRate } = audioData;

    if (durationInSeconds > 60) {
      setError('audio', {
        type: 'lessThan1Minute',
        message: 'Audio length must be 1 minute or less',
      });
      return {};
    }

    // TODO: Verify number of channels
    console.log(`Channels: ${numberOfChannels}`);

    setAudioDuration(durationInSeconds);

    return { durationInSeconds, sampleRate };
  }

  const setDemoAudio = async () => {
    setIsLoadingDemo(true);

    try {
      const audioDemoUrl = `${CF_WORKER_URL}/storage/ted-talk.mp3`;
      const { durationInSeconds, sampleRate } = await processAudio(
        audioDemoUrl
      );

      if (durationInSeconds) {
        // Convert audio Blob to FileList
        const audioBlob = await fetch(audioDemoUrl).then((res) => res.blob());
        const audioFile = new File([audioBlob], 'ted-talk.mp3', {
          type: 'audio/mp3',
        });
        const audioFileList = new DataTransfer();
        audioFileList.items.add(audioFile);

        setAudio({
          file: audioFileList.files,
          src: audioDemoUrl,
          sampleRate,
        });

        setFileName(audioFile.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  React.useEffect(() => {
    const subscription = watch(async (value) => {
      if (value?.audio?.length && value.audio[0] instanceof File) {
        const file = value.audio[0];
        const audioUrl = URL.createObjectURL(file);
        const { durationInSeconds, sampleRate } = await processAudio(audioUrl);

        if (durationInSeconds) {
          setAudio({
            file: value.audio,
            src: audioUrl,
            sampleRate,
          });
          setFileName(file.name);
        }
      } else {
        setAudio(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  React.useEffect(() => {
    // Whenever audio is updated, validate audio
    if (audio?.src) {
      processAudio(audio.src as string);

      if (audio.src.startsWith('http')) {
        // setFileName(audio.src.split('/').pop() || null);
        setFileName('Audio File' || null);
      }
    }
  }, [audio]);

  React.useEffect(() => {
    // Cleanup URL.createObjectURL
    if (audio?.src && audio.src.startsWith('blob:')) {
      URL.revokeObjectURL(audio.src);
    }
  }, []);

  const isAudioReady = !errors.audio && audio?.src;

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
              <source src={audio.src as string} type="audio/mpeg" />
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
        {isDemo && !isAudioReady && (
          <div>
            <div className="mt-4 mb-4">
              <em>or</em>
            </div>
            <Button
              onClick={setDemoAudio}
              loading={isLoadingDemo}
              loadingText="Loading Demo Audio ..."
              disabled={isLoadingDemo}
            >
              Use Demo Audio
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
