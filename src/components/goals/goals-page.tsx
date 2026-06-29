import { Button } from '#/components/selia/button';
import { Card, CardBody } from '#/components/selia/card';
import {
  Dialog,
  DialogPopup,
  DialogTrigger,
} from '#/components/selia/dialog';
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const hasKantongs = data.kantongs.length > 0;
  const hasGoals = data.goals.length > 0;

  if (!data.isKantongConfigured || !hasKantongs) {
    return (
      <Card>
        <CardBody className='flex flex-col items-start gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-6'>
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

      <div className='md:hidden'>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger render={<Button className='w-full text-sm' />}>
            <Plus className='size-4' />
            Tambah Goal
          </DialogTrigger>
          <DialogPopup className='!bottom-0 !left-0 !right-0 !top-auto !w-full !max-w-none !translate-x-0 !translate-y-0 !rounded-b-none !rounded-t-2xl'>
            <GoalForm
              key={isCreateDialogOpen ? 'create-goal-open' : 'create-goal-closed'}
              kantongs={data.kantongs}
              mediaSuggestions={data.mediaSuggestions}
              onSuccess={() => setIsCreateDialogOpen(false)}
              variant='dialog'
            />
          </DialogPopup>
        </Dialog>
      </div>

      <div className='hidden md:block'>
        <GoalForm
          kantongs={data.kantongs}
          mediaSuggestions={data.mediaSuggestions}
        />
      </div>

      {editingGoal && (
        <>
          <div className='md:hidden'>
            <Dialog
              open={Boolean(editingGoal)}
              onOpenChange={(open) => {
                if (!open) {
                  setEditingGoal(null);
                }
              }}
            >
              <DialogPopup className='!bottom-0 !left-0 !right-0 !top-auto !w-full !max-w-none !translate-x-0 !translate-y-0 !rounded-b-none !rounded-t-2xl'>
                <GoalForm
                  key={editingGoal._id}
                  initialGoal={editingGoal}
                  kantongs={data.kantongs}
                  mediaSuggestions={data.mediaSuggestions}
                  onCancel={() => setEditingGoal(null)}
                  variant='dialog'
                />
              </DialogPopup>
            </Dialog>
          </div>

          <div className='hidden md:block'>
            <GoalForm
              key={editingGoal._id}
              initialGoal={editingGoal}
              kantongs={data.kantongs}
              mediaSuggestions={data.mediaSuggestions}
              onCancel={() => setEditingGoal(null)}
            />
          </div>
        </>
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
          <CardBody className='flex flex-col items-center gap-3 p-6 text-center md:p-8'>
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
