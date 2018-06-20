# React Sortable Table

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A table which can be reordered by dragging an icon in one of the cells

## Installation

```sh
npm i --save react-sortable-table
```

## Usage

### Creating tables

```jsx
import SortableTable from 'react-sortable-table';

const table = (
  <SortableTable>
    <SortableTable.Table>
      <SortableTable.Header>
        <SortableTable.Row>
          <SortableTable.HeaderCell>Foo <SortableTable.SortingIcon /></SortableTable.HeaderCell>
          <SortableTable.HeaderCell>Bar <SortableTable.SortingIcon /></SortableTable.HeaderCell>
        </SortableTable.Row>
      </SortableTable.Header>
      <SortableTable.Body>
        <SortableTable.Row>
          <SortableTable.Cell>foo</SortableTable.Cell>
          <SortableTable.Cell>bar</SortableTable.Cell>
        </SortableTable.Row>
      </SortableTable.Body>
    </SortableTable.Table>
  </SortableTable>
);
```

### Creating tables using semantic-ui

```jsx
import SortableTable from 'react-sortable-table';
import { Table } from 'semantic-ui-react';

const semanticSortingIcon = (
  <SortableTable.SortingIcon>
    <Icon name="sort" rotated="clockwise" />
  </SortableTable.SortingIcon>
);

const table = (
  <SortableTable>
    <SortableTable.Table as={Table}>
      <SortableTable.Header as={Table.Header}>
        <SortableTable.Row as={Table.Row}>
          <SortableTable.HeaderCell as={Table.HeaderCell}>Foo {semanticSortingIcon}</SortableTable.HeaderCell>
          <SortableTable.HeaderCell as={Table.HeaderCell}>Bar {semanticSortingIcon}</SortableTable.HeaderCell>
        </SortableTable.Row>
      </SortableTable.Header>
      <SortableTable.Body as={Table.Body}>
        <SortableTable.Row as={Table.Row} key="1">
          <SortableTable.Cell as={Table.Cell}>foo</SortableTable.Cell>
          <SortableTable.Cell as={Table.Cell}>bar</SortableTable.Cell>
        </SortableTable.Row>
      </SortableTable.Body>
    </SortableTable.Table>
  </SortableTable>
);
```
