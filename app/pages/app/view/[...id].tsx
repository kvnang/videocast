import * as React from 'react';
import {
  Claims,
  getServerSidePropsWrapper,
  getSession,
} from '@auth0/nextjs-auth0';
import type { GetServerSideProps } from 'next';
import { getProject } from '../../../lib/getProject';
import { ProjectDocument } from '../../../types';
import SEO from '../../../components/Seo';
import ViewProject from '../../../components/ViewProject';

export default function ViewPage({
  project,
  user,
}: {
  project: ProjectDocument;
  user?: Claims | null;
}) {
  return (
    <>
      <SEO />
      <main>
        <ViewProject project={project} user={user} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = getServerSidePropsWrapper(
  async ({ req, res, query }) => {
    const session = getSession(req, res);

    const queryId = query.id;

    const _id = queryId && Array.isArray(queryId) ? queryId[0] : queryId;

    if (_id) {
      const project = await getProject(_id, session?.user?.sub);

      if (project?.outputFile && project?.status === 'done') {
        return {
          props: { project, user: session?.user || null },
        };
      }
    }

    return {
      notFound: true,
    };
  }
);
