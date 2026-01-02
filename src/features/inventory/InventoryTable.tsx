import React, { useMemo, useState } from 'react';
import MainCard from '../../components/MainCard';
import { Stack, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box } from '@mui/material';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, SortingState } from '@tanstack/react-table';
import { DeleteOutlined, EditOutlined, EyeOutlined, MinusCircleOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { InventoryItem } from './types';
import StatusPill from './StatusPill';
import DebouncedInput from '../../components/third-party/react-table/DebouncedInput';
import SelectColumnSorting from '../../components/third-party/react-table/SelectColumnSorting';
import CSVExport from '../../components/third-party/react-table/CSVExport';

interface InventoryTableProps {
  data: InventoryItem[];
  onStockAction: (item: InventoryItem, type: 'in' | 'out') => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ data, onStockAction, onEdit, onDelete, onAdd }) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'productName', desc: false }]);

  const filteredData = useMemo(() => {
    return data.filter((item: InventoryItem) => item.productName.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const columns = useMemo<ColumnDef<InventoryItem, any>[]>(
    () => [
      {
        header: 'Product Name',
        accessorKey: 'productName',
        cell: (info: any) => info.getValue()
      },
      {
        header: 'SKU',
        accessorKey: 'sku'
      },
      {
        header: 'Category',
        accessorKey: 'category'
      },
      {
        header: 'Current Stock',
        accessorKey: 'currentStock',
        cell: ({ row }: { row: { original: InventoryItem } }) => <StatusPill stock={row.original.currentStock} />
      },
      {
        header: 'Stock Value',
        accessorKey: 'stockValue',
        cell: ({ row }: { row: { original: InventoryItem } }) => row.original.currentStock
      },
      {
        header: 'Unit Price',
        accessorKey: 'unitPrice',
        cell: (info: any) => `$${info.getValue().toFixed(2)}`
      },
      {
        header: 'Total Value',
        accessorFn: (row: InventoryItem) => row.currentStock * row.unitPrice,
        cell: (info: any) => `$${info.getValue().toFixed(2)}`
      },
      {
        header: 'Actions',
        meta: { align: 'center' },
        cell: ({ row }: { row: { original: InventoryItem } }) => (
          <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
            <Tooltip title="Edit">
              <IconButton color="primary" sx={{ '&:hover': { color: 'primary.main' } }} onClick={() => onEdit(row.original)}>
                <EditOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Stock In">
              <IconButton color="primary" sx={{ '&:hover': { color: 'primary.main' } }} onClick={() => onStockAction(row.original, 'in')}>
                <PlusCircleOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Stock Out">
              <IconButton color="primary" sx={{ '&:hover': { color: 'primary.main' } }} onClick={() => onStockAction(row.original, 'out')}>
                <MinusCircleOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => onDelete(row.original.id)}>
                <DeleteOutlined />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [onStockAction, onEdit]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel()
  });

  // CSV headers
  const headers = useMemo(
    () =>
      columns.map((col) => {
        const accessorKey = (col as { accessorKey?: string }).accessorKey;
        return {
          label: typeof col.header === 'string' ? col.header : '#',
          key: accessorKey ?? ''
        };
      }),
    [columns]
  );

  return (
    <MainCard content={false} title="Inventory Dashboard">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', p: 2 }}
      >
        <DebouncedInput
          value={search}
          onFilterChange={(value) => setSearch(String(value))}
          placeholder={`Search ${data.length} records...`}
        />
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <SelectColumnSorting getState={() => table.getState()} getAllColumns={() => table.getAllColumns()} setSorting={setSorting} />
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={onAdd}>
            Add Inventory Item
          </Button>
          <CSVExport data={data} headers={headers} filename="inventory-list.csv" />
        </Stack>
      </Stack>
      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <TableCell key={header.id} align={header.column.columnDef.meta?.align || 'left'}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>Loading...</TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row: any) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id} align={cell.column.columnDef.meta?.align || 'left'}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
};

export default InventoryTable;
