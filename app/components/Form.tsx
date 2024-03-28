import * as React from 'react';
import { useForm } from 'react-hook-form';
import { WordsProps } from '../types';

interface RemoveButtonProps {
  className?: string;
  sentenceIndex: number;
  wordIndex: number;
  words: WordsProps;
  setWords: (v: WordsProps) => void;
  formKey: number;
  setFormKey: (v: number) => void;
}
interface AddButtonProps extends RemoveButtonProps {
  position?: 'before' | 'after';
}

/**
 * Convert Milliseconds to Nanos, ensuring that 1000 and 1 are equal (i.e. 0.1 second)
 */
const convertMsToNanos = (ms: number) =>
  Math.floor(parseFloat(`0.${ms}`) * 10000 * 100000);

function AddButton({
  className = '',
  sentenceIndex,
  wordIndex,
  position = 'after',
  words,
  setWords,
  formKey,
  setFormKey,
}: AddButtonProps) {
  function handleClick() {
    // console.log(words[sentenceIndex]);
    const newIndex = position === 'before' ? wordIndex : wordIndex + 1;
    const newWords = [...words];

    const newWord = {
      startTime: newWords[sentenceIndex][newIndex]
        ? {
            ...newWords[sentenceIndex][newIndex]?.startTime,
          }
        : {
            ...newWords[sentenceIndex][newIndex - 1].endTime,
          },
      endTime: newWords[sentenceIndex][newIndex]
        ? {
            ...newWords[sentenceIndex][newIndex]?.startTime,
          }
        : {
            ...newWords[sentenceIndex][newIndex - 1].endTime,
          },
      word: '[insert new word]',
    };
    newWords[sentenceIndex].splice(newIndex, 0, newWord);
    setWords(newWords);
    setFormKey(formKey + 1);
  }
  return (
    <button type="button" className={className} onClick={handleClick}>
      +
    </button>
  );
}

function RemoveButton({
  className = '',
  sentenceIndex,
  wordIndex,
  words,
  setWords,
  formKey,
  setFormKey,
}: RemoveButtonProps) {
  function handleClick() {
    const newWords = [...words];
    newWords[sentenceIndex].splice(wordIndex, 1);
    setWords(newWords);
    setFormKey(formKey + 1);
  }
  return (
    <button type="button" className={className} onClick={handleClick}>
      &times;
    </button>
  );
}

