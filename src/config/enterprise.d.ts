declare module 'src/config/enterprise' {
  import type { Pool } from 'mysql2/promise';
  const db: Pool;
  export default db;
}
