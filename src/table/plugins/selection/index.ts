import { PrimitiveAtom } from 'jotai';
import { SelectionPluginModel, StatusAtom } from './model';
import { SelectionColumnSymbol, SelectionPluginView } from './ui';
import { Plugin } from '../../table.model';
import { Column } from '../../table.model';

export const SelectionPlugin = <Data>({
  $activeItems,
  $status,
  getIsActive,
}: {
  getIsActive: (item: Data) => PrimitiveAtom<boolean>;
  $status: StatusAtom;
  $activeItems: PrimitiveAtom<Data[]>;
}): Plugin<Data, SelectionPluginModel<Data>> => {
  return {
    model: new SelectionPluginModel({ $activeItems, $status, getIsActive }),
    view: SelectionPluginView({ getIsActive }),
  };
};

SelectionPlugin.createColumn = <Data>(): Column<Data> => {
  return {
    id: 'selection',
    _libType: SelectionColumnSymbol,
  };
};
