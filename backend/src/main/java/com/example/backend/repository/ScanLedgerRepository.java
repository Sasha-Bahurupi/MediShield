package com.example.backend.repository;

import com.example.backend.model.ScanLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanLedgerRepository extends JpaRepository<ScanLedger, Long> {
    
    @Query("SELECT s FROM ScanLedger s WHERE s.productRegistry.skuId = :skuId ORDER BY s.scanTimestamp DESC")
    List<ScanLedger> findBySkuIdOrderByScanTimestampDesc(@Param("skuId") String skuId);
}
