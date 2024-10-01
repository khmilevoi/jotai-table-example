import { Atom, atom, PrimitiveAtom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { ReactNode } from 'react';

export class TableModel<Data> {
  private readonly plugins: Plugin<Data, any>[] = [];

  constructor(
    private readonly options: {
      columns: Column<Data>[];
      getRowId: (item: Data) => string;
    }
  ) {}

  private createRows($data: PrimitiveAtom<Data[]>): Atom<Row<Data>[]> {
    return atom((get) =>
      get($data).map((item) => ({
        id: this.options.getRowId(item),
        $data: atom(item),
      }))
    );
  }

  private createDataMap($rows: Atom<Row<Data>[]>) {
    return atom((get) => {
      return get($rows).reduce<DataMap<Data>>((map, row) => {
        map.set(row.id, row.$data);

        return map;
      }, new Map());
    });
  }

  private readonly $data = atom<Data[]>([]);
  private api: TableApi<Data, any> | null = null;

  private isInited = false;

  init() {
    if (this.api) {
      return this.api;
    }

    const $rows = this.createRows(this.$data);
    const $dataMap = this.createDataMap($rows);
    const $columns = atom(this.options.columns);

    const initEffect = atomEffect((get) => {
      if(this.isInited) {
        return;
      }

      this.plugins.forEach((plugin) => {
        get(
          plugin.model.init({
            $dataMap,
            $rows,
            $columns,
          })
        );
        get(
          plugin.view.init({
            $dataMap,
            $rows,
            $columns,
            model: plugin.model,
          })
        );
      });

      this.isInited = true;
    });

    this.api = {
      initEffect,
      $rows,
      $dataMap,
      $columns,
      $data: this.$data,
      plugins: this.plugins,
    };

    return this.api;
  }

  getColumns() {
    return this.options.columns;
  }

  getPlugins() {
    return this.plugins;
  }

  with<Model extends PluginModel<Data>>(plugin: Plugin<Data, Model>) {
    this.plugins.push(plugin);

    return this;
  }
}

export type TableApi<Data, Model extends PluginModel<Data>> = {
  initEffect: Atom<void>;
  $rows: Atom<Row<Data>[]>;
  $data: PrimitiveAtom<Data[]>;
  $dataMap: Atom<DataMap<Data>>;
  $columns: ColumnsAtom<Data>;
  plugins: Plugin<Data, Model>[];
};

export type Row<Data> = {
  id: string;
  $data: PrimitiveAtom<Data>;
};

export type Column<Data> =
  | {
      id: string;
      header: () => ReactNode;
      cell: (data: Data, id: string) => ReactNode;
      _libType?: never;
    }
  | {
      id: string;
      _libType: Symbol;
    };

export type ColumnsAtom<Data> = PrimitiveAtom<Column<Data>[]>;

export type Plugin<Data, Model extends PluginModel<Data>> = {
  model: Model;
  view: PluginView<Data, Model>;
};

export interface PluginModel<Data> {
  init(options: InitOptions<Data>): InitEffect;
}

export type InitEffect = Atom<void>;

export type DataMapAtom<Data> = Atom<DataMap<Data>>;
export type DataMap<Data> = Map<string, Atom<Data>>;

export type PluginView<Data, Model extends PluginModel<Data>> = {
  init(options: PluginApi<Data, Model>): InitEffect;

  renderCell?: (
    api: PluginApi<Data, Model> & {
      column: Column<Data>;
      row: Row<Data>;
      node: ReactNode;
    }
  ) => ReactNode;

  renderRow?: (
    api: PluginApi<Data, Model> & { row: Row<Data>; node: ReactNode }
  ) => ReactNode;

  renderTool?: (
    api: PluginApi<Data, Model> 
  ) => {left?: ReactNode, right?: ReactNode};
};

export type PluginApi<
  Data,
  Model extends PluginModel<Data>
> = InitOptions<Data> & { model: Model };

export type InitOptions<Data> = {
  $rows: Atom<Row<Data>[]>;
  $columns: ColumnsAtom<Data>;
  $dataMap: DataMapAtom<Data>;
};
