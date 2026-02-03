import { useState } from 'react';

const STORAGE_KEYS = {
  ORIGIN: 'mom_app_origin',
  DEST: 'mom_app_dest',
  TEMPLATE: 'mom_app_template',
};

const DEFAULT_TEMPLATE =
  "Hi Mom! I'm taking the {train_type} {train_no} ({direction}). Arriving at {dest} at {time}. Status: {status}.";

export function usePersistence() {
  const [originId, setOriginId] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.ORIGIN) || ''
  );
  const [destId, setDestId] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.DEST) || '');
  const [template, setTemplate] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.TEMPLATE) || DEFAULT_TEMPLATE
  );

  const saveOrigin = (id: string) => {
    setOriginId(id);
    localStorage.setItem(STORAGE_KEYS.ORIGIN, id);
  };

  const saveDest = (id: string) => {
    setDestId(id);
    localStorage.setItem(STORAGE_KEYS.DEST, id);
  };

  const saveTemplate = (tpl: string) => {
    setTemplate(tpl);
    localStorage.setItem(STORAGE_KEYS.TEMPLATE, tpl);
  };

  return {
    originId,
    setOriginId: saveOrigin,
    destId,
    setDestId: saveDest,
    template,
    setTemplate: saveTemplate,
    resetTemplate: () => saveTemplate(DEFAULT_TEMPLATE),
  };
}
