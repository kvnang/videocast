import React from 'react';
import { JobProps } from '../types';
import Spinner from './Spinner';

export default function Jobs({ jobs }: { jobs: JobProps[] }) {
  if (!Object.keys(jobs).length) return null;
  return (
    <ul>
      {jobs &&
        Object.values(jobs).map((job) => {
          if (!job) return null;
          return (
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
          );
        })}
    </ul>
  );
}
