import { Banknote, Home, Target, WalletCards } from 'lucide-react';

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
  },
  {
    label: 'Kantong',
    icon: <WalletCards className='size-4' />,
    to: '/kantong'
  },
  {
    label: 'Goals',
    icon: <Target className='size-4' />,
    to: '/goals'
  }
];
