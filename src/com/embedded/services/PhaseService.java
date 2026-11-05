package com.embedded.services;

import com.embedded.models.Phase;
import com.embedded.models.PhaseChecklistItem;
import com.embedded.repository.PhaseRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class PhaseService {
    private final PhaseRepository phaseRepo;

    public PhaseService(PhaseRepository phaseRepo) {
        this.phaseRepo = phaseRepo;
    }

    public List<Phase> getPhasesByProjectId(String projectId) {
        return phaseRepo.findPhasesByProjectId(projectId);
    }

    public Optional<Phase> getPhaseById(String id) {
        return phaseRepo.findPhaseById(id);
    }

    public void updatePhaseStatus(String phaseId, Phase.Status status) {
        phaseRepo.findPhaseById(phaseId).ifPresent(p -> {
            p.setStatus(status);
            phaseRepo.savePhase(p);
        });
    }

    public List<PhaseChecklistItem> getChecklistItems(String phaseId) {
        return phaseRepo.findChecklistItemsByPhaseId(phaseId);
    }

    public void updateChecklistItemStatus(String itemId, PhaseChecklistItem.Status status) {
        phaseRepo.findChecklistItemById(itemId).ifPresent(i -> {
            i.setStatus(status);
            phaseRepo.saveChecklistItem(i);
        });
    }

    public PhaseChecklistItem addCustomChecklistItem(String projectId, String phaseId,
                                                    String title, String description, boolean isMandatory) {
        int nextSeq = phaseRepo.findChecklistItemsByPhaseId(phaseId).size() + 1;
        PhaseChecklistItem item = new PhaseChecklistItem(
                UUID.randomUUID().toString(),
                projectId,
                phaseId,
                title,
                description,
                nextSeq,
                isMandatory
        );
        phaseRepo.saveChecklistItem(item);
        return item;
    }

    public double getPhaseProgress(String phaseId) {
        List<PhaseChecklistItem> items = phaseRepo.findChecklistItemsByPhaseId(phaseId);
        if (items.isEmpty()) return 100.0;
        long passed = items.stream().filter(i -> i.getStatus() == PhaseChecklistItem.Status.PASSED).count();
        return (double) passed / items.size() * 100.0;
    }
}

