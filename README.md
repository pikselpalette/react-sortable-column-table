# React Sortable Column Table

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/react-sortable-column-table.svg)](https://badge.fury.io/js/react-sortable-column-table)
[![Build Status](https://travis-ci.org/pikselpalette/react-sortable-column-table.svg?branch=master)](https://travis-ci.org/pikselpalette/react-sortable-column-table)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0d0369063ad0495f8f4a1bb44ee74921)](https://www.codacy.com/app/samboylett/react-sortable-column-table?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=pikselpalette/react-sortable-column-table&amp;utm_campaign=Badge_Grade)
[![dependencies Status](https://david-dm.org/pikselpalette/react-sortable-column-table/status.svg)](https://david-dm.org/pikselpalette/react-sortable-column-table)
[![devDependencies Status](https://david-dm.org/pikselpalette/react-sortable-column-table/dev-status.svg)](https://david-dm.org/pikselpalette/react-sortable-column-table?type=dev)
[![peerDependencies Status](https://david-dm.org/pikselpalette/react-sortable-column-table/peer-status.svg)](https://david-dm.org/pikselpalette/react-sortable-column-table?type=peer)
[![codecov](https://codecov.io/gh/pikselpalette/react-sortable-column-table/branch/master/graph/badge.svg)](https://codecov.io/gh/pikselpalette/react-sortable-column-table)

A table with columns that can be reordered by dragging an icon in one of the cells

## Installation

```sh
npm i --save react-sortable-column-table
```

## Usage

### Creating tables

```jsx
import SortableTable, { SortingIcon } from 'react-sortable-column-table';

const table = (
  <SortableTable>
    <table>
      <thead>
        <tr>
          <th>Foo <SortingIcon /></th>
          <th>Bar <SortingIcon /></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>foo</td>
          <td>bar</td>
        </tr>
      </tbody>
    </table>
  </SortableTable>
);
```

### Creating tables using semantic-ui

```jsx
import SortableTable, { SortingIcon } from 'react-sortable-column-table';
import { Table } from 'semantic-ui-react';

const semanticSortingIcon = (
  <SortingIcon>
    <Icon name="sort" rotated="clockwise" />
  </SortingIcon>
);

const table = (
  <SortableTable
    tr={Table.Row}
    th={Table.HeaderCell}
    td={Table.Cell}
  >
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Foo {semanticSortingIcon}</Table.HeaderCell>
          <Table.HeaderCell>Bar {semanticSortingIcon}</Table.HeaderCell>
        </Table.Row>
      </thead>
      <Table.Body>
        <Table.Row>
          <Table.Cell>foo</Table.Cell>
          <Table.Cell>bar</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  </SortableTable>
);
```
