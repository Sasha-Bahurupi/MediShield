INSERT INTO product_registry (sku_id, product_name, batch_number, manufacturing_date, expiry_date, intended_region, manufacturer_signature)
VALUES 
('AMX-9081', 'Amoxicillin 500mg', 'BATCH-2024-Z', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP + INTERVAL '1 year', 'South Asia', 'ValidSignature123'),
('PARA-1002', 'Paracetamol 1000mg', 'BATCH-2023-X', CURRENT_TIMESTAMP - INTERVAL '12 months', CURRENT_TIMESTAMP + INTERVAL '2 years', 'North America', 'ValidSignature456')
ON CONFLICT (sku_id) DO NOTHING;
