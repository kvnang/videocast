import React from 'react';

export default function Title() {
  return (
    <div className="container mx-auto">
      <div className="flex justify-center mb-6">
        <span className="inline-block bg-amber-100 px-2 py-1 rounded-md shadow-sm shadow-amber-300 uppercase font-bold text-xs text-slate-800">
          Beta
        </span>
      </div>
      <div className="flex justify-center mb-12">
        <h1 className="font-display text-4xl font-bold text-white text-center">
          Podcast Video Generator
        </h1>
      </div>
    </div>
  );
}
