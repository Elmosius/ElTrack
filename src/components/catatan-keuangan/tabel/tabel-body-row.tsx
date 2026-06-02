import type { SelectOption, TransaksiRow } from '#/types/transaction-table';
import { TableCell, TableRow } from '#/components/selia/table';
import { CategoryPopover } from './category-popover';
import { MenuSelectField } from './menu-select-field';
import {
  DeleteRowButton,
  NominalField,
  NoteField,
  TransactionNameField,
} from './tabel-body-row-fields';

type TabelBodyRowProps = {
  row: TransaksiRow;
  waktuOptions: readonly SelectOption[];
  kantongOptions: readonly SelectOption[];
  tipeOptions: readonly SelectOption[];
  waktuLabel?: string;
  kantongLabel?: string;
  tipeLabel?: string;
  updateRow: (rowId: string, patch: Partial<TransaksiRow>) => void;
  handleNominalChange: (rowId: string, value: string) => void;
  handleDeleteRow: (rowId: string) => Promise<void>;
  saveRow: (rowId: string) => Promise<void>;
};

export function TabelBodyRow({
  row,
  waktuOptions,
  kantongOptions,
  tipeOptions,
  waktuLabel,
  kantongLabel,
  tipeLabel,
  updateRow,
  handleNominalChange,
  handleDeleteRow,
  saveRow,
}: TabelBodyRowProps) {
  const handleSelectChange = (
    field: 'waktuId' | 'kantongId' | 'tipeId',
    value: string,
  ) => {
    updateRow(row.id, { [field]: value });
    void saveRow(row.id);
  };

  return (
    <TableRow>
      <TableCell>
        <TransactionNameField
          row={row}
          updateRow={updateRow}
          saveRow={saveRow}
        />
      </TableCell>

      <TableCell>
        <MenuSelectField
          value={row.waktuId}
          options={waktuOptions}
          displayValue={waktuLabel}
          onChange={(value) => handleSelectChange('waktuId', value)}
        />
      </TableCell>

      <TableCell>
        <NominalField
          row={row}
          handleNominalChange={handleNominalChange}
          saveRow={saveRow}
        />
      </TableCell>

      <TableCell>
        <CategoryPopover row={row} />
      </TableCell>

      <TableCell>
        <MenuSelectField
          value={row.kantongId}
          options={kantongOptions}
          displayValue={kantongLabel}
          onChange={(value) =>
            handleSelectChange('kantongId', value)
          }
        />
      </TableCell>

      <TableCell>
        <NoteField
          row={row}
          updateRow={updateRow}
          saveRow={saveRow}
        />
      </TableCell>

      <TableCell>
        <MenuSelectField
          value={row.tipeId}
          options={tipeOptions}
          displayValue={tipeLabel}
          onChange={(value) => handleSelectChange('tipeId', value)}
        />
      </TableCell>

      <TableCell className='text-center'>
        <DeleteRowButton
          rowId={row.id}
          handleDeleteRow={handleDeleteRow}
        />
      </TableCell>
    </TableRow>
  );
}
