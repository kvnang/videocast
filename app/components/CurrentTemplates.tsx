import React, { useContext, useEffect, useState } from 'react';
import { IoMdTrash } from 'react-icons/io';
import toast from 'react-hot-toast';
import { TemplateDocument } from '../pages/api/templates';
import { ModalContext } from './ModalContext';

export default function CurrentTemplates({
  userID,
  setLoadedStyles,
}: {
  userID: string | null | undefined;
  setLoadedStyles: Function;
}) {
  const { setModal } = useContext(ModalContext);
  const [templates, setTemplates] = useState<TemplateDocument[] | null>(null);

  async function fetchTemplates() {
    const res = await fetch(`/api/templates?userID=${userID}`, {
      method: 'GET',
    });
    const json = await res.json();
    setTemplates(json);
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  function loadTemplate(template: TemplateDocument) {
    const { styles } = template;
    if (styles) {
      setLoadedStyles({ ...styles });
    }
    setModal({ modalOpen: false });
    toast.success(`Template is successfully loaded.`);
  }

  async function deleteTemplate(template: TemplateDocument) {
    const deleteRes = await fetch(`/api/templates`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
    const deleteResJSON = await deleteRes.json();
    if (deleteResJSON.acknowledged && deleteResJSON.modifiedCount) {
      toast.success(`${template.name} template has been deleted.`);
      await fetchTemplates();
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-4">New Template</h2>{' '}
      <div className="flex-1">
        <ul>
          {(templates &&
            templates?.map((template) => (
              <li
                key={template._id}
                className="w-full border-b-2 border-slate-800 relative first:border-t-2"
              >
                <button
                  type="button"
                  className="w-full py-2 px-3 flex items-center text-left hover:bg-slate-800 transition-colors"
                  onClick={() => loadTemplate(template)}
                >
                  <div className="colors">
                    <div
                      style={{
                        background: template.styles.textColor || 'transparent',
                      }}
                    />
                    <div
                      style={{
                        background:
                          template.styles.accentColor || 'transparent',
                      }}
                    />
                  </div>
                  <span>{template.name}</span>
                </button>
                <button
                  type="button"
                  className="w-8 h-8 p-2 absolute right-2 top-1/2 -translate-y-[50%] rounded-full transition-colors text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => deleteTemplate(template)}
                >
                  <IoMdTrash
                    className="w-full h-full"
                    title="Delete template"
                  />
                </button>
              </li>
            ))) ||
            [...Array(4)].map((_, i) => (
              <li
                key={`template-skel-${i}`}
                className="skeleton w-full border-b-2 border-transparent relative rounded-md first:border-t-2 h-8 mb-2 last:mb-0"
              />
            ))}
        </ul>
      </div>
    </>
  );
}
