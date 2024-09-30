import './App.css';
import { $activeUsers, $status, $users, getUsersEffect, User } from './model';
import { useQueryAtom } from 'jotai-async/react';
import { useAtomValue } from 'jotai';
import { Table, TableModel } from 'jotai-table';
import { SelectionPlugin } from 'jotai-table/plugins/selection';
import { DetailsPlugin } from 'jotai-table/plugins/details';

const tableModel = new TableModel<User>({
  columns: [
    SelectionPlugin.createColumn(),
    {
      id: 'name',
      cell: ({ name }) => name,
      header: () => 'Name',
    },
    {
      id: 'email',
      cell: ({ email }) => email,
      header: () => 'Email',
    },
  ],
  getRowId: (item) => item.email,
})
  .with(
    SelectionPlugin({
      $activeItems: $activeUsers,
      $status,
      getIsActive: ({ $isActive }) => $isActive,
    })
  )
  .with(
    DetailsPlugin({
      renderDetails: ({ data }) => data.details,
    })
  );

function App() {
  useQueryAtom(getUsersEffect);

  const users = useAtomValue($users);

  return <Table model={tableModel} data={users} />;
}

export default App;
