/*
Script for create auth database's
Auth v1 - Last update 30/01/2020
 */
-- CREATE DATABASE read_DB;
IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'read_DB')
  BEGIN
    CREATE DATABASE read_DB
  END
