SELECT 'CREATE DATABASE keycloak OWNER talensora'
WHERE NOT EXISTS (
    SELECT
    FROM pg_database
    WHERE datname = 'keycloak'
)
\gexec