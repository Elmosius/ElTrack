import { useState } from 'react';
import { Button } from '#/components/selia/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from '#/components/selia/dialog';
import { Input } from '#/components/selia/input';
import { Textarea } from '#/components/selia/textarea';
import type { KantongSummaryItem } from '#/types/kantong';
import { ArrowRightLeft } from 'lucide-react';
import { formatMoneyInput } from './kantong-page.helpers';
import { useKantongTransferForm } from './use-kantong-transfer-form';
import { waktuOptionsStatic } from '#/lib/transaction-table/format';

type KantongTransferDialogProps = {
  items: KantongSummaryItem[];
};

export function KantongTransferDialog({ items }: KantongTransferDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    sourceKantongId,
    setSourceKantongId,
    destKantongId,
    setDestKantongId,
    nominal,
    setNominal,
    tanggal,
    setTanggal,
    waktu,
    setWaktu,
    catatan,
    setCatatan,
    isSaving,
    resetForm,
    handleSubmit,
  } = useKantongTransferForm(items, () => setIsOpen(false));

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Tunggu animasi close selesai sebelum reset form
      setTimeout(() => {
        resetForm();
      }, 300);
    }
  };

  const isDisabled = items.length < 2;

  if (isDisabled) {
    return (
      <Button disabled variant="outline" className="w-full sm:w-auto">
        <ArrowRightLeft className="mr-2 size-4" />
        Transfer Antar Kantong
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" className="w-full sm:w-auto text-sm" />}>
        <ArrowRightLeft className="size-3.5" />
        Transfer Antar Kantong
      </DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Transfer Antar Kantong</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <DialogDescription className={'text-sm'}>
              Pindahkan saldo dari satu Kantong ke Kantong lain. Transfer ini tidak mempengaruhi total asetmu.
            </DialogDescription>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Dari Kantong</span>
                <select
                  className="h-10 w-full rounded-md border border-input-border bg-input px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  value={sourceKantongId}
                  onChange={(e) => setSourceKantongId(e.target.value)}
                  disabled={isSaving}
                >
                  {items.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.nama} (Rp {item.currentBalance.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </label>
              
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Ke Kantong</span>
                <select
                  className="h-10 w-full rounded-md border border-input-border bg-input px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  value={destKantongId}
                  onChange={(e) => setDestKantongId(e.target.value)}
                  disabled={isSaving}
                >
                  {items.map((item) => (
                    <option key={item._id} value={item._id} disabled={item._id === sourceKantongId}>
                      {item.nama} {item._id === sourceKantongId && '(Kantong Asal)'}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Nominal</span>
              <Input
                inputMode="numeric"
                placeholder="Rp 0"
                value={formatMoneyInput(nominal)}
                onChange={(e) => setNominal(e.target.value)}
                disabled={isSaving}
                className={'text-sm'}
                required
              />
              {(() => {
                const sourceKantong = items.find(k => k._id === sourceKantongId);
                const parsedNominal = parseInt(nominal.replace(/\D/g, ''), 10) || 0;
                if (sourceKantong && parsedNominal > sourceKantong.currentBalance) {
                  return <p className="text-xs text-red-500 mt-1">Nominal melebihi saldo kantong asal.</p>;
                }
                return null;
              })()}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Tanggal</span>
                <Input
                  type="date"
                  className={'text-sm'}
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Waktu</span>
                <select
                  className="h-10 w-full rounded-md border border-input-border bg-input px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  value={waktu}
                  onChange={(e) => setWaktu(e.target.value)}
                  disabled={isSaving}
                  required
                >
                  {waktuOptionsStatic.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">Catatan (Opsional)</span>
              <Textarea
                placeholder="Misal: Pindah dana darurat"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                disabled={isSaving}
                rows={2}
                className="min-h-0 text-sm"
              />
            </label>
          </DialogBody>
          <DialogFooter>
            <DialogClose className={'text-sm'} disabled={isSaving}>Batal</DialogClose>
            <Button 
              className={'text-sm ring-0'} 
              type="submit" 
              disabled={
                isSaving || 
                sourceKantongId === destKantongId || 
                (parseInt(nominal.replace(/\D/g, ''), 10) || 0) > (items.find(k => k._id === sourceKantongId)?.currentBalance || 0)
              } 
              progress={isSaving}
            >
              Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
