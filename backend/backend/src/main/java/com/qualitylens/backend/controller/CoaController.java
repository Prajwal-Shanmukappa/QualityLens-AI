package com.qualitylens.backend.controller;

import com.qualitylens.backend.service.CoaAnalysisService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/coa")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class CoaController {

    private final CoaAnalysisService coaAnalysisService;

    public CoaController(CoaAnalysisService coaAnalysisService) {
        this.coaAnalysisService = coaAnalysisService;
    }

    @PostMapping("/analyze")
    public Map<String, Object> analyzeCoa(
            @RequestParam("file") MultipartFile file) {

        Map<String, Object> response = new HashMap<>();

        try {

            // ==============================
            // STEP 1: VALIDATE FILE
            // ==============================

            if (file == null || file.isEmpty()) {

                response.put("success", false);
                response.put("message", "Please upload a PDF file.");

                return response;
            }

            String contentType = file.getContentType();

            if (contentType == null ||
                    !contentType.equalsIgnoreCase("application/pdf")) {

                response.put("success", false);
                response.put("message", "Only PDF files are allowed.");

                return response;
            }

            // ==============================
            // STEP 2: EXTRACT PDF TEXT
            // ==============================

            String extractedText;
            int pageCount;

            try (PDDocument document =
                         PDDocument.load(file.getInputStream())) {

                PDFTextStripper stripper = new PDFTextStripper();

                extractedText = stripper.getText(document);

                pageCount = document.getNumberOfPages();
            }

            // Check whether PDF contains readable text

            if (extractedText == null || extractedText.trim().isEmpty()) {

                response.put("success", false);

                response.put(
                        "message",
                        "No readable text found in PDF. This may be a scanned document."
                );

                return response;
            }

            // ==============================
            // STEP 3: AI / QUALITY ANALYSIS
            // ==============================

            Map<String, Object> qualityAnalysis =
                    coaAnalysisService.analyzeText(extractedText);

            // ==============================
            // STEP 4: EXTRACT ANALYSIS DATA
            // ==============================

            String overallStatus =
                    String.valueOf(
                            qualityAnalysis.getOrDefault(
                                    "overallStatus",
                                    "REVIEW"
                            )
                    );

            int totalParameters =
                    getIntegerValue(
                            qualityAnalysis.get("totalParameters")
                    );

            int passCount =
                    getIntegerValue(
                            qualityAnalysis.get("passCount")
                    );

            int failCount =
                    getIntegerValue(
                            qualityAnalysis.get("failCount")
                    );

            int reviewCount =
                    getIntegerValue(
                            qualityAnalysis.get("reviewCount")
                    );

            String supplier =
                    extractSupplier(extractedText);

            String batchNumber =
                    extractBatchNumber(extractedText);

            // ==============================
            // STEP 5: BUILD RESPONSE
            // ==============================

            response.put("success", true);

            response.put(
                    "fileName",
                    file.getOriginalFilename()
            );

            response.put(
                    "fileSize",
                    file.getSize()
            );

            response.put(
                    "pageCount",
                    pageCount
            );

            response.put(
                    "message",
                    "Certificate of Analysis successfully analyzed."
            );

            response.put(
                    "supplier",
                    supplier
            );

            response.put(
                    "batchNumber",
                    batchNumber
            );

            response.put(
                    "overallStatus",
                    overallStatus
            );

            response.put(
                    "totalParameters",
                    totalParameters
            );

            response.put(
                    "passCount",
                    passCount
            );

            response.put(
                    "failCount",
                    failCount
            );

            response.put(
                    "reviewCount",
                    reviewCount
            );

            response.put(
                    "extractedText",
                    extractedText
            );

            response.put(
                    "qualityAnalysis",
                    qualityAnalysis
            );

            response.put(
                    "savedToDatabase",
                    false
            );

            return response;

        } catch (IOException e) {

            response.put("success", false);

            response.put(
                    "message",
                    "Error reading PDF: " + e.getMessage()
            );

            return response;

        } catch (Exception e) {

            response.put("success", false);

            response.put(
                    "message",
                    "Analysis error: " + e.getMessage()
            );

            return response;
        }
    }

    // =========================================
    // CONVERT NUMBER TO INTEGER
    // =========================================

    private int getIntegerValue(Object value) {

        if (value instanceof Number) {
            return ((Number) value).intValue();
        }

        return 0;
    }

    // =========================================
    // EXTRACT SUPPLIER INFORMATION
    // =========================================

    private String extractSupplier(String text) {

        String[] lines = text.split("\\r?\\n");

        for (String line : lines) {

            String lowerLine = line.toLowerCase();

            if (lowerLine.contains("manufacturer")
                    || lowerLine.contains("supplier")
                    || lowerLine.contains("company name")) {

                return line.trim();
            }
        }

        return "Not detected";
    }

    // =========================================
    // EXTRACT BATCH NUMBER
    // =========================================

    private String extractBatchNumber(String text) {

        String[] lines = text.split("\\r?\\n");

        for (String line : lines) {

            String lowerLine = line.toLowerCase();

            if (lowerLine.contains("batch no")
                    || lowerLine.contains("batch number")
                    || lowerLine.contains("lot no")
                    || lowerLine.contains("lot number")) {

                return line.trim();
            }
        }

        return "Not detected";
    }
}