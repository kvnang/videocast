import * as React from 'react';
import { Claims, getSession } from '@auth0/nextjs-auth0';
import type { GetServerSideProps } from 'next';
import EditProject from '../../../components/EditProject';
import { getProject } from '../../../lib/project';
import { ProjectDocument, ProjectStatus } from '../../../types';
import { absolutizeUrl } from '../../../utils/helpers';
import SEO from '../../../components/Seo';
import ViewProject from '../../../components/ViewProject';

export default function CreatePage({
  project: _project,
  user,
}: {
  project?: ProjectDocument | null;
  user: Claims;
}) {
  const [project, setProject] = React.useState<ProjectDocument | null>(
    _project || null
  );
  const [projectStatus, setProjectStatus] = React.useState<
    ProjectStatus | undefined
  >(project?.outputFile ? 'done' : project?.status || undefined);

  const isDraft = !project || !projectStatus;

  return (
    <>
      <SEO />
      <main>
        {(!isDraft && <ViewProject project={project} />) || (
          <EditProject
            project={project}
            user={user}
            setProject={setProject}
            setProjectStatus={setProjectStatus}
          />
        )}
      </main>
    </>
  );
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
    if (req.cookies.appSession === 'demo') {
      return {
        props: {
          user: {
            sub: 'demo|1234567890',
          },
        },
      };
    }

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

  if (_id && _id !== 'new') {
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
    const newProject = {
      userID: project.userID,
      title: project.title,
      inputProps: { ...project.inputProps },
    };

    if (newProject && Object.keys(newProject)?.length) {
      return {
        props: { project: newProject, user: session.user },
      };
    }
  }

  return { props: { user: session.user } };
};
