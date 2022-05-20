import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { TemplateDocument } from '../pages/api/templates';
import { StylesProps } from '../types';
import Button from './Button';
import { InputField } from './forms/FormFields';
import { ModalContext } from './ModalContext';

export default function SaveTemplate({
  userID,
  styles,
}: {
  userID: string | null | undefined;
  styles: StylesProps;
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<{ templateName: string }>();

  const { setModal } = useContext(ModalContext);

  const onSubmit = handleSubmit(async (data) => {
    // Check if name is duplicate
    const getResponse = await fetch(`/api/templates?userID=${userID}`, {
      method: 'GET',
    });
    const templates = await getResponse.json();
    const isDuplicate = templates.find(
      (template: TemplateDocument) => template.name === data.templateName
    );

    if (isDuplicate) {
      setError('templateName', {
        type: 'duplicateName',
        message: 'Please choose a unique template name',
      });

      return;
    }

    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.templateName,
        userID,
        styles,
        trashed: false,
      }),
    });
    const resJSON = await res.json();
    if (resJSON.acknowledged && resJSON.insertedId) {
      toast.success(`${data.templateName} template is successfully added.`);
      setModal({
        modalOpen: false,
      });
    } else {
      toast.error('Template cannot be added');
    }
  });

  return (
    <>
      <h2 className="text-xl font-bold mb-4">New Template</h2>
      <form action="/" onSubmit={onSubmit}>
        <div className="mb-4">
          <InputField
            register={register}
            name="templateName"
            label="Unique Template Name"
            type="text"
            id="templateName"
            placeholder="Project Mercury 82"
            options={{
              required: true,
            }}
            aria-invalid={!!errors?.templateName}
          />
          {errors.templateName && (
            <p className="mt-2 text-sm text-red-500">
              {errors.templateName.message}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save Template</Button>
        </div>
      </form>
    </>
  );
}
