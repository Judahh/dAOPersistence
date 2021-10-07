const eventInfo = {
  database: 'write',
  host: process.env.MONGO_HOST || 'localhost',
  port: process.env.MONGO_PORT,
};

const readInfo = {
  database: 'read_DB',
  host: process.env.MSSQL_HOST || 'localhost',
  port: process.env.MSSQL_PORT || 5432,
  username: process.env.MSSQL_USER || 'postgres',
  password: process.env.MSSQL_PASSWORD,
  pool: { min: 2, max: 10 },
};

const readInfo1 = {
  database: 'master',
  uri: process.env.MSSQL_URI,
  connectionType: process.env.MSSQL_CONNECTION_TYPE,
  options: process.env.MSSQL_OPTIONS || {
    encrypt: false,
    trustServerCertificate: false,
  },
  host: process.env.MSSQL_HOST || 'localhost',
  port: process.env.MSSQL_PORT || 1433,
  username: process.env.MSSQL_USER || 'SA',
  password: process.env.MSSQL_PASSWORD || 'yourStrong(!)Password',
  ssl: false,
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
  username: process.env.MSSQL_USER || 'SA',
  password: process.env.MSSQL_PASSWORD || 'yourStrong(!)Password',
  ssl: false,
};

export { eventInfo, readInfo, readInfo1, readInfo2 };
