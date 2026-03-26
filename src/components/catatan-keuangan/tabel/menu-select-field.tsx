import { Button } from '@/components/selia/button';
import { Menu, MenuPopup, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@/components/selia/menu';
import { ChevronDown } from 'lucide-react';

type MenuSelectFieldProps<T extends string> = {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

export function MenuSelectField<T extends string>({ value, options, onChange }: MenuSelectFieldProps<T>) {
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button variant='plain' className='w-full h-8 rounded px-2 text-left text-sm inline-flex items-center justify-between bg-accent/45 text-foreground hover:bg-accent'>
            {value}
            <ChevronDown className='size-3.5 text-muted' />
          </Button>
        }
      />
      <MenuPopup size='compact' align='start'>
        <MenuRadioGroup value={value} onValueChange={(next) => onChange(next as T)}>
          {options.map((option) => (
            <MenuRadioItem key={option} value={option} className={'text-sm'}>
              {option}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  );
}
