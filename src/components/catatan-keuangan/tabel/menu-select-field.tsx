import { Button } from '@/components/selia/button';
import { Menu, MenuPopup, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@/components/selia/menu';
import type { SelectOption } from '#/types/transaction-table';
import { ChevronDown } from 'lucide-react';

type MenuSelectFieldProps = {
  value: string;
  options: readonly SelectOption[];
  displayValue?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function MenuSelectField({ value, options, displayValue, placeholder = 'Pilih opsi', onChange }: MenuSelectFieldProps) {
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button variant='plain' className='w-full h-8 rounded px-2 text-left text-sm inline-flex items-center justify-between bg-accent/45 text-foreground hover:bg-accent'>
            {displayValue || placeholder}
            <ChevronDown className='size-3.5 text-muted' />
          </Button>
        }
      />
      <MenuPopup size='compact' align='start'>
        <MenuRadioGroup value={value} onValueChange={(next) => onChange(next)}>
          {options.map((option) => (
            <MenuRadioItem key={option.id} value={option.id} className={'text-sm'}>
              {option.name}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  );
}
