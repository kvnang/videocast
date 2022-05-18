import React from 'react';
import { JobProps } from '../types';

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
                    className={`absolute h-full w-[200%] top-0 right-0 ${
                      job.progress && job.progress < 100
                        ? 'animate-[progress_25s_linear_infinite]'
                        : ''
                    }`}
                    style={{ background: 'var(--stripe-gradient-accent)' }}
                  />
                </div>
              </div>
              <p
                className="text-center mt-4"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: job.data?.message || '' }}
              />
            </li>
          );
        })}
    </ul>
  );
}
