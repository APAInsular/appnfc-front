/**
 * Column definition mapping API response keys to table headers.
 * @param key      - matches the API response field name
 * @param label    - displayed header text
 * @param readonly - disables inline editing for this column
 */
interface Column {
  key: string;
  label: string;
  readonly: boolean;
}

/**
 * @param endpoint     - API endpoint to fetch data from
 * @param columns      - column definitions for the table
 * @param pollInterval - refetch interval in milliseconds
 */
interface Props {
  endpoint: string;
  columns: Column[];
  pollInterval?: number;
}

/**
 * Displays a table with inline CRUD operations via API. Requires authentication.
 * @param Props
 */
export default function ResourceTable({ endpoint, columns, pollInterval = 30_000 }: Props) {
    // TODO: Para kevin.
}