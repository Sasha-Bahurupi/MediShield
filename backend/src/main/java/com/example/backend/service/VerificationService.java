package com.example.backend.service;

import com.example.backend.dto.VerificationDTO;
import com.example.backend.dto.VerificationResponseDTO;
import com.example.backend.model.ProductRegistry;
import com.example.backend.model.ScanLedger;
import com.example.backend.repository.ProductRegistryRepository;
import com.example.backend.repository.ScanLedgerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

@Service
public class VerificationService {

    private final ProductRegistryRepository productRegistryRepository;
    private final ScanLedgerRepository scanLedgerRepository;
    private final QRCodeService qrCodeService;

    public VerificationService(ProductRegistryRepository productRegistryRepository, 
                               ScanLedgerRepository scanLedgerRepository,
                               QRCodeService qrCodeService) {
        this.productRegistryRepository = productRegistryRepository;
        this.scanLedgerRepository = scanLedgerRepository;
        this.qrCodeService = qrCodeService;
    }

    @Transactional
    public VerificationResponseDTO processScan(VerificationDTO dto) {
        // If the frontend didn't decode the QR code and just sent the image, the backend handles it.
        if ((dto.getSkuId() == null || dto.getSkuId().trim().isEmpty()) && dto.getImageBase64() != null) {
            String decodedSku = qrCodeService.decodeQRCodeFromBase64(dto.getImageBase64());
            if (decodedSku != null) {
                dto.setSkuId(decodedSku);
            } else {
                return new VerificationResponseDTO(null, 100, 0.0, "ERROR", "Could not decode QR code from the provided image.");
            }
        }

        Optional<ProductRegistry> productOpt = productRegistryRepository.findById(dto.getSkuId());
        
        int riskScore = 0;
        double aiConfidence = 0.0;
        String verdict = "VERIFIED";
        String message = "Product verification successful.";

        ProductRegistry product = null;

        if (productOpt.isEmpty()) {
            riskScore = 100;
            verdict = "COUNTERFEIT";
            message = "SKU not found in registry.";
            return new VerificationResponseDTO(dto.getSkuId(), riskScore, aiConfidence, verdict, message);
        } else {
            product = productOpt.get();
            aiConfidence = 0.0;
            
            if (dto.getImageBase64() != null && !dto.getImageBase64().isEmpty()) {
                try {
                    RestTemplate restTemplate = new RestTemplate();
                    Map<String, String> requestBody = new HashMap<>();
                    requestBody.put("sku_id", dto.getSkuId());
                    requestBody.put("image_base64", dto.getImageBase64());
                    
                    ResponseEntity<Map> aiResponse = restTemplate.postForEntity(
                        "http://ai_engine:8000/api/v1/ai/analyze-packaging", 
                        requestBody, 
                        Map.class
                    );
                    
                    if (aiResponse.getStatusCode().is2xxSuccessful() && aiResponse.getBody() != null) {
                        Number matchPct = (Number) aiResponse.getBody().get("visual_match_percentage");
                        if (matchPct != null) {
                            aiConfidence = matchPct.doubleValue();
                        }
                        
                        Boolean defect = (Boolean) aiResponse.getBody().get("typography_defect_detected");
                        if (Boolean.TRUE.equals(defect)) {
                            riskScore += 30;
                            message = "Packaging typography defect detected.";
                            verdict = "SUSPICIOUS";
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Failed to contact AI Engine: " + e.getMessage());
                }
            } else {
                aiConfidence = 95.0; // Fallback for pure QR scans without image
            }
            
            boolean anomaly = calculateVelocityAnomaly(dto.getLatitude(), dto.getLongitude(), dto.getScanTimestamp(), product);
            if (anomaly) {
                riskScore += 50;
                verdict = "SUSPICIOUS";
                message = "Velocity anomaly detected.";
            }
        }

        if (riskScore >= 100) {
            verdict = "COUNTERFEIT";
        }

        ScanLedger ledger = new ScanLedger();
        ledger.setProductRegistry(product);
        ledger.setPharmacistId(dto.getPharmacistId());
        ledger.setLatitude(dto.getLatitude());
        ledger.setLongitude(dto.getLongitude());
        ledger.setScanTimestamp(dto.getScanTimestamp());
        ledger.setClientDeviceId(dto.getClientDeviceId());
        ledger.setIsSyncedOffline(dto.getIsSyncedOffline() != null ? dto.getIsSyncedOffline() : false);
        ledger.setSystemRiskScore(riskScore);
        ledger.setAiConfidenceScore(aiConfidence);
        ledger.setStatusVerdict(verdict);

        scanLedgerRepository.save(ledger);

        return new VerificationResponseDTO(dto.getSkuId(), riskScore, aiConfidence, verdict, message);
    }

    private boolean calculateVelocityAnomaly(double lat, double lon, LocalDateTime time, ProductRegistry product) {
        return false;
    }
}
