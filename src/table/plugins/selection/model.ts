import { PrimitiveAtom, WritableAtom } from 'jotai';
import { PluginModel, InitEffect, InitOptions } from '../../table.model';
import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';

export class SelectionPluginModel<Data> implements PluginModel<Data> {
  constructor(
    private readonly options: {
      getIsActive: (item: Data) => PrimitiveAtom<boolean>;
      $status: StatusAtom;
      $activeItems: PrimitiveAtom<Data[]>;
    }
  ) {}

  getStatus() {
    return this.options.$status;
  }

  setStatus() {
    return atom(null, (_, set, nextStatus: boolean) => {
      set(this.options.$status, nextStatus ? 'active' : 'inactive');
    });
  }

  init({ $rows, $dataMap }: InitOptions<Data>): InitEffect {
    const $activeItemsSet = atom(new Set<string>());

    const mainEffect = atomEffect((get, set) => {
      const rows = get($rows);

      rows.forEach((row) => {
        const data = get.peek(row.$data);

        const $isActive = this.options.getIsActive(data);

        get(
          atomEffect((get, set) => {
            const isActive = get($isActive);

            const activeItemsSet = get.peek($activeItemsSet);

            if (isActive) {
              activeItemsSet.add(row.id);
            } else {
              activeItemsSet.delete(row.id);
            }

            set($activeItemsSet, new Set(activeItemsSet));
          })
        );
      });

      return () => {
        const nextRows = get($rows);
        const activeItems = get.peek($activeItemsSet);

        const oldIds = new Set(activeItems.keys());

        nextRows.forEach((row) => {
          oldIds.delete(row.id);
        });

        oldIds.forEach((expiredKey) => {
          activeItems.delete(expiredKey);
        });

        set($activeItemsSet, new Set(activeItems));
      };
    });

    const activeItemsEffect = atomEffect((get, set) => {
      const activeItemsSet = get($activeItemsSet);
      const dataMap = get.peek($dataMap);

      set(
        this.options.$activeItems,
        [...activeItemsSet].map((id) => get.peek(dataMap.get(id)!))
      );
    });

    const statusEffect = atomEffect((get, set) => {
      const activeItemsSet = get($activeItemsSet);
      const rows = get.peek($rows);

      if (rows.length === activeItemsSet.size) {
        set(this.options.$status, 'active');
      } else if (activeItemsSet.size === 0) {
        set(this.options.$status, 'inactive');
      } else {
        set(this.options.$status, 'partial');
      }
    });

    const updateStatusEffect = atomEffect((get, set) => {
      const status = get(this.options.$status);
      const rows = get.peek($rows);

      if (status === 'partial') {
        return;
      }

      rows.forEach((row) =>
        set(this.options.getIsActive(get.peek(row.$data)), status === 'active')
      );
    });

    return atomEffect((get) => {
      get(mainEffect);
      get(statusEffect);
      get(activeItemsEffect);
      get(updateStatusEffect);
    });
  }
}

export type StatusAtom = WritableAtom<Status, [Status], void>;
export type Status = 'inactive' | 'active' | 'partial';
