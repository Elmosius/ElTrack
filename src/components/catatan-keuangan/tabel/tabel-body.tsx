import { TableBody, TableCell, TableRow } from '#/components/selia/table';
import { useTransactionTableBody } from '#/hooks/transaction-table/use-transaction-table';
import { TabelBodyRow } from './tabel-body-row';

export default function TabelBody() {
  const {
    filteredRows,
    waktuOptions,
    metodePembayaranOptions,
    tipeOptions,
    waktuMap,
    metodePembayaranMap,
    tipeMap,
    updateRow,
    handleNominalChange,
    handleDeleteRow,
    saveRow,
  } = useTransactionTableBody();

  return (
    <TableBody>
      {filteredRows.map((row) => (
        <TabelBodyRow
          key={row.id}
          row={row}
          waktuOptions={waktuOptions}
          metodePembayaranOptions={metodePembayaranOptions}
          tipeOptions={tipeOptions}
          waktuLabel={waktuMap.get(row.waktuId)}
          metodePembayaranLabel={metodePembayaranMap.get(row.metodePembayaranId)}
          tipeLabel={tipeMap.get(row.tipeId)}
          updateRow={updateRow}
          handleNominalChange={handleNominalChange}
          handleDeleteRow={handleDeleteRow}
          saveRow={saveRow}
        />
      ))}

      {filteredRows.length === 0 && (
        <TableRow>
          <TableCell colSpan={8} className='w-full text-center text-sm text-dimmed'>
            Belum ada transaksi untuk tanggal ini.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