export default function Form({
  formKey,
  setFormKey,
  words,
  setWords,
}: {
  formKey: number;
  setFormKey: (v: number) => void;
  words: WordsProps;
  setWords: (v: WordsProps | null) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<{ words: WordsProps }>();

  const onSubmit = handleSubmit((data) => console.log(data));

  React.useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!name || !words) {
        return;
      }

      const sentenceIndex = name?.split('.')[1]
        ? parseInt(name?.split('.')[1])
        : null;
      const wordIndex = name?.split('.')[2]
        ? parseInt(name?.split('.')[2])
        : null;
      const valueType = name?.split('.')[3] || null;

      if (sentenceIndex === null || wordIndex === null) {
        return;
      }

      const newWords = [...words];

      if (valueType === 'word') {
        const fieldValue =
          value.words?.[sentenceIndex]?.[wordIndex]?.[valueType];
        newWords[sentenceIndex][wordIndex].word = fieldValue;
      } else if (valueType === 'startTime' || valueType === 'endTime') {
        const timeUnit = name?.split('.')[4] as 'seconds' | 'nanos';
        const fieldValue = (value.words?.[sentenceIndex]?.[wordIndex]?.[
          valueType
        ]?.[timeUnit] || 0) as string | number;
        if (
          !timeUnit ||
          (!fieldValue && fieldValue !== 0 && fieldValue !== '0')
        ) {
          return;
        }

        newWords[sentenceIndex][wordIndex][valueType]![timeUnit] =
          timeUnit === 'nanos'
            ? convertMsToNanos(fieldValue as number)
            : (fieldValue as number);
      }

      setWords(newWords);
    });
    return () => subscription.unsubscribe();
  }, [watch, setWords, words]);

  if (!words.length) {
    return null;
  }

  return (
    <form onSubmit={onSubmit}>
      {words.map((sentence, i) => (
        <div
          key={`form-words-group-${i}`}
          className="flex flex-wrap gap-4 mb-16 last:mb-0"
        >
          {sentence.map((word, j) => (
            <div key={`form-words-group-${i}-${j}`} className="flex-1 group">
              <div className="relative group">
                {j === 0 && (
                  <AddButton
                    className="absolute w-6 h-6 rounded-full top-1/2 -translate-y-1/2 translate-x-1 right-full hover:bg-slate-600 transition-colors"
                    sentenceIndex={i}
                    wordIndex={j}
                    position="before"
                    words={words}
                    setWords={setWords}
                    formKey={formKey}
                    setFormKey={setFormKey}
                  />
                )}
                <input
                  type="text"
                  defaultValue={word.word || ''}
                  className="w-full rounded-md bg-slate-800 px-3 py-1 border-2 border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                  {...register(`words.${i}.${j}.word`)}
                />
                <RemoveButton
                  className="absolute w-6 h-6 rounded-full top-1/2 -translate-y-1/2 right-1 hover:bg-slate-600 hover:text-red-200 transition-colors transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                  sentenceIndex={i}
                  wordIndex={j}
                  words={words}
                  setWords={setWords}
                  formKey={formKey}
                  setFormKey={setFormKey}
                />
                <AddButton
                  className="absolute z-10 w-6 h-6 rounded-full top-1/2 -translate-y-1/2 left-full -translate-x-1 hover:bg-slate-600 transition-colors"
                  sentenceIndex={i}
                  wordIndex={j}
                  words={words}
                  setWords={setWords}
                  formKey={formKey}
                  setFormKey={setFormKey}
                  position="after"
                />
              </div>
              <div className="flex justify-end items-center mt-1 text-sm opacity-25 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                <div className="flex">
                  <input
                    className="rounded-md bg-transparent focus:bg-slate-800 p-1 w-8 text-right"
                    type="number"
                    min="0"
                    defaultValue={
                      typeof word.startTime?.seconds === 'string'
                        ? parseInt(word.startTime.seconds)
                        : Number(word.startTime?.seconds || 0)
                    }
                    {...register(`words.${i}.${j}.startTime.seconds`)}
                  />
                  .
                  <input
                    className="rounded-md bg-transparent focus:bg-slate-800 p-1 w-12 text-xs"
                    type="number"
                    min="0"
                    max="9999"
                    step="1000"
                    defaultValue={
                      word.startTime?.nanos
                        ? Math.floor(word.startTime.nanos / 100000)
                        : 0
                    }
                    {...register(`words.${i}.${j}.startTime.nanos`, {
                      valueAsNumber: true,
                      setValueAs: (v) => convertMsToNanos(v), // only happens pre-validation
                    })}
                  />
                </div>
                <span className="px-1">–</span>
                <div className="flex">
                  <input
                    className="rounded-md bg-transparent focus:bg-slate-800 p-1 w-8 text-right"
                    type="number"
                    min="0"
                    defaultValue={
                      typeof word.endTime?.seconds === 'string'
                        ? parseInt(word.endTime.seconds)
                        : Number(word.endTime?.seconds || 0)
                    }
                    {...register(`words.${i}.${j}.endTime.seconds`)}
                  />
                  .
                  <input
                    className="rounded-md bg-transparent focus:bg-slate-800 p-1 w-12 text-xs"
                    type="number"
                    min="0"
                    max="9999"
                    step="1000"
                    defaultValue={
                      word.endTime?.nanos
                        ? Math.floor(word.endTime.nanos / 100000)
                        : 0
                    }
                    {...register(`words.${i}.${j}.endTime.nanos`, {
                      valueAsNumber: true,
                      setValueAs: (v) => v * 100000, // only happens pre-validation
                    })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </form>
  );
}
