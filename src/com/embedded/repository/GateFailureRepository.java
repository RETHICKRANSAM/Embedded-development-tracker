package com.embedded.repository;

import com.embedded.models.GateFailure;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class GateFailureRepository {
    private final Map<String, GateFailure> failures = new ConcurrentHashMap<>();

    public void save(GateFailure failure) {
        if (failure != null && failure.getId() != null) {
            failures.put(failure.getId(), failure);
        }
    }

    public Optional<GateFailure> findById(String id) {
        return Optional.ofNullable(failures.get(id));
    }

    public List<GateFailure> findByGateItemId(String gateItemId) {
        return failures.values().stream()
                .filter(f -> f.getGateItemId().equals(gateItemId))
                .sorted(Comparator.comparing(GateFailure::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<GateFailure> findByStatus(GateFailure.Status status) {
        return failures.values().stream()
                .filter(f -> f.getStatus() == status)
                .collect(Collectors.toList());
    }

    public List<GateFailure> findAll() {
        return new ArrayList<>(failures.values());
    }

    public boolean deleteById(String id) {
        return failures.remove(id) != null;
    }
}

