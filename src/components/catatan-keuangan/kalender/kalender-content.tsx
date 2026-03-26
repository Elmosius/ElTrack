import { kalenderDayPickerClassNames, kalenderTexts } from '#/const/kalender';
import { useKalenderContent } from '#/hooks/use-kalender';
import { DayPicker } from 'react-day-picker';
import { CalendarDayButton } from './calendar-day-button';
import KalenderDailyDialog from './kalender-daily-dialog';

export default function KalenderContent() {
  const { selectedDay, daysWithTransactions, handleDayClick } = useKalenderContent();

  return (
    <>
      <div className='w-full p-4 md:p-5'>
        <div className='mb-4 space-y-1'>
          <p className='text-sm font-medium'>{kalenderTexts.title}</p>
          <p className='text-xs text-dimmed'>{kalenderTexts.subtitle}</p>
        </div>

        <div className='w-full overflow-x-auto'>
          <DayPicker
            mode='single'
            selected={selectedDay}
            onDayClick={handleDayClick}
            modifiers={{ hasTransactions: daysWithTransactions }}
            showOutsideDays
            fixedWeeks
            components={{
              DayButton: CalendarDayButton,
            }}
            classNames={kalenderDayPickerClassNames}
          />
        </div>
      </div>

      <KalenderDailyDialog />
    </>
  );
}
