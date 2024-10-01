import { atom } from 'jotai';
import { atomEffect, withAtomEffect } from 'jotai-effect';
import { InitEffect, InitOptions, PluginModel } from 'jotai-table';
import { atomFamily } from 'jotai/utils';

export class DetailsPluginModel<Data> implements PluginModel<Data> {
  private readonly $isAllCollapsed = atom(true);

  private readonly detailsFamily = atomFamily((id: string) => {
    const $isCollapsed = atom(true);
    $isCollapsed.debugLabel = `details.${id}`;

    return withAtomEffect($isCollapsed, (get, set) => {
      const isAllSollapsed = get(this.$isAllCollapsed);

      set($isCollapsed, isAllSollapsed);
    });
  });

  getIsAllCollapsed() {
    return this.$isAllCollapsed;
  }

  getStatus(id: string) {
    return this.detailsFamily(id);
  }

  collapse() {
    return atom(null, (_, set) => {
      set(this.$isAllCollapsed, true);
    });
  }

  show() {
    return atom(null, (_, set) => {
      set(this.$isAllCollapsed, false);
    });
  }

  init({}: InitOptions<Data>): InitEffect {
    return atomEffect(() => {});
  }
}
