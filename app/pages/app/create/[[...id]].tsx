import { Claims, getSession } from '@auth0/nextjs-auth0';
import type { GetServerSideProps } from 'next';
import EditProject from '../../../components/EditProject';
import { getProject } from '../../../lib/project';
import { ProjectDocument } from '../../../types';
import { absolutizeUrl } from '../../../utils/helpers';

export default function CreatePage({
  project,
  user,
}: {
  project?: ProjectDocument | null;
  user: Claims;
}) {
  return <EditProject project={project} user={user} />;
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
  resolvedUrl,
}) => {
  const session = getSession(req, res);
  const queryId = query.id;
  const newDraftId = query.newDraft;

  const _id = queryId && Array.isArray(queryId) ? queryId[0] : queryId;
  const newDraft =
    newDraftId && Array.isArray(newDraftId) ? newDraftId[0] : newDraftId;

  if (!session?.user) {
    return {
      redirect: {
        permanent: false,
        destination: `${
          process.env.AUTH0_BASE_URL
        }/api/auth/login?returnTo=${absolutizeUrl(resolvedUrl)}`,
      },
      props: {},
    };
  }

  if (_id) {
    // 1. fetch project
    const project = await getProject(_id, session.user.sub);

    if (project && Object.keys(project)?.length) {
      return {
        props: { project, user: session.user },
      };
    }
  }

  if (newDraft) {
    const project = await getProject(newDraft, session.user.sub);
    const { _id, ...newProject } = project;

    if (project && Object.keys(project)?.length) {
      return {
        props: { project: newProject, user: session.user },
      };
    }
  }

  return { props: { user: session.user } };
};
