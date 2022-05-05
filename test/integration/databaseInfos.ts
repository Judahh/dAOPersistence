const eventInfo = {
  database: 'write',
  host: process.env.MONGO_HOST || 'localhost',
  port: process.env.MONGO_PORT,
};

const readInfo = {
  database: 'read_DB',
  host: process.env.PGSQL_HOST || 'localhost',
  port: process.env.PGSQL_PORT || 5432,
  username: process.env.PGSQL_USER || 'pgsql',
  password: process.env.PGSQL_PASSWORD,
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 600000,
    idleTimeoutMillis: 600000,
  },
};

const readInfo2 = {
  database: 'read_DB',
  uri: process.env.MSSQL_URI,
  connectionType: process.env.MSSQL_CONNECTION_TYPE,
  options: process.env.MSSQL_OPTIONS || {
    encrypt: false,
    trustServerCertificate: false,
  },
  host: process.env.MSSQL_HOST || 'localhost',
  port: process.env.MSSQL_PORT || 1433,
  username: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || 'yourStrong(!)Password',
  ssl: false,
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 600000,
    idleTimeoutMillis: 600000,
  },
};

export { eventInfo, readInfo, readInfo2 };
