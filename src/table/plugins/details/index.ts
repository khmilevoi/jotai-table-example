import { Plugin } from 'jotai-table';
import { DetailsPluginModel } from './model';
import { DetailsPluginView } from './ui';
import { ReactNode } from 'react';

export const DetailsPlugin = <Data>({
  renderDetails,
}: {
  renderDetails: (props: { data: Data }) => ReactNode;
}): Plugin<Data, DetailsPluginModel<Data>> => {
  return {
    model: new DetailsPluginModel(),
    view: DetailsPluginView({ renderDetails }),
  };
};
