import { Banknote, Home } from 'lucide-react';

export const MENU_SIDEBAR = [
  {
    label: 'Home',
    icon: <Home className='size-4' />,
    to: '/'
  },
  {
    label: 'Catatan Keuangan',
    icon: <Banknote className='size-4' />,
    to: '/catatan-keuangan'
  }
];

