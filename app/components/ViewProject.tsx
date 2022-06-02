import { Claims } from '@auth0/nextjs-auth0';
import * as React from 'react';
import toast from 'react-hot-toast';
import {
  IoCopyOutline,
  IoShareSocialOutline,
  IoVideocamOutline,
} from 'react-icons/io5';
import { saveProjectToDb } from '../lib/project';
import { JobProps, ProjectDocument } from '../types';
import { formatDate } from '../utils/helpers';
import { asyncPoll } from '../utils/poll';
import Button from './Button';

function ProjectHeader({ project }: { project: ProjectDocument }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
      <p>{formatDate(project.date)}</p>
    </div>
  );
}

export default function ViewProject({
  project,
  user,
}: {
  project: ProjectDocument;
  user?: Claims | null;
}) {
  const [job, setJob] = React.useState<JobProps | null>(null);
  const videoUrl = project?.outputFile || job?.data?.url;
  const isCompleted =
    project.outputFile || !!(job?.progress && job.progress === 100);

  async function checkProgress() {
    // 1. Get renderId, bucket, and functionName
    setJob({
      id: 1,
      progress: 30,
      state: 'progress',
      data: { message: 'Bundling ...' },
    });

    // 1a. Get render data
    if (!project.renderData) {
      throw new Error('renderData is not ready');
    }
    const { renderId, bucketName, functionName } = project.renderData;

    setJob({
      id: 1,
      progress: 40,
      state: 'progress',
      data: { message: 'Rendering ...' },
    });

    const checkLambdaProgress = async () => {
      const { isSettled, outputFile, overallProgress } = await fetch(
        `/api/renderProgress?renderId=${renderId}&bucketName=${bucketName}&functionName=${functionName}`
      ).then((r) => r.json());

      setJob({
        id: 1,
        progress: 40 + overallProgress * 50,
        state: 'progress',
        data: {
          message: `Rendering Video ${Math.ceil(overallProgress * 100)}% ...`,
        },
      });

      return { done: isSettled, data: { outputFile } };
    };

    const data = await asyncPoll(checkLambdaProgress, 5 * 1000, 300 * 1000);

    const url = data?.outputFile;

    if (!url) {
      throw new Error('Video cannot be rendered');
    }

    setJob({
      id: 1,
      progress: 100,
      state: 'done',
      data: {
        message: `🎉  Video rendered successfully`,
        url,
      },
    });

    toast.success('Video rendered successfully', {
      id: 'render',
      duration: 5000,
      icon: '🎉',
    });

    // Save project
    saveProjectToDb({ ...project, outputFile: url, status: 'done' });
  }

  React.useEffect(() => {
    if (!isCompleted && project?.status === 'processing') {
      checkProgress();
    }
  }, []);

  const [isSharing, setIsSharing] = React.useState(false);

  async function handleShare() {
    setIsSharing(true);

    try {
      const userID = user?.sub;

      if (!userID && !project?.isPublic) {
        toast.error(`Sorry, you're not authorized to share this project`);
        throw new Error(`Sorry, you're not authorized to share this project`);
      }

      if (!project?.isPublic) {
        await fetch('/api/projects', {
          method: 'PUT',
          body: JSON.stringify({ _id: project._id, userID, isPublic: true }),
        });
      }

      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_URL}/app/view/${project._id}`
      );

      toast.success(
        `Link copied to clipboard.${
          userID ? 'Anyone can now view this project!' : ''
        }`
      );
    } catch (e) {
      toast.error(`Sorry, we cannot share this project`);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <section className="container mx-auto">
      <ProjectHeader project={project} />
      <div className="flex w-full gap-8 mb-16 max-w-5xl mx-auto">
        <div className="basis-3/5">
          <div className="relative w-full aspect-square rounded-md flex items-center justify-center z-0">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="w-full h-full rounded-md overflow-hidden">
                {(videoUrl && (
                  <video // eslint-disable-line jsx-a11y/media-has-caption
                    className="w-full h-full"
                    src={videoUrl as string}
                    controls
                    loop
                  />
                )) || <div className="w-full h-full top-0 left-0 skeleton" />}
              </div>
            </div>
            {!isCompleted && (
              <div className="relative pb-2 mb-8 w-full flex items-center justify-center z-10">
                <IoVideocamOutline className="opacity-20 h-12 w-12 animate-pulse" />
                <p
                  className="absolute top-full text-center left-0 px-4 w-full"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: job?.data?.message || 'Working on it ...',
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="basis-2/5">
          <div className="flex flex-col h-full">
            <div className="bg-slate-800 p-6 rounded-md">
              <div className="flex-1">
                <table className="table-auto border-collapse w-full">
                  <tbody>
                    <tr className="border-b-2 border-b-slate-700 last:border-b-0">
                      <td className="px-1 py-2">FPS</td>
                      <td className="px-1 py-2 text-right">
                        <code>60</code>
                      </td>
                    </tr>
                    <tr className="border-b-2 border-b-slate-700 last:border-b-0">
                      <td className="px-1 py-2">Codec</td>
                      <td className="px-1 py-2 text-right">
                        <code>MKV H.264</code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {isCompleted && videoUrl && (
                <div className="mt-8 text-right flex gap-4 flex-wrap justify-end">
                  {(project.isPublic || !!user) && (
                    <Button
                      icon={<IoShareSocialOutline />}
                      buttonStyle="secondary"
                      onClick={() => handleShare()}
                      loading={isSharing}
                      loadingText="Sharing project"
                    >
                      Share
                    </Button>
                  )}
                  <Button href={videoUrl as string} target="_blank" download>
                    Download
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {job && (
        <div
          className={`fixed bottom-0 left-0 w-full transition-colors ${
            job.progress === 100 ? 'opacity-0' : ''
          }`}
        >
          <div className="relative w-full h-2 bg-slate-700 overflow-hidden">
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
          {/* <p className="text-center mt-4">
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
          </p> */}
        </div>
      )}
    </section>
  );
}
