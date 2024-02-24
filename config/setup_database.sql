--- create the tables for atica_postgresql atica_db database

--- users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    fullName VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    firebaseuid VARCHAR(128) NOT NULL,
    imageUrl VARCHAR(255),
    createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

--- companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    users INT NOT NULL,
    products INT NOT NULL,
    percentage INT NOT NULL,
    createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    userId INT,
    CONSTRAINT fk_user FOREIGN KEY (userId)
        REFERENCES users(id)
);

--- administrators table
CREATE TABLE IF NOT EXISTS administrators (
    id SERIAL PRIMARY KEY,
    fullName VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    firebaseuid VARCHAR(128) NOT NULL,
    isAdmin BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- indices
CREATE INDEX idx_company_email ON users(email);
CREATE INDEX idx_admin_email ON administrators(email);