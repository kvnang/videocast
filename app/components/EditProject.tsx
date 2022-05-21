import { useContext, useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { Claims } from '@auth0/nextjs-auth0';
import {
  IoCodeSlashSharp,
  IoSaveOutline,
  IoCopyOutline,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { PodcastVideo } from '../remotion/PodcastVideo';
import Jobs from './Jobs';
import Form from './Form';
import AudioForm from './forms/AudioForm';
import ImageForm from './forms/ImageForm';
import type {
  FileProps,
  IRecognizeResponse,
  WordProps,
  JobProps,
  ProjectDocument,
  ProjectProps,
  StylesProps,
} from '../types';
import { encodeFormData } from '../utils/helpers';
import Button from './Button';
import StylesForm from './forms/StylesForm';
import UploadJSONForm from './forms/UploadJSONForm';
import { ModalContext } from './ModalContext';
import CurrentTemplates from './CurrentTemplates';
import SaveTemplate from './SaveTemplate';
import SEO from './Seo';
import { asyncPoll } from '../utils/poll';
import TitleForm from './forms/TitleForm';
import { getPublicAssets } from '../lib/assets';
import { defaultStyles, fps, defaultImage } from '../lib/config';

const DEFAULT_TITLE = 'Untitled Project';

export default function EditProject({
  project: _project,
  user,
}: {
  project?: ProjectDocument | null;
  user: Claims;
}) {
  const [project, setProject] = useState<ProjectDocument | null>(
    _project || null
  );

  const defaultProps = project?.inputProps;
  const userID = user.sub;

  const { setModal } = useContext(ModalContext);
  const router = useRouter();

  const [formKey, setFormKey] = useState(0); // To Force Re-Render

  const [title, setTitle] = useState<string | null>(project?.title || null);
  const [words, setWords] = useState<WordProps | null>(
    defaultProps?.words || null
  );
  const [audio, setAudio] = useState<FileProps | null>(
    defaultProps?.audio ? { base64: defaultProps.audio } : null
  );
  const [audioDuration, setAudioDuration] = useState<number | null>(
    defaultProps?.audioDuration || null
  );
  const [image, setImage] = useState<FileProps | null>(
    defaultProps?.image ? { base64: defaultProps.image } : null
  );
  const [styles, setStyles] = useState<StylesProps>(
    defaultProps?.styles || defaultStyles
  );
  const [loadedStyles, setLoadedStyles] = useState<StylesProps>(
    defaultProps?.styles || defaultStyles
  );
  const [transcribeLoading, setTranscribeLoading] = useState<boolean>(false);
  const [job, setJob] = useState<JobProps | null>(null);
  const [addingJob, setAddingJob] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  async function fetchTranscription() {
    try {
      if (!audio?.file) {
        throw new Error('Audio file not found');
      }

      setTranscribeLoading(true);

      const res = await fetch('/api/speech', {
        method: 'POST',
        body: encodeFormData({ fileList: audio.file }),
      });
      const { results }: IRecognizeResponse = await res.json();

      if (!results) {
        throw new Error('Speech recognition results are empty');
      }

      const allWords = results.reduce(
        (previousValue: WordProps, currentValue) => {
          if (currentValue.alternatives && currentValue.alternatives[0].words) {
            previousValue.push(currentValue.alternatives[0].words);
          }
          return previousValue;
        },
        []
      );

      if (!allWords) {
        throw new Error('Words are empty');
      }
      setWords(allWords);
      toast.success('Transcription Successful');
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setTranscribeLoading(false);
    }
  }

  async function saveProject(outputFile?: string | null) {
    setIsSaving(true);

    const { publicAudio, publicImage } = await getPublicAssets({
      audio,
      image,
    });

    if (!publicAudio) {
      return;
    }

    const inputProps = {
      fps,
      styles,
      words,
      audio: publicAudio,
      audioDuration,
      image: publicImage,
    };

    const body: ProjectProps = {
      userID,
      title: title || DEFAULT_TITLE,
      inputProps,
    };

    if (project?._id) {
      body._id = project._id;
    }

    if (outputFile) {
      body.outputFile = outputFile;
    }

    // Save project
    const res = await fetch('/api/projects', {
      method: project?._id ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    });

    // Retrieve project and set state
    const { insertedId } = await res.json();

    if (!project?._id && insertedId) {
      const savedProject = await fetch(
        `/api/projects?_id=${insertedId}&userID=${userID}`
      ).then((r) => r.json());

      setProject(savedProject);

      // Adjust URL
      router.push(`/app/create/${insertedId}`, undefined, { shallow: true });

      setIsSaving(false);
      toast.success('Project Saved');

      return savedProject;
    }

    setIsSaving(false);
    toast.success('Project Saved');

    return project;
  }

  async function addJob() {
    setAddingJob(true);

    setJob({
      id: 1,
      progress: 0,
      state: 'progress',
      data: { message: 'Saving project' },
    });

    const { _id } = await saveProject();

    // 1. Upload audio & image to GCS
    setJob({
      id: 1,
      progress: 10,
      state: 'progress',
      data: { message: 'Uploading assets' },
    });

    const { publicImage, publicAudio } = await getPublicAssets({
      image,
      audio,
    });

    if (!publicAudio) {
      setAddingJob(false);
      throw new Error('Audio cannot be uploaded');
    }

    setAddingJob(false);

    // 2. Hit URL Endpoint
    setJob({
      id: 1,
      progress: 20,
      state: 'progress',
      data: { message: 'Bundling Video' },
    });

    const inputProps = {
      fps,
      styles,
      words,
      audio: publicAudio,
      audioDuration,
      image: publicImage || defaultImage,
    };

    const res = await fetch('/api/render/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputProps),
    });
    const json = await res.json();

    setJob({
      id: 1,
      progress: 40,
      state: 'progress',
      data: { message: 'Rendering Video ...' },
    });

    async function checkLambdaProgress() {
      const progressRes = await fetch(
        `/api/renderProgress?renderId=${json.renderId}&bucketName=${json.bucketName}&functionName=${json.functionName}`
      );
      const { isSettled, outputFile, overallProgress } =
        await progressRes.json();

      setJob({
        id: 1,
        progress: 40 + overallProgress * 50,
        state: 'progress',
        data: { message: 'Rendering Video ...' },
      });

      return { done: isSettled, data: { outputFile } };
    }

    const data = await asyncPoll(checkLambdaProgress, 5 * 1000, 300 * 1000);

    const url = data?.outputFile;

    if (!url) {
      throw new Error('Video cannot be rendered');
    }

    // Upload to R2
    // setJob({
    //   id: 1,
    //   progress: 95,
    //   state: 'progress',
    //   data: { message: 'Uploading Video ...' },
    // });

    // const uploadRes = await fetch('/api/uploadRemote', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     url: data.outputFile,
    //     fileName: `${_id}-${Date.now()}`,
    //   }),
    // });

    // const { url } = await uploadRes.json();

    // if (!url) {
    //   throw new Error('Rendered video cannot be uploaded');
    // }

    setJob({
      id: 1,
      progress: 100,
      state: 'done',
      data: {
        message: `🎉  Video uploaded to <a href="${url}" target="_blank" class="inline-link">${url}</a>`,
      },
    });

    // Save project
    saveProject(data.outputFile);
  }

  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <SEO />
      <main>
        <section className="container mx-auto mb-4">
          <TitleForm title={title} setTitle={setTitle} />
        </section>
        <section className="container mx-auto mb-8">
          <div className="p-8 border-dashed border-4 border-slate-500 rounded-xl w-full max-w-xl mx-auto">
            <ul className="flex justify-center items-center text-center">
              <li>
                <AudioForm
                  audio={audio}
                  setAudio={setAudio}
                  audioDuration={audioDuration}
                  setAudioDuration={setAudioDuration}
                />
              </li>
            </ul>
          </div>
        </section>

        <section className="container mx-auto text-center mb-16">
          <Button
            type="button"
            className="button"
            onClick={() => {
              fetchTranscription();
            }}
            disabled={
              !(audio && audioDuration) || transcribeLoading || words?.length
            }
            loading={transcribeLoading}
            loadingText="Transcribing ..."
          >
            Transcribe Audio
          </Button>
          &nbsp;&nbsp;or&nbsp;&nbsp;
          <UploadJSONForm setWords={setWords} />
        </section>

        {!!words?.length && audio?.base64 && audioDuration && (
          <div>
            <section className="container mx-auto mb-16">
              <div>
                <h2 className="text-xl mb-6 font-bold">Edit Transcription</h2>
                <Form
                  words={words}
                  setWords={setWords}
                  key={`form-${formKey}`}
                  formKey={formKey}
                  setFormKey={setFormKey}
                />
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <Button
                  icon={<IoCopyOutline />}
                  buttonStyle="secondary"
                  onClick={() => {
                    const string = words
                      .map((sentence) =>
                        sentence.map((word) => `${word.word}`).join(' ')
                      )
                      .join('\n');
                    navigator.clipboard.writeText(string).then(() => {
                      toast.success('Text copied to clipboard');
                    });
                  }}
                >
                  Copy Text
                </Button>
                <Button
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(
                    JSON.stringify(words)
                  )}`}
                  icon={<IoCodeSlashSharp />}
                  download="data.json"
                >
                  Download JSON
                </Button>
              </div>
            </section>
            <section className="container mx-auto mb-16">
              <div className="flex flex-wrap gap-16">
                <div className="flex-1 min-w-[400px]">
                  <div className="mb-8">
                    <div className="mb-8">
                      <h2 className="text-xl mb-6 font-bold">Select Image:</h2>
                      <ImageForm image={image} setImage={setImage} />
                    </div>
                    <div className="mb-8">
                      <h2 className="text-xl mb-6 font-bold">Style:</h2>
                      <StylesForm
                        styles={styles}
                        setStyles={setStyles}
                        loadedStyles={loadedStyles}
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 justify-end">
                      <Button
                        type="submit"
                        className="button"
                        onClick={() => {
                          setModal({
                            modalOpen: true,
                            children: (
                              <div className="bg-slate-900 p-6 rounded-md w-[600px] max-w-full flex flex-col">
                                <SaveTemplate userID={userID} styles={styles} />
                              </div>
                            ),
                          });
                        }}
                        buttonStyle="secondary"
                      >
                        Save as Template
                      </Button>
                      <Button
                        type="submit"
                        className="button"
                        onClick={() => {
                          setModal({
                            modalOpen: true,
                            children: (
                              <div className="bg-slate-900 p-6 rounded-md w-[600px] max-w-full flex flex-col">
                                <CurrentTemplates
                                  userID={userID}
                                  setLoadedStyles={setLoadedStyles}
                                />
                              </div>
                            ),
                          });
                        }}
                      >
                        Load Template
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl mb-6 font-bold">Video Preview:</h2>
                  <p className="mb-6">
                    N.B. If audio & video seem out-of-sync, don't worry. The end
                    product would probably render fine. This issue is still
                    being worked on.
                  </p>
                  <div style={{ width: '720px' }}>
                    {isMounted && (
                      <Player
                        component={PodcastVideo}
                        compositionWidth={720}
                        compositionHeight={720}
                        controls
                        durationInFrames={3600}
                        fps={fps}
                        loop={false}
                        numberOfSharedAudioTags={0}
                        inputProps={{
                          styles,
                          words,
                          audio: audio.base64,
                          audioDuration,
                          image: image?.base64 || defaultImage,
                        }}
                        style={{
                          width: '100%',
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>
            <section className="container mx-auto mt-8 mb-16">
              <div className="flex justify-end gap-4">
                <Button
                  icon={<IoSaveOutline />}
                  buttonStyle="secondary"
                  loading={isSaving}
                  loadingText="Saving ..."
                  type="submit"
                  className="button"
                  onClick={() => saveProject()}
                  disabled={isSaving}
                >
                  Save
                </Button>
                <Button
                  loading={addingJob}
                  type="submit"
                  className="button"
                  onClick={() => addJob()}
                  disabled={job && job.progress !== 100}
                >
                  Render Video
                </Button>
              </div>
            </section>
          </div>
        )}
        {job && (
          <section className="container mx-auto mb-16">
            <Jobs jobs={[job]} />
          </section>
        )}
        {user.sub.startsWith('demo|') && (
          <section className="bg-indigo-500 fixed top-0 right-0 w-full rotate-45">
            <div className="container mx-auto py-1 text-center">
              <span className="font-bold">DEMO</span>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
