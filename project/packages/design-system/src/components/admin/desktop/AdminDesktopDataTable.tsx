import { AdminDataTable, type AdminDataTableProps } from '../../AdminDataTable';

export type AdminDesktopDataTableProps<T> = AdminDataTableProps<T>;

export function AdminDesktopDataTable<T>(props: AdminDesktopDataTableProps<T>) {
  return <AdminDataTable {...props} />;
}
