import { formatRupiah } from '#/lib/transaction-table';
import type { ChatbotPreviewOption } from '#/types/chatbot';
import type React from 'react';
import { Input } from '../selia/input';
import { Textarea } from '../selia/textarea';

type PreviewInputFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  type?: React.HTMLInputTypeAttribute;
  onChange: (value: string) => void;
  onBlur: () => void;
};

type PreviewTextareaFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

type PreviewSelectFieldProps = {
  label: string;
  value: string;
  currentLabel: string | null;
  options: ChatbotPreviewOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string | null) => void;
};

function withCurrentOption(
  options: ChatbotPreviewOption[],
  value: string,
  currentLabel: string | null,
) {
  if (!value || !currentLabel || options.some((option) => option.id === value)) {
    return options;
  }

  return [{ id: value, name: currentLabel }, ...options];
}

export function formatPreviewNominalInput(value: string) {
  return formatRupiah(value);
}

export function PreviewInputField({
  label,
  value,
  placeholder,
  inputMode,
  type = 'text',
  onChange,
  onBlur,
}: PreviewInputFieldProps) {
  return (
    <label className='space-y-1 text-xs'>
      <span className='text-muted'>{label}</span>
      <Input
        className='h-8 px-2 text-xs'
        inputMode={inputMode}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    </label>
  );
}

export function PreviewTextareaField({
  label,
  value,
  placeholder,
  onChange,
  onBlur,
}: PreviewTextareaFieldProps) {
  return (
    <label className='space-y-1 text-xs'>
      <span className='text-muted'>{label}</span>
      <Textarea
        className='min-h-16 px-2 py-2 text-xs'
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    </label>
  );
}

export function PreviewSelectField({
  label,
  value,
  currentLabel,
  options,
  placeholder,
  disabled,
  onChange,
}: PreviewSelectFieldProps) {
  const visibleOptions = withCurrentOption(options, value, currentLabel);

  return (
    <label className='space-y-1 text-xs'>
      <span className='text-muted'>{label}</span>
      <select
        className='h-8 w-full rounded border border-secondary-border bg-input px-2 text-xs text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary disabled:cursor-not-allowed disabled:opacity-70'
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value=''>{placeholder}</option>
        {visibleOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
