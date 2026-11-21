package com.qualitylens.backend.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CoaAnalysisService {

    private static final List<String> PARAMETERS = Arrays.asList(
            "Assay",
            "pH",
            "Moisture",
            "Loss on Drying",
            "Heavy Metals",
            "Impurity",
            "Purity",
            "Appearance",
            "Density",
            "Residue on Ignition"
    );

    private static final Pattern NUMBER_PATTERN =
            Pattern.compile("-?\\d+(?:\\.\\d+)?");

    private static final Pattern RANGE_PATTERN =
            Pattern.compile(
                    "(-?\\d+(?:\\.\\d+)?)\\s*(?:-|–|—|to)\\s*(-?\\d+(?:\\.\\d+)?)",
                    Pattern.CASE_INSENSITIVE
            );

    private static final Pattern COMPARATOR_PATTERN =
            Pattern.compile(
                    "(<=|≤|>=|≥|<|>)\\s*(-?\\d+(?:\\.\\d+)?)"
            );

    private static final Pattern NMT_PATTERN =
            Pattern.compile(
                    "(?i)(?:NMT|NOT MORE THAN|MAXIMUM|MAX)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)"
            );

    private static final Pattern NLT_PATTERN =
            Pattern.compile(
                    "(?i)(?:NLT|NOT LESS THAN|MINIMUM|MIN)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)"
            );

    private static final Pattern RESULT_PATTERN =
            Pattern.compile(
                    "(?i)(?:result|actual|value|observed|test result)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)"
            );

    public Map<String, Object> analyzeText(String extractedText) {

        Map<String, Object> analysis = new LinkedHashMap<>();

        List<Map<String, Object>> results = new ArrayList<>();

        if (extractedText == null || extractedText.trim().isEmpty()) {

            analysis.put("overallStatus", "REVIEW");
            analysis.put("totalParameters", 0);
            analysis.put("passCount", 0);
            analysis.put("failCount", 0);
            analysis.put("reviewCount", 0);
            analysis.put("parameters", results);

            return analysis;
        }

        String normalizedText = normalizeText(extractedText);

        String[] lines = normalizedText.split("\\r?\\n");

        for (String parameter : PARAMETERS) {

            Map<String, Object> parameterResult =
                    analyzeParameter(parameter, lines);

            if (parameterResult != null) {
                results.add(parameterResult);
            }
        }

        int passCount = 0;
        int failCount = 0;
        int reviewCount = 0;

        for (Map<String, Object> result : results) {

            String status = String.valueOf(result.get("status"));

            if ("PASS".equals(status)) {
                passCount++;
            } else if ("FAIL".equals(status)) {
                failCount++;
            } else {
                reviewCount++;
            }
        }

        String overallStatus;

        if (failCount > 0) {
            overallStatus = "FAIL";
        } else if (reviewCount > 0) {
            overallStatus = "REVIEW";
        } else if (passCount > 0) {
            overallStatus = "PASS";
        } else {
            overallStatus = "REVIEW";
        }

        analysis.put("overallStatus", overallStatus);
        analysis.put("totalParameters", results.size());
        analysis.put("passCount", passCount);
        analysis.put("failCount", failCount);
        analysis.put("reviewCount", reviewCount);
        analysis.put("parameters", results);

        return analysis;
    }

    private String normalizeText(String text) {

        return text
                .replace('\u00A0', ' ')
                .replace("−", "-")
                .replace("–", "-")
                .replace("—", "-")
                .replace("≤", "<=")
                .replace("≥", ">=")
                .replaceAll("[ \t]+", " ")
                .trim();
    }

    private Map<String, Object> analyzeParameter(
            String parameter,
            String[] lines
    ) {

        int matchingIndex = -1;

        for (int i = 0; i < lines.length; i++) {

            if (containsParameter(lines[i], parameter)) {

                matchingIndex = i;
                break;
            }
        }

        if (matchingIndex == -1) {
            return null;
        }

        /*
         * Collect nearby lines because PDF tables sometimes
         * separate the parameter, specification and result.
         */

        StringBuilder context = new StringBuilder();

        int start = Math.max(0, matchingIndex - 1);
        int end = Math.min(lines.length - 1, matchingIndex + 2);

        for (int i = start; i <= end; i++) {

            context.append(lines[i]).append(" ");
        }

        String contextText = context.toString().trim();

        String specification =
                extractSpecification(contextText);

        String resultValue =
                extractResultValue(contextText, specification);

        String status = "REVIEW";

        String explanation =
                "Specification or measured value could not be identified.";

        if (specification != null && resultValue != null) {

            status = compareResult(resultValue, specification);

            explanation = generateExplanation(
                    parameter,
                    resultValue,
                    specification,
                    status
            );
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("parameter", parameter);

        result.put(
                "specification",
                specification != null
                        ? specification
                        : "Not identified"
        );

        result.put(
                "result",
                resultValue != null
                        ? resultValue
                        : "Not identified"
        );

        result.put("status", status);
        result.put("explanation", explanation);
        result.put("sourceLine", contextText);

        return result;
    }

    private boolean containsParameter(
            String line,
            String parameter
    ) {

        String lowerLine = line.toLowerCase();

        switch (parameter) {

            case "Assay":
                return Pattern.compile("\\bassay\\b")
                        .matcher(lowerLine)
                        .find();

            case "pH":
                return Pattern.compile("\\bp\\s*h\\b")
                        .matcher(lowerLine)
                        .find();

            case "Moisture":
                return Pattern.compile("\\bmoisture\\b")
                        .matcher(lowerLine)
                        .find();

            case "Loss on Drying":
                return lowerLine.contains("loss on drying")
                        || Pattern.compile("\\blod\\b")
                        .matcher(lowerLine)
                        .find();

            case "Heavy Metals":
                return lowerLine.contains("heavy metals")
                        || lowerLine.contains("heavy metal");

            case "Impurity":
                return lowerLine.contains("impurity")
                        || lowerLine.contains("impurities");

            case "Purity":
                return Pattern.compile("\\bpurity\\b")
                        .matcher(lowerLine)
                        .find();

            case "Appearance":
                return Pattern.compile("\\bappearance\\b")
                        .matcher(lowerLine)
                        .find();

            case "Density":
                return Pattern.compile("\\bdensity\\b")
                        .matcher(lowerLine)
                        .find();

            case "Residue on Ignition":
                return lowerLine.contains("residue on ignition");

            default:
                return false;
        }
    }

    private String extractSpecification(String text) {

        /*
         * NMT / Maximum
         */

        Matcher nmtMatcher = NMT_PATTERN.matcher(text);

        if (nmtMatcher.find()) {

            return nmtMatcher.group();
        }

        /*
         * NLT / Minimum
         */

        Matcher nltMatcher = NLT_PATTERN.matcher(text);

        if (nltMatcher.find()) {

            return nltMatcher.group();
        }

        /*
         * Mathematical comparator
         */

        Matcher comparatorMatcher =
                COMPARATOR_PATTERN.matcher(text);

        if (comparatorMatcher.find()) {

            return comparatorMatcher.group();
        }

        /*
         * Numeric range
         */

        Matcher rangeMatcher =
                RANGE_PATTERN.matcher(text);

        if (rangeMatcher.find()) {

            return rangeMatcher.group();
        }

        return null;
    }

    private String extractResultValue(
            String text,
            String specification
    ) {

        /*
         * First: explicitly labeled result.
         *
         * Example:
         * Result: 99.5
         */

        Matcher resultMatcher =
                RESULT_PATTERN.matcher(text);

        if (resultMatcher.find()) {

            return resultMatcher.group(1);
        }

        /*
         * Find all numbers in the context.
         */

        List<String> numbers = new ArrayList<>();

        Matcher numberMatcher =
                NUMBER_PATTERN.matcher(text);

        while (numberMatcher.find()) {

            numbers.add(numberMatcher.group());
        }

        if (numbers.isEmpty()) {
            return null;
        }

        /*
         * Remove numbers that belong to the specification.
         */

        List<String> specificationNumbers = new ArrayList<>();

        if (specification != null) {

            Matcher specificationMatcher =
                    NUMBER_PATTERN.matcher(specification);

            while (specificationMatcher.find()) {

                specificationNumbers.add(
                        specificationMatcher.group()
                );
            }
        }

        List<String> candidateNumbers = new ArrayList<>();

        for (String number : numbers) {

            if (!specificationNumbers.contains(number)) {

                candidateNumbers.add(number);
            }
        }

        /*
         * The final remaining number is generally
         * the measured result in a CoA table.
         */

        if (!candidateNumbers.isEmpty()) {

            return candidateNumbers.get(
                    candidateNumbers.size() - 1
            );
        }

        return null;
    }

    private String compareResult(
            String result,
            String specification
    ) {

        try {

            double actual = Double.parseDouble(result);

            String spec = specification
                    .toUpperCase()
                    .replace("NOT MORE THAN", "NMT")
                    .replace("NOT LESS THAN", "NLT")
                    .replace("MAXIMUM", "MAX")
                    .replace("MINIMUM", "MIN");

            /*
             * RANGE
             * Example: 98 - 102
             */

            Matcher rangeMatcher =
                    RANGE_PATTERN.matcher(spec);

            if (rangeMatcher.find()) {

                double minimum =
                        Double.parseDouble(rangeMatcher.group(1));

                double maximum =
                        Double.parseDouble(rangeMatcher.group(2));

                return actual >= minimum && actual <= maximum
                        ? "PASS"
                        : "FAIL";
            }

            /*
             * NMT / MAXIMUM
             */

            Matcher nmtMatcher = Pattern.compile(
                    "(NMT|MAX|NOT MORE THAN)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)"
            ).matcher(spec);

            if (nmtMatcher.find()) {

                double maximum =
                        Double.parseDouble(nmtMatcher.group(2));

                return actual <= maximum
                        ? "PASS"
                        : "FAIL";
            }

            /*
             * NLT / MINIMUM
             */

            Matcher nltMatcher = Pattern.compile(
                    "(NLT|MIN|NOT LESS THAN)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)"
            ).matcher(spec);

            if (nltMatcher.find()) {

                double minimum =
                        Double.parseDouble(nltMatcher.group(2));

                return actual >= minimum
                        ? "PASS"
                        : "FAIL";
            }

            /*
             * Comparator symbols
             */

            Matcher symbolMatcher =
                    COMPARATOR_PATTERN.matcher(spec);

            if (symbolMatcher.find()) {

                String operator =
                        symbolMatcher.group(1);

                double limit =
                        Double.parseDouble(symbolMatcher.group(2));

                switch (operator) {

                    case "<":
                    case "<=":
                    case "≤":

                        return actual <= limit
                                ? "PASS"
                                : "FAIL";

                    case ">":
                    case ">=":
                    case "≥":

                        return actual >= limit
                                ? "PASS"
                                : "FAIL";
                }
            }

        } catch (Exception e) {

            return "REVIEW";
        }

        return "REVIEW";
    }

    private String generateExplanation(
            String parameter,
            String result,
            String specification,
            String status
    ) {

        if ("PASS".equals(status)) {

            return parameter
                    + " result "
                    + result
                    + " meets specification "
                    + specification
                    + ".";
        }

        if ("FAIL".equals(status)) {

            return parameter
                    + " result "
                    + result
                    + " is outside specification "
                    + specification
                    + ".";
        }

        return "The system could not confidently compare "
                + parameter
                + " against the specification.";
    }
}