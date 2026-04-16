import type {
  ChangeEvent,
  KeyboardEvent,
  RefObject,
} from 'react';
import type {
  ChatSessionSummary,
  TransaksiPreviewGroup,
} from '#/features/chatbot/chatbot.schema';
import type { ChatComposerPayload } from './composer';
import type { RenderedChatMessage } from './messages';

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
  isConfirmingPreview: boolean;
  onConfirmPreview: () => void;
  onDismissPreview: () => void;
};

export type ChatComposerViewModel = {
  draft: string;
  attachmentName: string;
  isLoading: boolean;
  isDisabled: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onDraftChange: (value: string) => void;
  onComposerKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onAttachmentSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onAttachmentClick: () => void;
  onSend: () => void;
};

export type ChatComposerSectionViewModel = {
  isLoading: boolean;
  isDisabled: boolean;
  resetVersion: number;
  onSubmit: (payload: ChatComposerPayload) => Promise<void>;
};
