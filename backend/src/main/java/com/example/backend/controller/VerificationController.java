package com.example.backend.controller;

import com.example.backend.dto.VerificationDTO;
import com.example.backend.dto.VerificationResponseDTO;
import com.example.backend.service.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/verify/qr")
    public ResponseEntity<VerificationResponseDTO> verifyQR(@RequestBody VerificationDTO verificationDTO) {
        VerificationResponseDTO response = verificationService.processScan(verificationDTO);
        return ResponseEntity.ok(response);
    }
}
