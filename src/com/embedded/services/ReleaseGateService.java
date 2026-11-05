package com.embedded.services;

import com.embedded.models.GateHistory;
import com.embedded.models.ReleaseGate;
import com.embedded.models.ReleaseGateItem;
import com.embedded.repository.ReleaseGateRepository;

import java.util.*;
import java.util.stream.Collectors;

public class ReleaseGateService {
    private final ReleaseGateRepository gateRepo;

    public ReleaseGateService(ReleaseGateRepository gateRepo) {
        this.gateRepo = gateRepo;
    }

    public void initializeDefaultGates(String projectId) {
        // Gate A: Before Demo
        ReleaseGate gateA = new ReleaseGate(UUID.randomUUID().toString(), projectId,
                "Gate A: Before Demo", ReleaseGate.GateType.GATE_A_DEMO);
        gateRepo.saveGate(gateA);
        addGateItems(gateA.getId(), new String[]{
            "Required functionality works",
            "Main use cases tested end-to-end",
            "Firmware build succeeds",
            "Correct firmware version identified",
            "Correct hardware and wiring verified",
            "Required peripherals tested",
            "Startup and reset behavior verified",
            "Important error conditions tested",
            "No unresolved demo-blocking defects",
            "Logs and diagnostics checked",
            "Recovery procedure available",
            "Demo setup instructions prepared",
            "Backup firmware or recovery image available",
            "Known limitations documented"
        }, true);

        // Gate B: Before Pilot Deployment
        ReleaseGate gateB = new ReleaseGate(UUID.randomUUID().toString(), projectId,
                "Gate B: Before Pilot Deployment", ReleaseGate.GateType.GATE_B_PILOT);
        gateRepo.saveGate(gateB);
        addGateItems(gateB.getId(), new String[]{
            "All mandatory functional requirements verified",
            "Required unit and integration tests passed",
            "System validation completed",
            "Relevant stress and long-duration tests completed",
            "Power consumption verified against requirements",
            "Memory usage and timing requirements verified",
            "Communication-loss behavior tested",
            "Power-loss recovery tested",
            "Firmware update and recovery tested, if supported",
            "Required security checks completed",
            "Relevant environmental and EMC testing completed",
            "No unresolved release-blocking defects",
            "All exceptions and known limitations documented",
            "Recovery and rollback instructions prepared",
            "Pilot acceptance criteria documented"
        }, true);

        // Gate C: Before Production Release
        ReleaseGate gateC = new ReleaseGate(UUID.randomUUID().toString(), projectId,
                "Gate C: Before Production Release", ReleaseGate.GateType.GATE_C_PRODUCTION);
        gateRepo.saveGate(gateC);
        addGateItems(gateC.getId(), new String[]{
            "Production firmware version frozen",
            "Source revision and build configuration recorded",
            "Firmware artifact checksum recorded",
            "Required regression tests passed",
            "Applicable compliance requirements satisfied",
            "Production hardware revision confirmed",
            "Manufacturing and programming procedures documented",
            "Production test procedure validated",
            "Device configuration and calibration procedures verified",
            "Firmware recovery and servicing procedures documented",
            "Release notes prepared",
            "Known limitations and residual risks reviewed",
            "Final release review completed"
        }, true);
    }

    private void addGateItems(String gateId, String[] titles, boolean isMandatory) {
        for (int i = 0; i < titles.length; i++) {
            ReleaseGateItem item = new ReleaseGateItem(
                    UUID.randomUUID().toString(),
                    gateId,
                    titles[i],
                    titles[i],
                    isMandatory,
                    i + 1
            );
            gateRepo.saveGateItem(item);
        }
    }

    public List<ReleaseGate> getGatesForProject(String projectId) {
        return gateRepo.findGatesByProjectId(projectId);
    }

    public Optional<ReleaseGate> getGateById(String gateId) {
        return gateRepo.findGateById(gateId);
    }

    public List<ReleaseGateItem> getGateItems(String gateId) {
        return gateRepo.findItemsByGateId(gateId);
    }

