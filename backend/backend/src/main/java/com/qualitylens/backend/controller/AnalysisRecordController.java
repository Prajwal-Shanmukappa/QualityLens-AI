package com.qualitylens.backend.controller;

import com.qualitylens.backend.model.AnalysisRecord;
import com.qualitylens.backend.repository.AnalysisRecordRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/records")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class AnalysisRecordController {

    private final AnalysisRecordRepository repository;

    public AnalysisRecordController(AnalysisRecordRepository repository) {
        this.repository = repository;
    }

    // Save a new analysis record
    @PostMapping
    public AnalysisRecord saveRecord(@RequestBody AnalysisRecord record) {

        record.setAnalysisDate(java.time.LocalDateTime.now());

        return repository.save(record);
    }

    // Get all records
    @GetMapping
    public List<AnalysisRecord> getAllRecords() {

        return repository.findAllByOrderByAnalysisDateDesc();
    }

    // Get a specific record
    @GetMapping("/{id}")
    public Optional<AnalysisRecord> getRecordById(@PathVariable String id) {

        return repository.findById(id);
    }

    // Delete a record
    @DeleteMapping("/{id}")
    public String deleteRecord(@PathVariable String id) {

        if (repository.existsById(id)) {

            repository.deleteById(id);

            return "Record deleted successfully";
        }

        return "Record not found";
    }
}