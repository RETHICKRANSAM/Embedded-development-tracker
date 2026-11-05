package com.embedded.repository;

import com.embedded.models.Phase;
import com.embedded.models.PhaseChecklistItem;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class PhaseRepository {
    private final Map<String, Phase> phases = new ConcurrentHashMap<>();
    private final Map<String, PhaseChecklistItem> checklistItems = new ConcurrentHashMap<>();

    public void savePhase(Phase phase) {
        if (phase != null && phase.getId() != null) {
            phases.put(phase.getId(), phase);
        }
    }

    public Optional<Phase> findPhaseById(String id) {
        return Optional.ofNullable(phases.get(id));
    }

    public List<Phase> findPhasesByProjectId(String projectId) {
        return phases.values().stream()
                .filter(p -> p.getProjectId().equals(projectId))
                .sorted(Comparator.comparingInt(Phase::getSequence))
                .collect(Collectors.toList());
    }

    public void saveChecklistItem(PhaseChecklistItem item) {
        if (item != null && item.getId() != null) {
            checklistItems.put(item.getId(), item);
        }
    }

    public Optional<PhaseChecklistItem> findChecklistItemById(String id) {
        return Optional.ofNullable(checklistItems.get(id));
    }

    public List<PhaseChecklistItem> findChecklistItemsByPhaseId(String phaseId) {
        return checklistItems.values().stream()
                .filter(i -> i.getPhaseId().equals(phaseId))
                .sorted(Comparator.comparingInt(PhaseChecklistItem::getSequence))
                .collect(Collectors.toList());
    }

    public List<PhaseChecklistItem> findChecklistItemsByProjectId(String projectId) {
        return checklistItems.values().stream()
                .filter(i -> i.getProjectId().equals(projectId))
                .sorted(Comparator.comparingInt(PhaseChecklistItem::getSequence))
                .collect(Collectors.toList());
    }

    public boolean deleteChecklistItem(String id) {
        return checklistItems.remove(id) != null;
    }

    public void deleteByProjectId(String projectId) {
        List<String> phaseIds = findPhasesByProjectId(projectId).stream()
                .map(Phase::getId)
                .collect(Collectors.toList());
        phaseIds.forEach(phases::remove);
        checklistItems.values().removeIf(i -> i.getProjectId().equals(projectId));
    }
}

