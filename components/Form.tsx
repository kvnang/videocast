import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { WordProps } from '../types';

function AddButton({
  className = '',
  sentenceIndex,
  wordIndex,
  position = 'after',
  words,
  setWords,
  formKey,
  setFormKey,
}) {
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
}) {
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
  words: WordProps;
  setWords: (v: WordProps | null) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => console.log(data);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!name || !words) {
        return;
      }

      const sentenceIndex = name?.split('-')[1]
        ? parseInt(name?.split('-')[1])
        : null;
      const wordIndex = name?.split('-')[2]
        ? parseInt(name?.split('-')[2])
        : null;
      const valueType = name?.split('-')[3] || null;

      if (sentenceIndex === null || wordIndex === null) {
        return;
      }

      const newWords = [...words];
      console.log('Copied', words);

      if (valueType === 'word') {
        newWords[sentenceIndex][wordIndex].word = value[name];
      } else if (valueType === 'startTime' || valueType === 'endTime') {
        const timeUnit = name?.split('-')[4] || null;
        if (!timeUnit || (!value[name] && value[name] !== 0)) {
          return;
        }
        if (timeUnit === 'seconds') {
          console.log(newWords[sentenceIndex][wordIndex].word);
          newWords[sentenceIndex][wordIndex][valueType].seconds =
            value[name].toString();
        } else if (timeUnit === 'milliseconds') {
          newWords[sentenceIndex][wordIndex][valueType].nanos = Math.floor(
            parseFloat(`0.${value[name].toString()}`) * 10000 * 100000
          );
        }
      }
      console.log(newWords);
      setWords(newWords);
    });
    return () => subscription.unsubscribe();
  }, [watch, setWords, words]);

  if (!words.length) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {words.map((sentence, i) => (
        <div
          key={`form-words-group-${i}`}
          className="flex flex-wrap gap-4 mb-4 last:mb-0"
        >
          {sentence.map((word, j) => (
            <div key={`form-words-group-${i}-${j}`} className="flex-1 group">
              <div className="relative">
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
                  {...register(`word-${i}-${j}-word`)}
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
              <div className="flex justify-end items-center mt-1 text-sm">
                <div className="flex">
                  <input
                    className="rounded-md bg-transparent focus:bg-slate-800 p-1 w-8 text-right"
                    type="number"
                    min="0"
                    defaultValue={parseInt(word.startTime.seconds)}
                    {...register(`word-${i}-${j}-startTime-seconds`)}
                  />
                  .
                  <input
                    className="rounded-md bg-transparent focus:bg-slate-800 p-1 w-12 text-xs"
                    type="number"
                    min="0"
                    max="9999"
                    step="1000"
                    defaultValue={Math.floor(word.startTime.nanos / 100000)}
                    {...register(`word-${i}-${j}-startTime-milliseconds`)}
                  />
                </div>
                <span className="px-1">–</span>
                <div className="flex">
                  <input
                    className="rounded-md bg-transparent focus:bg-slate-800 p-1 w-8 text-right"
                    type="number"
                    min="0"
                    defaultValue={parseInt(word.endTime.seconds)}
                    {...register(`word-${i}-${j}-endTime-seconds`)}
                  />
                  .
                  <input
                    className="rounded-md bg-transparent focus:bg-slate-800 p-1 w-12 text-xs"
                    type="number"
                    min="0"
                    max="9999"
                    step="1000"
                    defaultValue={Math.floor(word.endTime.nanos / 100000)}
                    {...register(`word-${i}-${j}-endTime-milliseconds`)}
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
