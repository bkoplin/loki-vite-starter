---
name: PostgreSQL Running Query
queryParams: {randomNumber: "urn:com:loki:core:model:types:string"}
dataSpaceUrn: "specify:in:query:call"
---

WITH processes AS (
    SELECT
        pid,
        -- usename ,
        TO_CHAR(TIMEZONE('CDT', query_start), 'MON. DD, YYYY, HH24:MI') AS query_start,
        TO_CHAR(TIMEZONE('CDT', STATEMENT_TIMESTAMP())::TIMESTAMPTZ, 'MON. DD, YYYY, HH24:MI') AS current_tm,
        FORMAT(
            '%s HOURS, %s MINUTES, %s SECONDS',
            EXTRACT(HOUR FROM STATEMENT_TIMESTAMP() - query_start),
            EXTRACT(MINUTE FROM STATEMENT_TIMESTAMP() - query_start),
            CEILING(EXTRACT(SECONDS FROM STATEMENT_TIMESTAMP() - query_start))
        ) AS runtime,
        "query" AS query_string,
        "state" AS query_state,
        CEILING((EXTRACT(EPOCH FROM STATEMENT_TIMESTAMP()) - EXTRACT(EPOCH FROM query_start))/60.0::NUMERIC) AS minutes_since_run
    FROM
        pg_stat_activity 
    WHERE
        "state" = 'active'
        AND
        "query" NOT LIKE '%pg_indexes%' 
        AND 
        CEILING(EXTRACT(SECONDS FROM NOW() - query_start)) > 2
        AND
        (:randomNumber ::FLOAT8) != 2
    ORDER BY
        query_start DESC
    LIMIT
        20 
)
SELECT
    pid ::TEXT "processId"
    , current_tm ::TEXT "CURRENT TIME"
    , query_start ::TEXT "QUERY START"
    , runtime ::TEXT "QUERY RUNTIME"
    , query_state ::TEXT "QUERY STATE"
    , query_string ::TEXT "QUERY STRING"
FROM
    processes
ORDER BY minutes_since_run
