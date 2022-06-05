import * as React from 'react';
import { Player } from '@remotion/player';
import { Claims } from '@auth0/nextjs-auth0';
import {
  IoCodeSlashSharp,
  IoSaveOutline,
  IoCopyOutline,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import type { google } from '@google-cloud/speech/build/protos/protos';
import { PodcastVideo } from '../remotion/PodcastVideo';
import Form from './Form';
import AudioForm from './forms/AudioForm';
import ImageForm from './forms/ImageForm';
import type {
  FileProps,
  IRecognizeResponse,
  WordsProps,
  ProjectDocument,
  ProjectProps,
  StylesProps,
  InputProps,
  ProjectStatus,
  RenderData,
} from '../types';
import { encodeFormData } from '../utils/helpers';
import Button from './Button';
import StylesForm from './forms/StylesForm';
import UploadJSONForm from './forms/UploadJSONForm';
import { ModalContext } from './ModalContext';
import CurrentTemplates from './CurrentTemplates';
import SaveTemplate from './SaveTemplate';
import TitleForm from './forms/TitleForm';
import { getPublicAssets } from '../lib/assets';
import { defaultStyles, fps, defaultImage } from '../lib/config';
import { bundleProject, saveProjectToDb } from '../lib/project';
import { asyncPoll } from '../utils/poll';
import { SpeechProgressResponse } from '../pages/api/speechProgress';
import { getFontData } from '../lib/cloudflare';
import DemoModal from './DemoModal';

const DEFAULT_TITLE = 'Untitled Project';

export default function EditProject({
  project,
  user,
  setProject,
}: {
  project?: ProjectDocument | null;
  user: Claims;
  setProject: (v: ProjectDocument | null) => void;
}) {
  const defaultProps = project?.inputProps;
  const userID = user.sub;

  const { setModal } = React.useContext(ModalContext);
  const router = useRouter();

  const [formKey, setFormKey] = React.useState(0); // To Force Re-Render

  const [title, setTitle] = React.useState<string | null>(
    project?.title || null
  );
  const [words, setWords] = React.useState<WordsProps | null>(
    defaultProps?.words || null
  );
  const [audio, setAudio] = React.useState<FileProps | null>(
    defaultProps?.audio ? { base64: defaultProps.audio } : null
  );
  const [audioDuration, setAudioDuration] = React.useState<number | null>(
    defaultProps?.audioDuration || null
  );
  const [image, setImage] = React.useState<FileProps | null>(
    defaultProps?.image ? { base64: defaultProps.image } : null
  );
  const [styles, setStyles] = React.useState<StylesProps>(
    defaultProps?.styles || defaultStyles
  );
  const [loadedStyles, setLoadedStyles] = React.useState<StylesProps>(
    defaultProps?.styles || defaultStyles
  );
  const [transcribeLoading, setTranscribeLoading] =
    React.useState<boolean>(false);

  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [isRendering, setIsRendering] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  const isDemo = user.sub.startsWith('demo|');

  async function fetchTranscription() {
    try {
      if (!audio?.file) {
        throw new Error('Audio file not found');
      }

      setTranscribeLoading(true);
      const startTime = performance.now();

      const res = await fetch('/api/speech', {
        method: 'POST',
        body: encodeFormData({
          fileList: audio.file,
          sampleRate: audio.sampleRate,
        }),
      });
      // const { results }: IRecognizeResponse = await res.json();
      const { name } = await res.json();

      const checkRecognizeProgress = async () => {
        try {
          const operation: SpeechProgressResponse = await fetch(
            `/api/speechProgress?operationName=${name}`
          ).then((r) => r.json());
          return {
            done: operation.done || false,
            data: operation.result as google.cloud.speech.v1.LongRunningRecognizeResponse,
          };
        } catch (err) {
          toast.error('Something went wrong');
          throw err;
        }
      };

      const data = await asyncPoll(
        checkRecognizeProgress,
        1 * 1000,
        300 * 1000
      );

      const results = data?.results;

      if (!results) {
        throw new Error('Speech recognition results are empty');
      }

      const allWords = results.reduce(
        (previousValue: WordsProps, currentValue) => {
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
      const endTime = performance.now();
      toast.success(
        `Transcription successful! It took ${Math.ceil(
          (endTime - startTime) / 1000
        )} seconds ...`
      );
    } catch (err) {
      console.error(err);
      setTranscribeLoading(true);
      toast.error('Transcription failed. Please try again.');
      throw err;
    } finally {
      setTranscribeLoading(false);
    }
  }

  async function getInputProps(): Promise<InputProps> {
    const { publicAudio, publicImage } = await getPublicAssets({
      audio,
      image,
    });

    if (!publicAudio) {
      throw new Error('Audio is not defined');
    }

    if (!words) {
      throw new Error('Words is not defined');
    }

    if (!audioDuration) {
      throw new Error('Audio duration is not defined');
    }

    const inputProps = {
      fps,
      styles,
      words,
      audio: publicAudio,
      audioDuration,
      image: publicImage || defaultImage,
      fontData: await getFontData(styles.fontFamily),
    };

    return inputProps;
  }

  async function saveProject(
    props?: {
      outputFile?: string | null;
      status?: ProjectStatus;
      renderData?: RenderData;
    },
    notify?: boolean
  ) {
    const { outputFile, status, renderData } = props || {};

    setIsSaving(true);

    // Construct the payload
    const body: ProjectProps = {
      userID,
      title: title || DEFAULT_TITLE,
      inputProps: await getInputProps(),
    };

    if (project?._id) {
      body._id = project._id;
    }

    if (outputFile) {
      body.outputFile = outputFile;
    }

    if (status) {
      body.status = status;
    }

    if (renderData) {
      body.renderData = renderData;
    }

    // Save project
    const savedProject = await saveProjectToDb(body, true);

    // Adjust URL
    const shallow = !status; // Shallow routing if status is not changed
    const url = `/app/create/${savedProject._id}`;

    if (!shallow) {
      // router.reload();
      router.push(
        {
          pathname: `/app/create/[id]`,
          query: { id: savedProject._id },
        },
        undefined,
        { shallow }
      );
    } else {
      router.push(url, undefined, { shallow });
      setProject(savedProject);
    }

    setIsSaving(false);

    if (notify) {
      toast.success('Project Saved');
    }
  }

  async function beginRender() {
    toast.loading('Preparing for rendering ...', { id: 'render' });
    setIsRendering(true);

    // Save progress in case something fails
    await saveProject();

    // Initiate render
    const renderData = await bundleProject({
      inputProps: await getInputProps(),
    });

    // Save project with renderData
    await saveProject({ renderData, status: 'processing' });
  }

  React.useEffect(() => {
    setIsMounted(true);

    if (isDemo) {
      setModal({
        modalOpen: true,
        children: <DemoModal />,
      });
    }
  }, []);

  return (
    <>
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
                isDemo={isDemo}
              />
            </li>
          </ul>
        </div>
      </section>

      <section className="container mx-auto text-center mb-16">
        <div className="flex flex-col gap-4 items-center">
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
          <UploadJSONForm words={words} setWords={setWords} />
        </div>
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
                  product would probably render fine. This issue is still being
                  worked on.
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
                loading={isSaving && !isRendering}
                loadingText="Saving ..."
                type="submit"
                className="button"
                onClick={() => saveProject(undefined, true)}
                disabled={isSaving || isRendering}
              >
                Save
              </Button>
              <Button
                loading={isRendering}
                loadingText="Preparing ..."
                type="submit"
                className="button"
                onClick={() => beginRender()}
                disabled={isSaving || isRendering}
              >
                Render Video
              </Button>
            </div>
          </section>
        </div>
      )}

      {isDemo && (
        <button
          type="button"
          className="bg-indigo-500 fixed bottom-8 right-8 w-96 -rotate-45 translate-x-[50%] translate-y-[50%] hover:scale-110 transition-transform"
          onClick={() =>
            setModal({
              modalOpen: true,
              children: <DemoModal />,
            })
          }
        >
          <div className="py-1 text-center">
            <span className="font-bold">DEMO</span>
          </div>
        </button>
      )}
    </>
  );
}
