import * as React from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiDownloadCloud, FiEdit, FiEye, FiTrash } from 'react-icons/fi';
import { IoCopyOutline } from 'react-icons/io5';
import { ProjectDocument } from '../types';
import { formatDate } from '../utils/helpers';
import Spinner from './Spinner';

export function ProjectTile({
  project,
  userID,
  refetch,
}: {
  project: ProjectDocument;
  userID?: string | null;
  refetch?: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDeleteClick = () => {
    setIsLoading(true);

    const deleteApi = fetch('/api/projects', {
      method: 'DELETE',
      body: JSON.stringify({
        _id: project._id,
        userID,
      }),
    });
    toast.promise(deleteApi, {
      loading: 'Deleting project',
      success: () => {
        if (typeof refetch !== 'undefined') {
          refetch();
        }
        return 'Project deleted';
      },
      error: 'Error when deleting',
    });
  };

  const isDraft = !project.status && !project.outputFile;
  const isDone = project.status === 'done' && project.outputFile;

  return (
    <div
      key={project._id}
      className={`p-6 rounded-md bg-slate-800 ${
        isLoading ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      <div className="mb-4">
        <h3 className="font-bold text-xl mb-2">{project.title}</h3>
        <p>{formatDate(project.updatedAt || project.date)}</p>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleDeleteClick}
          className="inline-flex p-2 h-8 w-8 bg-slate-900 align-items-center justify-center rounded-md transition-colors text-red-500 hover:bg-red-700 hover:text-red-100 "
          disabled={isLoading}
        >
          <FiTrash title="Delete Project" className="h-4 w-4" />
        </button>
        <div className="flex flex-wrap gap-2">
          <Link href={`/app/create?newDraft=${project._id}`}>
            <a className="inline-flex p-2 h-8 w-8 bg-slate-900 hover:bg-indigo-700 align-items-center justify-center rounded-md transition-colors">
              <IoCopyOutline title="Copy as New Draft" className="h-4 w-4" />
            </a>
          </Link>
          <Link href={`/app/create/${project._id}`}>
            <a className="inline-flex p-2 h-8 w-8 bg-slate-900 hover:bg-indigo-700 align-items-center justify-center rounded-md transition-colors">
              {(isDraft && <FiEdit title="Edit Project" />) || (
                <FiEye title="View Project" className="h-4 w-4" />
              )}
            </a>
          </Link>
          <a
            download
            href={project.outputFile || '#'}
            className="inline-flex p-2 h-8 w-8 bg-slate-900 hover:bg-indigo-700 align-items-center justify-center rounded-md transition-colors"
          >
            {isDone ? (
              <FiDownloadCloud title="Download" className="h-4 w-4" />
            ) : (
              <Spinner className="h-4 w-4 opacity-50" />
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
