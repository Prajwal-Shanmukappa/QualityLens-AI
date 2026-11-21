package com.qualitylens.backend.repository;

import com.qualitylens.backend.model.AnalysisRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AnalysisRecordRepository
        extends MongoRepository<AnalysisRecord, String> {

    List<AnalysisRecord> findAllByOrderByAnalysisDateDesc();
}