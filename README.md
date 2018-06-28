# React Sortable Column Table

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/react-sortable-column-table.svg)](https://badge.fury.io/js/react-sortable-column-table)
[![Build Status](https://travis-ci.org/pikselpalette/react-sortable-column-table.svg?branch=master)](https://travis-ci.org/pikselpalette/react-sortable-column-table)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0d0369063ad0495f8f4a1bb44ee74921)](https://www.codacy.com/app/samboylett/react-sortable-column-table?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=pikselpalette/react-sortable-column-table&amp;utm_campaign=Badge_Grade)
[![dependencies Status](https://david-dm.org/pikselpalette/react-sortable-column-table/status.svg)](https://david-dm.org/pikselpalette/react-sortable-column-table)
[![devDependencies Status](https://david-dm.org/pikselpalette/react-sortable-column-table/dev-status.svg)](https://david-dm.org/pikselpalette/react-sortable-column-table?type=dev)
[![peerDependencies Status](https://david-dm.org/pikselpalette/react-sortable-column-table/peer-status.svg)](https://david-dm.org/pikselpalette/react-sortable-column-table?type=peer)

A table with columns that can be reordered by dragging an icon in one of the cells

## Installation

```sh
npm i --save react-sortable-column-table
```

## Usage

### Creating tables

```jsx
import SortableTable from 'react-sortable-column-table';

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
