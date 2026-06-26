import { Button } from '#/components/selia/button';
import { Card, CardBody, CardHeader, CardTitle } from '#/components/selia/card';
import type { LanggananReminderItem } from '#/types/langganan';
import { Link } from '@tanstack/react-router';
import { BellRing } from 'lucide-react';
import {
  formatLanggananCurrency,
  formatLanggananDate,
  getReminderLabel,
  getReminderTone,
} from './langganan-page.helpers';

type LanggananReminderSectionProps = {
  reminders: LanggananReminderItem[];
  compact?: boolean;
};

export function LanggananReminderSection({
  reminders,
  compact = false,
}: LanggananReminderSectionProps) {
  if (reminders.length === 0) {
    return null;
  }

  const visibleReminders = compact ? reminders.slice(0, 3) : reminders;

  return (
    <Card>
      <CardHeader>
        <BellRing className='size-5 text-warning' />
        <CardTitle>{compact ? 'Reminder Langganan' : 'Perlu Dicek'}</CardTitle>
        {compact && (
          <Link to='/langganan'>
            <Button variant='outline' size='xs' className='text-xs'>
              Buka
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardBody className='space-y-3 p-4'>
        {visibleReminders.map((item) => (
          <div
            key={item._id}
            className='flex flex-col gap-2 rounded-lg border border-card-separator p-3 md:flex-row md:items-center md:justify-between'
          >
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium'>{item.nama}</p>
              <p className='text-xs text-muted'>
                {formatLanggananDate(item.nextDueDate)} · {formatLanggananCurrency(item.nominal)}
              </p>
            </div>
            <span className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${getReminderTone(item.reminderStatus)}`}>
              {getReminderLabel(item.reminderStatus, item.daysUntilDue)}
            </span>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
