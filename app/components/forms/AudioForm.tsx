import * as React from 'react';
import { useForm } from 'react-hook-form';
import { getAudioData } from '@remotion/media-utils';
import { IoWarningOutline } from 'react-icons/io5';
import { FileProps } from '../../types';
import Button from '../Button';
import { CF_WORKER_URL } from '../../lib/config';
import { getFileListFromBlob, loadRemoteFile } from '../../utils/helpers';

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
  const [channels, setChannels] = React.useState<number | null>(null);
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

    setChannels(numberOfChannels);
    setAudioDuration(durationInSeconds);

    return { durationInSeconds, sampleRate };
  }

  const setDemoAudio = async () => {
    setIsLoadingDemo(true);

    try {
      const { blob: audioDemoBlob, url: audioDemoUrl } = await loadRemoteFile(
        `${CF_WORKER_URL}/storage/ted-talk.mp3`
      );

      const { durationInSeconds, sampleRate } = await processAudio(
        audioDemoUrl
      );

      if (durationInSeconds) {
        const audioFileName = 'ted-talk.mp3';
        const audioFileList = getFileListFromBlob(
          audioDemoBlob,
          audioFileName,
          {
            type: 'audio/mp3',
          }
        );

        setAudio({
          file: audioFileList,
          src: audioDemoUrl,
          sampleRate,
        });

        setFileName(audioFileName);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const removeAudio = () => {
    reset();
    setAudio(null);
    setAudioDuration(null);
    setChannels(null);
    setFileName(null);
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
          <p className="small mt-4 text-red-500">{errors.audio.message}</p>
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
                removeAudio();
              }}
            >
              &times;
            </button>
          </div>
        )}
        <ul className="flex flex-wrap items-center justify-center gap-2 text-center text-slate-300 mt-2 text-sm">
          {(isAudioReady && (
            <>
              <li className="bg-slate-900 px-3 py-1 rounded-full">
                Duration:{' '}
                {audioDuration ? `${Math.ceil(audioDuration)}s` : 'N/A'}
              </li>
              <li className="bg-slate-900 px-3 py-1 rounded-full">
                Channels: {channels || 'N/A'}
              </li>
            </>
          )) || (
            <>
              <li className="bg-slate-900 px-3 py-1 rounded-full">Max 2MB</li>
              <li className="bg-slate-900 px-3 py-1 rounded-full">MP3 only</li>
              <li className="bg-slate-900 px-3 py-1 rounded-full">
                Max 1 min.
              </li>
            </>
          )}
        </ul>
        {isDemo && !isAudioReady && (
          <div>
            <div className="mt-4 mb-4">
              <div
                className="relative 
                before:absolute before:w-[calc(50%-2ch)] before:border-b-2 before:border-slate-700 before:left-0 before:top-1/2 before:-translate-y-[50%] before:-z-10
                after:absolute after:w-[calc(50%-2ch)] after:border-b-2 after:border-slate-700 after:right-0 after:top-1/2 after:-translate-y-[50%] after:-z-10
              "
              >
                <em>or</em>
              </div>
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
        {!!channels && channels > 1 && (
          <p className="mt-6 text-left text-sm flex text-white bg-yellow-600 rounded-md p-3 items-center shadow-md">
            <div className="mr-2 pr-2 border-r-2 border-r-yellow-500">
              <IoWarningOutline className="w-8 h-8" />
            </div>
            <span className="pl-2">
              <strong>Transcription might take significantly longer</strong> for
              multi-channel audio. To transcribe faster, consider converting the
              audio to mono first.
            </span>
          </p>
        )}
      </div>
    </>
  );
}