    public void updateGateItemStatus(String itemId, ReleaseGateItem.Status status, String notes) {
        gateRepo.findGateItemById(itemId).ifPresent(item -> {
            item.setStatus(status);
            if (notes != null) item.setNotes(notes);
            gateRepo.saveGateItem(item);

            // Re-evaluate parent gate status
            evaluateGateStatus(item.getGateId());
        });
    }

    public void evaluateGateStatus(String gateId) {
        gateRepo.findGateById(gateId).ifPresent(gate -> {
            if (gate.getStatus() == ReleaseGate.Status.PASSED) {
                return; // Already passed, maintain historical record
            }

            List<ReleaseGateItem> items = gateRepo.findItemsByGateId(gateId);
            boolean hasFailed = items.stream().anyMatch(i -> i.getStatus() == ReleaseGateItem.Status.FAILED || i.getStatus() == ReleaseGateItem.Status.BLOCKED);
            if (hasFailed) {
                gate.setStatus(ReleaseGate.Status.BLOCKED);
            } else {
                boolean allMandatoryPassed = items.stream()
                        .filter(ReleaseGateItem::isMandatory)
                        .allMatch(i -> i.getStatus() == ReleaseGateItem.Status.PASSED);

                if (allMandatoryPassed && !items.isEmpty()) {
                    gate.setStatus(ReleaseGate.Status.READY_FOR_REVIEW);
                } else {
                    boolean anyStarted = items.stream().anyMatch(i -> i.getStatus() != ReleaseGateItem.Status.NOT_STARTED);
                    gate.setStatus(anyStarted ? ReleaseGate.Status.IN_PROGRESS : ReleaseGate.Status.NOT_STARTED);
                }
            }
            gateRepo.saveGate(gate);
        });
    }

    public boolean passGate(String gateId, String firmwareVersion, String hardwareRevision, String reviewNote) {
        Optional<ReleaseGate> gateOpt = gateRepo.findGateById(gateId);
        if (gateOpt.isEmpty()) return false;

        ReleaseGate gate = gateOpt.get();
        List<ReleaseGateItem> items = gateRepo.findItemsByGateId(gateId);

        // Confirm all mandatory checks are PASSED
        boolean mandatoryPassed = items.stream()
                .filter(ReleaseGateItem::isMandatory)
                .allMatch(i -> i.getStatus() == ReleaseGateItem.Status.PASSED);

        if (!mandatoryPassed) {
            return false;
        }

        gate.setFirmwareVersion(firmwareVersion);
        gate.setHardwareRevision(hardwareRevision);
        gate.setReviewNote(reviewNote);
        gate.setStatus(ReleaseGate.Status.PASSED);
        gateRepo.saveGate(gate);

        // Record history event
        GateHistory history = new GateHistory(
                UUID.randomUUID().toString(),
                gateId,
                "GATE_PASSED",
                "Gate formally passed: " + reviewNote,
                firmwareVersion,
                hardwareRevision
        );
        gateRepo.saveHistory(history);

        return true;
    }

    public List<GateHistory> getGateHistory(String gateId) {
        return gateRepo.findHistoryByGateId(gateId);
    }

    public Optional<String> checkRevisionMismatchWarning(String gateId, String currentFwVersion, String currentHwRevision) {
        Optional<ReleaseGate> gateOpt = gateRepo.findGateById(gateId);
        if (gateOpt.isPresent() && gateOpt.get().getStatus() == ReleaseGate.Status.PASSED) {
            ReleaseGate gate = gateOpt.get();
            if (gate.getFirmwareVersion() != null && !gate.getFirmwareVersion().equalsIgnoreCase(currentFwVersion)) {
                return Optional.of(String.format("WARNING: Firmware version changed from %s (passed) to %s! Gate may require re-verification.",
                        gate.getFirmwareVersion(), currentFwVersion));
            }
            if (gate.getHardwareRevision() != null && !gate.getHardwareRevision().equalsIgnoreCase(currentHwRevision)) {
                return Optional.of(String.format("WARNING: Hardware revision changed from %s (passed) to %s! Gate may require re-verification.",
                        gate.getHardwareRevision(), currentHwRevision));
            }
        }
        return Optional.empty();
    }

    public void deleteByProjectId(String projectId) {
        gateRepo.deleteByProjectId(projectId);
    }
}
