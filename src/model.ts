import { queryAtom } from 'jotai-async';
import { atom, PrimitiveAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { Status } from './table/plugins/selection/model';

export type UserDto = {
  name: string;
  email: string;
};

export type User = {
  name: string;
  email: string;
  $isActive: PrimitiveAtom<boolean>;
};

const mock: UserDto[] = [
  {
    name: 'John',
    email: 'john@email.com',
  },
  {
    name: 'Bob',
    email: 'bob@email.com',
  },
];

let counter = 0;

export const getUsersEffect = queryAtom<UserDto[]>(async () => {
  const name = (++counter).toString().slice(-5);

  console.log(name);

  mock.push({
    name: name,
    email: `${name}@email.com`,
  });

  if (mock.length > 5) {
    mock.shift();
  }

  return [...mock];
});

const activeFamily = atomFamily((id: string) => {
  const $isActive = atom(false);
  $isActive.debugLabel = `isActive.${id}`;

  return $isActive;
});

export const $users = atom<User[]>((get) => {
  const users = get(getUsersEffect.$data) ?? [];

  return users.map((item) => ({
    name: item.name,
    email: item.email,
    $isActive: activeFamily(item.email),
  }));
});

export const $status = atom<Status>('inactive');
export const $activeUsers = atom<User[]>([]);
