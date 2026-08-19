SELECT 'CREATE DATABASE keycloak OWNER smartskale'
WHERE NOT EXISTS (
    SELECT
    FROM pg_database
    WHERE datname = 'keycloak'
)
\gexec