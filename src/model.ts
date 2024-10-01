import {queryAtom} from 'jotai-async';
import {atom, PrimitiveAtom} from 'jotai';
import {atomFamily} from 'jotai/utils';
import {SelectionStatus} from 'jotai-table/plugins/selection'

export type UserDto = {
  name: string;
  email: string;
  details: string;
};

export type User = {
  name: string;
  email: string;
  details: string;
  $isActive: PrimitiveAtom<boolean>;
};

const mock: UserDto[] = [
  {
    name: 'John',
    email: 'john@email.com',
    details: 'John '.repeat(3),
  },
  {
    name: 'Bob',
    email: 'bob@email.com',
    details: 'Bob '.repeat(3),
  },
];

let counter = 0;

export const getUsersEffect = queryAtom<UserDto[]>(async () => {
  const name = (++counter).toString().slice(-5);

  console.log(name);

  mock.push({
    name: name,
    email: `${name}@email.com`,
    details: `${name} `.repeat(3),
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
    details: item.details,
    $isActive: activeFamily(item.email),
  }));
});

export const $status = atom<SelectionStatus>('inactive');
export const $activeUsers = atom<User[]>([]);
