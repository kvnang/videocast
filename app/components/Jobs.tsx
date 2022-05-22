import { useContext, useEffect } from 'react';
import { IoVideocamOutline } from 'react-icons/io5';
import { JobProps } from '../types';
import Button from './Button';
import { ModalContext } from './ModalContext';
import Spinner from './Spinner';

function JobModal({ job }: { job: JobProps }) {
  const isCompleted = !!(job?.progress && job.progress === 100);

  return (
    <div className="relative bg-slate-900 p-6 pb-10 rounded-md w-[600px] max-w-full flex flex-col items-start overflow-hidden">
      <h2 className="text-xl text-center font-bold mb-6">
        {(!isCompleted && 'Working on your video ...') ||
          job.data?.message ||
          'Video rendered successfully!'}
      </h2>
      <div className="flex w-full gap-4">
        <div className="basis-2/3">
          <div className="relative w-full aspect-square rounded-md flex items-center justify-center z-0">
            <div className="absolute top-0 left-0 w-full h-full">
              {(job.data?.url && (
                <video // eslint-disable-line jsx-a11y/media-has-caption
                  className="w-full h-full"
                  src={job.data.url as string}
                  controls
                  loop
                />
              )) || <div className="w-full h-full top-0 left-0 skeleton" />}
            </div>
            {!isCompleted && (
              <div className="relative pb-2 mb-8 w-full flex items-center justify-center z-10">
                <IoVideocamOutline className="opacity-20 h-12 w-12 animate-pulse" />
                <p
                  className="absolute top-full text-center left-0 px-4 w-full"
                  dangerouslySetInnerHTML={{
                    __html: job.data?.message || 'Working on it ...',
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="basis-1/3">
          <div className="flex flex-col h-full">
            <ul className="flex-1">
              <li>FPS: 60</li>
              <li>Codec: MKV H.264</li>
            </ul>
            {isCompleted && job.data?.url && (
              <div className="mt-4">
                <Button href={job.data.url as string} target="_blank" download>
                  Download
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full h-4 bg-slate-800 overflow-hidden absolute bottom-0 left-0">
        <div
          style={{ width: `${job.progress || 0}%` }}
          className={`h-full transition-all relative overflow-hidden translate-z-0 ${
            job.progress === 100 ? 'completed' : ''
          }`}
        >
          <div
            className={`absolute h-full w-[200%] top-0 right-0 bg-stripes-accent ${
              !!job.progress && job.progress < 100
                ? 'animate-[progress_15s_linear_infinite]'
                : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default function Jobs({ jobs }: { jobs: JobProps[] }) {
  const job = jobs[0];
  const { setModal } = useContext(ModalContext);
  const isCompleted = job?.progress && job.progress === 100;

  useEffect(() => {
    setModal({
      modalOpen: true,
      children: <JobModal job={job} />,
    });
  }, [job]);

  if (!Object.keys(jobs).length) return null;

  return (
    <ul>
      <li key={`job-${job.id}`}>
        <div className="relative w-full h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            style={{ width: `${job.progress || 0}%` }}
            className={`h-full transition-all relative overflow-hidden rounded-full translate-z-0 ${
              job.progress === 100 ? 'completed' : ''
            }`}
          >
            <div
              className={`absolute h-full w-[200%] top-0 right-0 bg-stripes-accent ${
                !!job.progress && job.progress < 100
                  ? 'animate-[progress_25s_linear_infinite]'
                  : ''
              }`}
            />
          </div>
        </div>
        <p className="text-center mt-4">
          <span
            className={`relative ${
              !!job.progress && job.progress < 100 ? 'pl-6' : ''
            }`}
          >
            {!!job.progress && job.progress < 100 && (
              <Spinner className="absolute left-0 top-1/2 -translate-y-[50%] h-4 w-4" />
            )}
            <span
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: job.data?.message || '',
              }}
            />
          </span>
        </p>
      </li>
    </ul>
  );
}
