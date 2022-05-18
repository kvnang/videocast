import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { IoMdTrash } from 'react-icons/io';
import { TemplateDocument } from '../pages/api/templates';
import { ModalContext } from './ModalContext';
import { SnackbarContext } from './SnackbarContext';

const TemplatesListStyles = styled.div`
  ul {
    list-style: none;
    padding: 0;
    border-top: 1px solid rgba(var(--color-p-rgb), 0.15);

    li {
      width: 100%;
      border-bottom: 1px solid rgba(var(--color-p-rgb), 0.15);
      position: relative;

      &.skeleton-bg {
        height: 2rem;

        &:not(:last-of-type) {
          margin-bottom: 0.5rem;
        }
      }

      .load-template {
        width: 100%;
        padding: 0.75rem 1rem;
        text-align: left;
        transition: background-color var(--transition);
        display: flex;
        align-items: center;

        &:hover {
          background-color: rgba(var(--color-p-rgb), 0.15);
        }

        .colors {
          position: relative;
          height: 1.25rem;
          width: 1.25rem;
          min-width: 1.25rem;
          display: flex;
          margin-right: 1rem;
          overflow: hidden;
          border-radius: 50%;
          transform: rotate(45deg);

          > div {
            flex: 1;
          }
        }
      }

      .delete-template {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 50%;
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        padding: 0.25rem;
        color: var(--color-error);
        transition: background var(--transition);

        svg {
          width: 1.25rem;
          height: auto;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.75);
        }
      }
    }
  }
`;

export default function CurrentTemplates({
  userID,
  setLoadedStyles,
}: {
  userID: string | null | undefined;
  setLoadedStyles: Function;
}) {
  const { setModal } = useContext(ModalContext);
  const { addSnackbar } = useContext(SnackbarContext);
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
    addSnackbar(`Template is successfully loaded.`, 'success');
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
      addSnackbar(`${template.name} template has been deleted.`, 'success');
      await fetchTemplates();
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-4">New Template</h2>{' '}
      <TemplatesListStyles className="flex-1">
        <ul>
          {(templates &&
            templates.map((template) => (
              <li key={template._id}>
                <button
                  type="button"
                  className="load-template"
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
                  className="delete-template"
                  onClick={() => deleteTemplate(template)}
                >
                  <IoMdTrash title="Delete template" />
                </button>
              </li>
            ))) ||
            [...Array(4)].map((_, i) => (
              <li key={`template-skel-${i}`} className="skeleton-bg" />
            ))}
        </ul>
      </TemplatesListStyles>
    </>
  );
}
