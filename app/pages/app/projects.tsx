import { useUser } from '@auth0/nextjs-auth0';
import React from 'react';
import toast from 'react-hot-toast';
import { ProjectTile } from '../../components/ProjectTile';
import { ProjectDocument } from '../../types';

export default function ProjectsPage() {
  const { user } = useUser();

  const [projects, setProjects] = React.useState<ProjectDocument[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchProjects = async () => {
    if (!user?.sub) {
      toast.error('Authentication failed');
      return;
    }
    fetch(`/api/projects?userID=${user.sub}`)
      .then((res) => res.json())
      .then((data: ProjectDocument[]) => {
        setProjects(data);
        setLoading(false);
      });
  };

  React.useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const draftProjects = projects.filter((project) => !project.outputFile);
  const publishedProjects = projects.filter((project) => project.outputFile);

  return (
    <main>
      <section className="container mx-auto mb-16">
        <h1 className="text-3xl font-bold font-display">My Projects</h1>
      </section>
      {!!draftProjects?.length && (
        <section className="container mx-auto mb-16">
          <h2 className="text-xl font-bold mb-8 pb-2 border-b-2 border-b-slate-800">
            Draft
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {draftProjects.map((project) => (
              <ProjectTile
                key={project._id}
                project={project}
                userID={user?.sub}
                refetch={fetchProjects}
              />
            ))}
          </div>
        </section>
      )}
      {!!publishedProjects?.length && (
        <section className="container mx-auto mb-16">
          <h2 className="text-xl font-bold mb-8 pb-2 border-b-2 border-b-slate-800">
            Published
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {publishedProjects.map((project) => (
              <ProjectTile
                key={project._id}
                project={project}
                userID={user?.sub}
                refetch={fetchProjects}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
