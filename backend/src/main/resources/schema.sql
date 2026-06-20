CREATE TABLE IF NOT EXISTS product_registry (
    sku_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    manufacturing_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    intended_region VARCHAR(100) NOT NULL,
    manufacturer_signature TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scan_ledger (
    scan_id BIGSERIAL PRIMARY KEY,
    sku_id VARCHAR(50) NOT NULL,
    pharmacist_id VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    scan_timestamp TIMESTAMP NOT NULL,
    client_device_id VARCHAR(100),
    is_synced_offline BOOLEAN NOT NULL DEFAULT FALSE,
    system_risk_score INTEGER NOT NULL,
    ai_confidence_score DOUBLE PRECISION NOT NULL,
    status_verdict VARCHAR(20) NOT NULL,
    CONSTRAINT fk_scan_product FOREIGN KEY (sku_id) REFERENCES product_registry(sku_id)
);
