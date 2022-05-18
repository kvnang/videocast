import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiDownloadCloud, FiEdit, FiTrash } from 'react-icons/fi';
import { ProjectDocument } from '../types';
import { formatDate } from '../utils/helpers';

export function ProjectTile({
  project,
  userID,
  refetch,
}: {
  project: ProjectDocument;
  userID?: string | null;
  refetch?: () => void;
}) {
  const handleDeleteClick = () => {
    const deleteApi = fetch('/api/projects', {
      method: 'PATCH',
      body: JSON.stringify({
        _id: project._id,
        userID,
        trashed: true,
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
  return (
    <div key={project._id} className="p-6 rounded-md bg-slate-800">
      <div className="mb-4">
        <h3 className="font-bold text-xl mb-2">{project.title}</h3>
        <p>{formatDate(project.updatedAt || project.date)}</p>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleDeleteClick}
          className="inline-flex p-2 h-8 w-8 bg-slate-900 hover:bg-indigo-700 align-items-center justify-center rounded-md transition-colors text-red-500 hover:bg-red-700 hover:text-red-100 "
        >
          <FiTrash title="Delete Project" />
        </button>
        {(project.outputFile && (
          <a
            download
            href={project.outputFile}
            className="inline-flex p-2 h-8 w-8 bg-slate-900 hover:bg-indigo-700 align-items-center justify-center rounded-md transition-colors"
          >
            <FiDownloadCloud title="Download" />
          </a>
        )) || (
          <Link href={`/app/create/${project._id}`}>
            <a className="inline-flex p-2 h-8 w-8 bg-slate-900 hover:bg-indigo-700 align-items-center justify-center rounded-md transition-colors">
              <FiEdit title="Edit Project" />
            </a>
          </Link>
        )}
      </div>
    </div>
  );
}
