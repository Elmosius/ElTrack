import type {
  ChangeEvent,
  KeyboardEvent,
  RefObject,
} from 'react';
import type { ChatComposerPayload } from './composer';
import type { RenderedChatMessage } from './messages';
import type {
  ChatbotPreviewEditOptions,
  ChatSessionSummary,
  TransaksiPreviewItemPatch,
  TransaksiPreviewGroup,
} from '#/types/chatbot';

export type ChatPanelHeaderViewModel = {
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  isLoading: boolean;
  onClearChat: () => void;
  onSelectSession: (chatSessionId: string) => void;
};

export type ChatMessageListViewModel = {
  messages: RenderedChatMessage[];
  isLoading: boolean;
  preview: TransaksiPreviewGroup | null;
  previewOptions: ChatbotPreviewEditOptions | null;
  isConfirmingPreview: boolean;
  isPatchingPreview: boolean;
  onConfirmPreview: () => void;
  onDismissPreview: () => void;
  onPatchPreviewItem: (
    itemIndex: number,
    patch: TransaksiPreviewItemPatch,
  ) => Promise<boolean>;
};

export type ChatComposerViewModel = {
  draft: string;
  attachmentName: string;
  quickPrompts: readonly string[];
  isLoading: boolean;
  isDisabled: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onDraftChange: (value: string) => void;
  onComposerKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onAttachmentSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onAttachmentClick: () => void;
  onQuickPrompt: (prompt: string) => void;
  onSend: () => void;
};

export type ChatComposerSectionViewModel = {
  isLoading: boolean;
  isDisabled: boolean;
  resetVersion: number;
  onSubmit: (payload: ChatComposerPayload) => Promise<void>;
};
