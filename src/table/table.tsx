import { useEffect, useMemo } from 'react';
import { ColumnsAtom, TableModel } from './table.model';
import { Atom } from 'jotai';
import { useAtomValue } from 'jotai/react';
import { Column, Row } from '.';
import { useAtom } from 'jotai/react';
import { useSetAtom } from 'jotai/react';

export type TableProps<Data> = {
  model: TableModel<Data>;
  data: Data[];
};

export const Table = <Data extends object>({
  model,
  data: source,
}: TableProps<Data>) => {
  const { $rows, initEffect, $columns, $data } = useMemo(() => {
    return model.init();
  }, [model]);

  const setData = useSetAtom($data);

  useEffect(() => {
    setData(source);
  }, [source]);

  useAtom(initEffect);

  return (
    <table>
      <Thead $columns={$columns} />
      <Tbody $rows={$rows} $columns={$columns} />
    </table>
  );
};

const Thead = <Data extends object>({
  $columns,
}: {
  $columns: ColumnsAtom<Data>;
}) => {
  const columns = useAtomValue($columns);

  return (
    <thead>
      <tr>
        {columns.map((column) => {
          return <Th key={column.id} column={column} />;
        })}
      </tr>
    </thead>
  );
};

const Th = <Data extends object>({ column }: { column: Column<Data> }) => {
  return <th>{column.header()}</th>;
};

const Tbody = <Data extends object>({
  $rows,
  $columns,
}: {
  $columns: ColumnsAtom<Data>;
  $rows: Atom<Row<Data>[]>;
}) => {
  const columns = useAtomValue($columns);
  const rows = useAtomValue($rows);

  return (
    <tbody>
      {rows.map((row) => {
        return <Tr key={row.id} row={row} columns={columns} />;
      })}
    </tbody>
  );
};

const Tr = <Data extends object>({
  columns,
  row,
}: {
  row: Row<Data>;
  columns: Column<Data>[];
}) => {
  return (
    <tr>
      {columns.map((column) => (
        <Td row={row} column={column} key={`${row.id}.${column.id}`} />
      ))}
    </tr>
  );
};

const Td = <Data extends object>({
  row,
  column,
}: {
  row: Row<Data>;
  column: Column<Data>;
}) => {
  const data = useAtomValue(row.$data);

  return <td>{column.cell(data)}</td>;
};
