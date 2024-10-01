import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { ColumnsAtom, TableModel } from './table.model';
import { Atom } from 'jotai';
import { useAtomValue } from 'jotai/react';
import { Column, Row, Plugin } from './table.model';
import { useAtom } from 'jotai/react';
import { useSetAtom } from 'jotai/react';
import { TableApi } from 'jotai-table';

export type TableProps<Data> = {
  model: TableModel<Data>;
  data: Data[];
};

export const Table = <Data extends any>({
  model,
  data: source,
}: TableProps<Data>) => {
  const { $rows, initEffect, $columns, $data, plugins, $dataMap } =
    useMemo(() => {
      return model.init();
    }, [model]);

  const setData = useSetAtom($data);

  useEffect(() => {
    setData(source);
  }, [source]);

  useAtom(initEffect);

  return (
    <TableContext.Provider
      value={{ $rows, initEffect, $columns, $data, plugins, $dataMap }}
    ><div>
      <Tools/>
      <table>
        <Thead />
        <Tbody />
      </table>
      </div>
    </TableContext.Provider>
  );
};

const TableContext = createContext<TableApi<any, any>>(
  {} as unknown as TableApi<any, any>
);

const useTable = <Data extends any>() =>
  useContext<TableApi<Data, any>>(TableContext);


const Tools = <Data extends any>() => {
  const { $columns, $dataMap, $rows, plugins } = useTable<Data>();

  const {left, right} = useMemo(() => {
    return plugins.reduce<{left: ReactNode[], right: ReactNode[]}>((result, plugin) => {

      if(plugin.view.renderTool) {
        const tool = plugin.view.renderTool({$columns, $dataMap, $rows, model: plugin.model});

        if(tool.left) {
          result.left.push(tool.left)
        }

        if(tool.right) {
          result.right.push(tool.right)
        }
      }

      return result;
    }, {left: [], right: []})
  }, [])

  return <div style={{display: 'flex', justifyContent: 'space-between'}}>
    <div style={{display: 'flex'}}>
      {left}
    </div>

    <div  style={{display: 'flex'}}>
      {right}
    </div>
  </div>
}

const Thead = <Data extends any>() => {
  const { $columns } = useTable<Data>();
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

const Th = <Data extends any>({ column }: { column: Column<Data> }) => {
  if (column._libType) {
    return null;
  }

  return <th>{column.header()}</th>;
};

const Tbody = <Data extends any>() => {
  const { $columns, $rows } = useTable<Data>();

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

const Tr = <Data extends any>({
  columns,
  row,
}: {
  row: Row<Data>;
  columns: Column<Data>[];
}) => {
  const { $columns, $dataMap, $rows, plugins } = useTable<Data>();

  const originalRow = (
    <tr>
      {columns.map((column) => (
        <Td row={row} column={column} key={`${row.id}.${column.id}`} />
      ))}
    </tr>
  );

  const rowNode = useMemo(() => {
    return plugins.reduce<ReactNode>(
      (result, plugin) =>
        plugin.view.renderRow?.({
          node: result,
          $columns,
          $dataMap,
          $rows,
          row,
          model: plugin.model,
        }) ?? result,
      originalRow
    );
  }, []);

  return rowNode;
};

const Td = <Data extends any>({
  row,
  column,
}: {
  row: Row<Data>;
  column: Column<Data>;
}) => {
  const { $columns, $dataMap, $rows, plugins } = useTable<Data>();

  const data = useAtomValue(row.$data);

  if (column._libType) {
    return null;
  }

  const originalCell = <td>{column.cell(data, row.id)}</td>;

  const cellNode = useMemo(() => {
    return plugins.reduce<ReactNode>(
      (result, plugin) =>
        plugin.view.renderCell?.({
          node: result,
          $columns,
          $dataMap,
          $rows,
          column,
          row,
          model: plugin.model,
        }) ?? result,
      originalCell
    );
  }, []);

  return cellNode;
};
