import { ArrowUp, CornerDownLeft, ImagePlus } from 'lucide-react';
import { Button } from '../selia/button';
import { Textarea } from '../selia/textarea';

type ChatComposerProps = {
  draft: string;
  attachmentName: string;
  isLoading: boolean;
  isDisabled?: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDraftChange: (value: string) => void;
  onComposerKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onAttachmentSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAttachmentClick: () => void;
  onSend: () => void;
};

export function ChatComposer({
  draft,
  attachmentName,
  isLoading,
  isDisabled,
  textareaRef,
  fileInputRef,
  onDraftChange,
  onComposerKeyDown,
  onAttachmentSelect,
  onAttachmentClick,
  onSend,
}: ChatComposerProps) {
  return (
    <div className='w-full border-t border-popover-separator px-3.5 py-3'>
      <div className='rounded-xl border border-input-border/80 bg-input/50 px-2.5 py-2 transition-[border-color,box-shadow] focus-within:border-primary/65 focus-within:shadow-sm'>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          disabled={isDisabled}
          aria-label='Upload foto chatbot'
          title='Upload foto chatbot'
          onChange={onAttachmentSelect}
        />
        <Textarea
          ref={textareaRef}
          value={draft}
          variant='notion'
          rows={1}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onComposerKeyDown}
          disabled={isDisabled}
          placeholder='Tanya apa saja...'
          className='min-h-0 max-h-36 resize-none overflow-y-auto pl-1 pr-0 py-0 text-xs leading-5 placeholder:text-dimmed '
        />
        {attachmentName ? (
          <p className='mt-2 truncate text-[10px] text-muted'>
            Foto dipilih: {attachmentName}
          </p>
        ) : null}
        <div className='mt-2 flex items-center justify-between'>
          <p className='inline-flex items-center gap-1 text-[10px] text-muted'>
            <CornerDownLeft className='size-3' />
            Enter kirim, Shift+Enter baris baru
          </p>
          <div className='flex items-center gap-1.5'>
            <Button
              size='xs-icon'
              variant='plain'
              className='ring-0 size-7 rounded-lg text-muted hover:text-foreground'
              onClick={onAttachmentClick}
              disabled={isDisabled}
              aria-label='Upload foto'
            >
              <ImagePlus className='size-3.5' />
            </Button>
            <Button
              size='xs-icon'
              variant='primary'
              className='ring-0 text-accent/80 size-7 rounded-lg'
              onClick={onSend}
              disabled={isLoading || isDisabled}
            >
              <ArrowUp className='size-3.5' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
