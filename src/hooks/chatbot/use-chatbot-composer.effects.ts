import { useEffect, type MutableRefObject } from 'react';

export function useChatbotComposerAutoResize(
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>,
  draft: string,
) {
  useEffect(() => {
    const node = textareaRef.current;

    if (!node) {
      return;
    }

    node.style.height = '0px';
    node.style.height = `${Math.min(node.scrollHeight, 144)}px`;
  }, [draft, textareaRef]);
}

export function useChatbotComposerReset(
  resetComposer: () => void,
  resetVersion: number,
) {
  useEffect(() => {
    resetComposer();
  }, [resetComposer, resetVersion]);
}
