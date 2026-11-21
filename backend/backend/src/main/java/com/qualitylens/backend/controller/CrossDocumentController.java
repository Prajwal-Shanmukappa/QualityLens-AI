
package com.qualitylens.backend.controller;

import com.qualitylens.backend.service.CrossDocumentService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/coa")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class CrossDocumentController {

    private final CrossDocumentService crossDocumentService;

    public CrossDocumentController(
            CrossDocumentService crossDocumentService
    ) {
        this.crossDocumentService = crossDocumentService;
    }

    @PostMapping("/cross-verify")
    public Map<String, Object> crossVerifyDocuments(

            @RequestParam("coaFile")
            MultipartFile coaFile,

            @RequestParam("purchaseOrderFile")
            MultipartFile purchaseOrderFile

    ) {

        Map<String, Object> response = new HashMap<>();

        try {

            // Validate CoA file
            if (coaFile == null || coaFile.isEmpty()) {

                response.put("success", false);
                response.put("message", "Please upload a CoA PDF.");

                return response;
            }

            // Validate Purchase Order
            if (purchaseOrderFile == null
                    || purchaseOrderFile.isEmpty()) {

                response.put("success", false);
                response.put(
                        "message",
                        "Please upload a Purchase Order PDF."
                );

                return response;
            }

            // Validate file types
            if (!isPdf(coaFile)) {

                response.put("success", false);
                response.put(
                        "message",
                        "The CoA file must be a PDF."
                );

                return response;
            }

            if (!isPdf(purchaseOrderFile)) {

                response.put("success", false);
                response.put(
                        "message",
                        "The Purchase Order file must be a PDF."
                );

                return response;
            }

            // Perform verification
            return crossDocumentService.verifyDocuments(
                    coaFile,
                    purchaseOrderFile
            );

        } catch (Exception e) {

            response.put("success", false);
            response.put(
                    "message",
                    "Cross-document verification failed: "
                            + e.getMessage()
            );

            return response;
        }
    }

    private boolean isPdf(MultipartFile file) {

        String contentType = file.getContentType();

        return contentType != null
                && contentType.equalsIgnoreCase("application/pdf");
    }
}
