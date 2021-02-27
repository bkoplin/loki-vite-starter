---
name: test
queryParams: {testParam: "urn:com:loki:core:model:types:string"}
dataSpaceUrn: "urn:com:reedsmith:cobra:model:dataSpaces:biotel_red"
---
WITH mcr AS (
    SELECT DISTINCT
        ep.enc_id
        , MAX(ep.create_timestamp) create_timestamp
    FROM ngprod_encounter_payer_20120101_20190601 ep
    JOIN payer_mstr2021_01_15_06_55_12 m ON m.payer_id = ep.payer_id
    WHERE 
        m.payer_name IN (
						'HGSA', 
						'Medicare PA',
						'Medicare MN',
						'Medicare CA',
						'Palmetto GBA',
						'RailRoad Medicare',
						'RR Medicare PA',
						'RR Medicare MN',
						'RR Medicare CA'
					) 
    GROUP BY 1
), e AS (
    SELECT 
        e.encid
        , e.monitoring
        , mcr.create_timestamp
        , MIN(e.receiveddate) min_received_date
        , DATEDIFF(second, MIN(e.receiveddate), mcr.create_timestamp) > 0 start_before_verify
        , DATEDIFF(second, MIN(e.receiveddate), mcr.create_timestamp)::FLOAT8 secs_between_rec_and_verify
    FROM msa_ecg_strip_with_rx_2012_2015 e
    JOIN mcr ON mcr.enc_id = e.encid
    WHERE 
        e.receiveddate BETWEEN '2013-06-23' AND '2015-12-31'
    GROUP BY   
        e.encid
        , e.monitoring
        , mcr.create_timestamp
)
SELECT 
    monitoring
    , AVG(secs_between_rec_and_verify)/60::FLOAT8/60::FLOAT8/24::FLOAT8 avg_days_w_events_unverified_ins
FROM e
GROUP BY 1