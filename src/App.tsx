import './App.css';
import { Table, TableModel } from './table';
import { $activeUsers, $status, $users, getUsersEffect, User } from './model';
import { useQueryAtom } from 'jotai-async/react';
import { useAtomValue } from 'jotai';
import { SelectionPlugin } from './table/plugins/selection';
import { useEffect } from 'react';
import { useAtomCallback } from 'jotai/utils';

const tableModel = new TableModel<User>({
  columns: [
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
}).with(
  SelectionPlugin({
    $activeItems: $activeUsers,
    $status,
    getIsActive: ({ $isActive }) => $isActive,
  })
);

function App() {
  useQueryAtom(getUsersEffect);

  const retry = useAtomCallback((_, set) => set(getUsersEffect.mutation));

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(123);
      retry();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const users = useAtomValue($users);

  return <Table model={tableModel} data={users} />;
}

export default App;
