import { atom, PrimitiveAtom } from 'jotai';
import { PluginView } from '../../table.model';
import { SelectionPluginModel } from './model';
import { useAtomValue } from 'jotai/react';
import { useAtomCallback } from 'jotai/utils';
import { useSetAtom } from 'jotai/react';
import { atomEffect } from 'jotai-effect';

export const SelectionPluginView = <Data extends any>({
  getIsActive,
}: {
  getIsActive: (item: Data) => PrimitiveAtom<boolean>;
}): PluginView<Data, SelectionPluginModel<Data>> => ({
  init: ({ $columns, model }) => {
    return atomEffect((get, set) => {
      set($columns, [
        {
          id: 'isActive',
          header: () => {
            const status = useAtomValue(model.getStatus());
            const setStatus = useSetAtom(model.setStatus());

            return (
              <input
                type="checkbox"
                checked={status === 'active'}
                onChange={(event) => setStatus(event.target.checked)}
              />
            );
          },
          cell: (data) => {
            const $isActive = getIsActive(data);
            const isActive = useAtomValue($isActive);

            const toggle = useAtomCallback((_, set, nextValue: boolean) => {
              set($isActive, nextValue);
            });

            return (
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => toggle(event.target.checked)}
              />
            );
          },
        },
        ...get($columns),
      ]);
    });
  },
});
