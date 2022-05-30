export interface FileProps {
  file?: FileList | null;
  base64?: string | null;
}

export interface StylesProps {
  [key: string]: string | number | undefined;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  title?: string;
  subtitle?: string;
}

export interface InputProps {
  fps: number;
  styles: StylesProps;
  words: WordProps;
  audio: string;
  image: string;
  audioDuration: number;
  fontData: FontProps;
}

export type ProjectStatus = 'processing' | 'done' | 'error';

export interface RenderData {
  renderId: string;
  bucketName: string;
  functionName: string;
}
export interface ProjectProps {
  _id?: string;
  userID?: string;
  title: string;
  inputProps: InputProps;
  outputFile?: string;
  status?: ProjectStatus | null;
  renderData?: RenderData | null;
}

export interface ProjectDocument extends ProjectProps {
  _id: string;
  date: string;
  updatedAt?: string;
  trashed?: boolean;
}

// see @google-cloud/speech/build/protos
/* global Long */
export interface IDuration {
  /** Duration seconds */
  seconds?: number | Long | string | null;

  /** Duration nanos */
  nanos?: number | null;
}

/** Properties of a WordInfo. */
export interface IWordInfo {
  /** WordInfo startTime */
  startTime?: IDuration | null;

  /** WordInfo endTime */
  endTime?: IDuration | null;

  /** WordInfo word */
  word?: string | null;

  /** WordInfo speakerTag */
  speakerTag?: number | null;
}

export interface ISpeechRecognitionAlternative {
  /** SpeechRecognitionAlternative transcript */
  transcript?: string | null;

  /** SpeechRecognitionAlternative confidence */
  confidence?: number | null;

  /** SpeechRecognitionAlternative words */
  words?: IWordInfo[] | null;
}

/** Properties of a SpeechRecognitionResult. */
export interface ISpeechRecognitionResult {
  /** SpeechRecognitionResult alternatives */
  alternatives?: ISpeechRecognitionAlternative[] | null;

  /** SpeechRecognitionResult channelTag */
  channelTag?: number | null;
}

/** Properties of a RecognizeResponse. */
export interface IRecognizeResponse {
  /** RecognizeResponse results */
  results?: ISpeechRecognitionResult[] | null;

  /** RecognizeResponse totalBilledTime */
  totalBilledTime?: IDuration | null;
}

export type WordProps = IWordInfo[][];

export interface JobProps {
  id: number;
  state: string;
  progress?: number;
  reason?: string;
  data?: {
    message?: string;
    [key: string]: string | number | undefined | null;
  };
}

export interface FontProps {
  family: string;
  files: Record<string, string>;
}
