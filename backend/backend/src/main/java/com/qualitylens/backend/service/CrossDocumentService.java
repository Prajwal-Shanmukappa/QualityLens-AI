
package com.qualitylens.backend.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CrossDocumentService {

    public Map<String, Object> verifyDocuments(
            MultipartFile coaFile,
            MultipartFile purchaseOrderFile
    ) throws IOException {

        String coaText = extractText(coaFile);
        String poText = extractText(purchaseOrderFile);

        List<Map<String, Object>> comparisons = new ArrayList<>();

        comparisons.add(compareField(
                "Product Name",
                extractField(coaText, "product name", "product", "item name", "material name", "drug name"),
                extractField(poText, "product name", "product", "item name", "material name", "drug name")
        ));

        comparisons.add(compareField(
                "Batch Number",
                extractField(coaText, "batch number", "batch no", "batch no.", "lot number", "lot no"),
                extractField(poText, "batch number", "batch no", "batch no.", "lot number", "lot no")
        ));

        comparisons.add(compareField(
                "Supplier / Manufacturer",
                extractField(coaText, "manufacturer", "supplier", "company name", "manufactured by"),
                extractField(poText, "manufacturer", "supplier", "company name", "vendor", "seller")
        ));

        comparisons.add(compareField(
                "Quantity",
                extractField(coaText, "quantity", "net quantity", "amount"),
                extractField(poText, "quantity", "ordered quantity", "order quantity", "qty")
        ));

        comparisons.add(compareField(
                "Manufacturing Date",
                extractField(coaText, "manufacturing date", "mfg date", "date of manufacture", "manufactured on"),
                extractField(poText, "manufacturing date", "mfg date", "date of manufacture", "manufactured on")
        ));

        comparisons.add(compareField(
                "Expiry Date",
                extractField(coaText, "expiry date", "expiration date", "exp date", "expires on"),
                extractField(poText, "expiry date", "expiration date", "exp date", "expires on")
        ));

        comparisons.add(compareField(
                "Product Code",
                extractField(coaText, "product code", "item code", "material code", "sku"),
                extractField(poText, "product code", "item code", "material code", "sku")
        ));

        comparisons.add(compareField(
                "Specification",
                extractField(coaText, "specification", "spec", "standard"),
                extractField(poText, "specification", "spec", "standard")
        ));

        int matchCount = 0;
        int mismatchCount = 0;
        int reviewCount = 0;

        for (Map<String, Object> comparison : comparisons) {

            String status = String.valueOf(comparison.get("status"));

            if ("MATCH".equals(status)) {
                matchCount++;
            } else if ("MISMATCH".equals(status)) {
                mismatchCount++;
            } else {
                reviewCount++;
            }
        }

        int total = comparisons.size();

        int matchPercentage = total == 0
                ? 0
                : (int) Math.round((matchCount * 100.0) / total);

        String overallStatus;

        if (mismatchCount > 0) {
            overallStatus = "MISMATCH";
        } else if (reviewCount > 0) {
            overallStatus = "REVIEW";
        } else {
            overallStatus = "MATCH";
        }

        String recommendation;

        if (mismatchCount > 0) {
            recommendation =
                    "Document discrepancies were detected. Review all mismatched fields before approving the batch.";
        } else if (reviewCount > 0) {
            recommendation =
                    "Some fields could not be automatically verified. Manual review is recommended before approval.";
        } else {
            recommendation =
                    "All extracted fields match between the Certificate of Analysis and Purchase Order.";
        }

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("success", true);
        response.put("overallStatus", overallStatus);
        response.put("matchPercentage", matchPercentage);

        response.put("totalFields", total);
        response.put("matchCount", matchCount);
        response.put("mismatchCount", mismatchCount);
        response.put("reviewCount", reviewCount);

        response.put("coaFileName", coaFile.getOriginalFilename());
        response.put("purchaseOrderFileName", purchaseOrderFile.getOriginalFilename());

        response.put("comparisons", comparisons);
        response.put("recommendation", recommendation);

        response.put("coaExtractedText", coaText);
        response.put("purchaseOrderExtractedText", poText);

        return response;
    }

    // ==========================================
    // PDF TEXT EXTRACTION
    // ==========================================

    private String extractText(MultipartFile file) throws IOException {

        try (PDDocument document = PDDocument.load(file.getInputStream())) {

            PDFTextStripper stripper = new PDFTextStripper();

            return stripper.getText(document);
        }
    }

    // ==========================================
    // FIELD EXTRACTION
    // ==========================================

    private String extractField(String text, String... labels) {

        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        String[] lines = text.split("\\r?\\n");

        for (String line : lines) {

            String cleanLine = line.trim();

            if (cleanLine.isEmpty()) {
                continue;
            }

            for (String label : labels) {

                Pattern pattern = Pattern.compile(
                        "(?i)\\b" + Pattern.quote(label)
                                + "\\b\\s*[:=\\-]?\\s*(.+)"
                );

                Matcher matcher = pattern.matcher(cleanLine);

                if (matcher.find()) {

                    String value = matcher.group(1).trim();

                    value = value.replaceAll(
                            "^[|:;\\-\\s]+",
                            ""
                    );

                    if (!value.isEmpty()) {
                        return cleanValue(value);
                    }
                }
            }
        }

        return null;
    }

    private String cleanValue(String value) {

        value = value.trim();

        value = value.replaceAll(
                "\\s{2,}",
                " "
        );

        value = value.replaceAll(
                "[|]+",
                " "
        );

        return value.trim();
    }

    // ==========================================
    // FIELD COMPARISON
    // ==========================================

    private Map<String, Object> compareField(
            String fieldName,
            String coaValue,
            String poValue
    ) {

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("field", fieldName);

        result.put(
                "coaValue",
                coaValue != null ? coaValue : "Not identified"
        );

        result.put(
                "purchaseOrderValue",
                poValue != null ? poValue : "Not identified"
        );

        String status;
        String explanation;

        if (coaValue == null || poValue == null) {

            status = "REVIEW";

            explanation =
                    "The field could not be extracted from both documents automatically.";

        } else {

            boolean matches = valuesMatch(
                    coaValue,
                    poValue,
                    fieldName
            );

            if (matches) {

                status = "MATCH";

                explanation =
                        fieldName
                                + " matches between both documents.";

            } else {

                status = "MISMATCH";

                explanation =
                        fieldName
                                + " differs between the CoA and Purchase Order.";
            }
        }

        result.put("status", status);
        result.put("explanation", explanation);

        return result;
    }

    // ==========================================
    // NORMALIZED COMPARISON
    // ==========================================

    private boolean valuesMatch(
            String first,
            String second,
            String fieldName
    ) {

        String normalizedFirst = normalize(first);
        String normalizedSecond = normalize(second);

        if (normalizedFirst.equals(normalizedSecond)) {
            return true;
        }

        // Quantity comparison
        if ("Quantity".equals(fieldName)) {

            Double firstNumber = extractNumber(first);
            Double secondNumber = extractNumber(second);

            if (firstNumber != null && secondNumber != null) {

                if (Math.abs(firstNumber - secondNumber) < 0.0001) {

                    String firstUnit = extractUnit(first);
                    String secondUnit = extractUnit(second);

                    if (firstUnit.isEmpty() || secondUnit.isEmpty()) {
                        return true;
                    }

                    return firstUnit.equalsIgnoreCase(secondUnit);
                }
            }
        }

        // Ignore common punctuation and whitespace differences
        normalizedFirst = normalizedFirst.replaceAll(
                "[^a-z0-9]",
                ""
        );

        normalizedSecond = normalizedSecond.replaceAll(
                "[^a-z0-9]",
                ""
        );

        return normalizedFirst.equals(normalizedSecond);
    }

    private String normalize(String value) {

        if (value == null) {
            return "";
        }

        return value
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", " ")
                .replaceAll("[,;:]", "");
    }

    private Double extractNumber(String value) {

        Matcher matcher = Pattern.compile(
                "-?\\d+(?:\\.\\d+)?"
        ).matcher(value);

        if (matcher.find()) {

            try {
                return Double.parseDouble(matcher.group());
            } catch (Exception ignored) {
                return null;
            }
        }

        return null;
    }

    private String extractUnit(String value) {

        return value
                .toLowerCase()
                .replaceAll("-?\\d+(?:\\.\\d+)?", "")
                .replaceAll("[^a-z]", "")
                .trim();
    }
}
