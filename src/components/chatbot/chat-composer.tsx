import type { ChatComposerViewModel } from '#/lib/chatbot/view-models';
import { ArrowUp, CornerDownLeft, ImagePlus } from 'lucide-react';
import { Button } from '../selia/button';
import { Textarea } from '../selia/textarea';

type ChatComposerProps = {
  composer: ChatComposerViewModel;
};

export function ChatComposer({ composer }: ChatComposerProps) {
  const {
    draft,
    attachmentName,
    quickPrompts,
    isLoading,
    isDisabled,
    textareaRef,
    fileInputRef,
    onDraftChange,
    onComposerKeyDown,
    onAttachmentSelect,
    onAttachmentClick,
    onQuickPrompt,
    onSend,
  } = composer;
  const shouldShowQuickPrompts = !draft && !attachmentName && quickPrompts.length > 0;

  return (
    <div className='w-full border-t border-popover-separator px-3.5 py-3'>
      {shouldShowQuickPrompts ? (
        <div className='-mx-1 mb-1.5 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          <div className='flex w-max gap-1.5'>
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt}
                type='button'
                size='xs'
                variant='outline'
                className='shrink-0 rounded-full text-xs shadow-none'
                disabled={isLoading || isDisabled}
                onClick={() => onQuickPrompt(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
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
          <p className='mt-2 truncate text-xs text-muted'>
            Foto dipilih: {attachmentName}
          </p>
        ) : null}
        <div className='mt-2 flex items-center justify-between'>
          <p className='inline-flex items-center gap-1 text-xs text-muted'>
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
