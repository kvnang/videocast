import * as React from 'react';
import Button from './Button';
import { ModalContext } from './ModalContext';

export default function DemoModal() {
  const { setModal } = React.useContext(ModalContext);

  return (
    <div className="bg-slate-900 p-6 rounded-md w-[600px] max-w-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">👋 Welcome!</h2>
        <p className="mb-4">
          You're viewing this application as a{' '}
          <strong className="text-shadow">guest</strong>, so you may not be able
          to <strong className="text-shadow">save your project</strong> or{' '}
          <strong className="text-shadow">view the previous ones.</strong>
        </p>
        <p className="mb-4">
          You can also use the{' '}
          <strong className="text-shadow">demo audio</strong> instead of
          scrambling for one 😎 !
        </p>
      </div>
      <div className="flex justify-end gap-4">
        <Button href="/api/auth/login" buttonStyle="secondary">
          Oops, let me log in
        </Button>
        <Button type="button" onClick={() => setModal({ modalOpen: false })}>
          I'm cool!
        </Button>
      </div>
    </div>
  );
}
