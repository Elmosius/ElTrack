import { AlertDialog, AlertDialogBody, AlertDialogClose, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogPopup, AlertDialogTitle } from '#/components/selia/alert-dialog';
import { Button } from '#/components/selia/button';
import { useTransactionTableDeleteDialog } from '#/hooks/transaction-table/use-transaction-table';

export default function TabelAlert() {
  const { isDeleteDialogOpen, selectedCategory, setIsDeleteDialogOpen, clearDeleteTarget, confirmDeleteCategory } = useTransactionTableDeleteDialog();

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription className={'text-sm'}>
            Kategori <strong>{selectedCategory?.name || '-'}</strong> akan dihapus permanen dari daftar kategori.
          </AlertDialogDescription>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogClose
            render={
              <Button variant='plain' size='sm' className={'text-sm'}>
                Batal
              </Button>
            }
            onClick={clearDeleteTarget}
          />
          <Button variant='danger' size='sm' className={'text-sm'} onClick={() => void confirmDeleteCategory()}>
            Hapus
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
