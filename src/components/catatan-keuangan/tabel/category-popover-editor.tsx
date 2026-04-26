import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Check, Plus, X } from 'lucide-react';

type CategoryPopoverEditorProps = {
  mode: 'idle' | 'add' | 'edit';
  draft: string;
  error: string | null;
  onAdd: () => void;
  onDraftChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
};

export function CategoryPopoverEditor({
  mode,
  draft,
  error,
  onAdd,
  onDraftChange,
  onCancel,
  onSave,
}: CategoryPopoverEditorProps) {
  if (mode === 'idle') {
    return (
      <Button size='xs' variant='plain' className='w-full text-sm' onClick={onAdd}>
        <Plus className='size-3.5' />
        Tambah kategori
      </Button>
    );
  }

  return (
    <div className='space-y-2 w-full'>
      <p className='text-xs text-muted'>{mode === 'add' ? 'Tambah kategori baru' : 'Edit nama kategori'}</p>
      <Input value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder='Nama kategori' className='h-8 text-sm px-2.5' />
      {error ? <p className='text-[11px] text-danger'>{error}</p> : null}
      <div className='flex items-center justify-end gap-1.5'>
        <Button size='xs' variant='plain' className='text-sm' onClick={onCancel}>
          <X className='size-3.5' />
          Batal
        </Button>
        <Button size='xs' variant='secondary' className='text-sm' onClick={() => void onSave()}>
          <Check className='size-3.5' />
          Simpan
        </Button>
      </div>
    </div>
  );
}
