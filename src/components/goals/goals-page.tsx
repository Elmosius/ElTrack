import { Button } from '#/components/selia/button';
import { Card, CardBody } from '#/components/selia/card';
import type { GoalViewItem, GoalsPageData } from '#/types/goals';
import { Link } from '@tanstack/react-router';
import { PiggyBank, Plus } from 'lucide-react';
import { useState } from 'react';
import { GoalCard } from './goal-card';
import { GoalForm } from './goal-form';
import { GoalSummaryCards } from './goal-summary-cards';

type GoalsPageProps = {
  data: GoalsPageData;
};

export function GoalsPage({ data }: GoalsPageProps) {
  const [editingGoal, setEditingGoal] = useState<GoalViewItem | null>(null);
  const hasKantongs = data.kantongs.length > 0;
  const hasGoals = data.goals.length > 0;

  if (!data.isKantongConfigured || !hasKantongs) {
    return (
      <Card>
        <CardBody className='flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <PiggyBank className='size-5 text-primary' />
              <h2 className='text-base font-semibold'>Buat Kantong dulu</h2>
            </div>
            <p className='max-w-2xl text-sm text-muted'>
              Goals membaca progress dari saldo Kantong. Buat Kantong seperti
              Reksadana, Dana Darurat, atau Tabungan Bank sebelum menambahkan
              goal.
            </p>
          </div>
          <Link to='/kantong'>
            <Button className='text-sm'>
              <Plus className='size-4' />
              Buka Kantong
            </Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <GoalSummaryCards summary={data.summary} />

      <GoalForm
        kantongs={data.kantongs}
        mediaSuggestions={data.mediaSuggestions}
      />

      {editingGoal && (
        <GoalForm
          key={editingGoal._id}
          initialGoal={editingGoal}
          kantongs={data.kantongs}
          mediaSuggestions={data.mediaSuggestions}
          onCancel={() => setEditingGoal(null)}
        />
      )}

      {hasGoals ? (
        <div className='grid gap-4 xl:grid-cols-2'>
          {data.goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={setEditingGoal}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className='flex flex-col items-center gap-3 p-8 text-center'>
            <PiggyBank className='size-8 text-primary' />
            <div className='space-y-1'>
              <h2 className='text-base font-semibold'>Belum ada goal</h2>
              <p className='max-w-md text-sm text-muted'>
                Tambahkan target pertama dan hubungkan ke Kantong yang sesuai.
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
