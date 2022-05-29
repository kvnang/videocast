import { InputProps, ProjectProps } from '../types';

export async function saveProjectToDb(
  project: ProjectProps,
  returnFull?: boolean
) {
  const res = await fetch('/api/projects', {
    method: project._id ? 'PUT' : 'POST', // Update a document if _id is present, otherwise create a new one
    body: JSON.stringify(project),
  });

  // Return the project ID
  const { insertedId } = await res.json();

  if (returnFull) {
    const _id = project._id || insertedId;
    return fetch(`/api/projects?_id=${_id}&userID=${project.userID}`).then(
      (r) => r.json()
    );
  }

  return { insertedId };
}

export async function bundleProject({
  inputProps,
}: {
  inputProps: InputProps;
}) {
  const res = await fetch('/api/render/', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputProps),
  });
  const { renderId, bucketName, functionName } = await res.json();

  // Save render data to project
  // const newProject = {
  //   ...project,
  //   renderData: { renderId, bucketName, functionName },
  // };

  // await saveProjectToDb(newProject);

  return { renderId, bucketName, functionName };
}
