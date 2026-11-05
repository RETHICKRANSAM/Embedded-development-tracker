package com.embedded.services;

import com.embedded.models.GateFailure;
import com.embedded.models.ReleaseGateItem;
import com.embedded.models.Task;
import com.embedded.repository.GateFailureRepository;
import com.embedded.repository.ReleaseGateRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class FailureService {
    private final GateFailureRepository failureRepo;
    private final ReleaseGateRepository gateRepo;
    private final TaskService taskService;
    private final ReleaseGateService gateService;

    public FailureService(GateFailureRepository failureRepo, ReleaseGateRepository gateRepo,
                          TaskService taskService, ReleaseGateService gateService) {
        this.failureRepo = failureRepo;
        this.gateRepo = gateRepo;
        this.taskService = taskService;
        this.gateService = gateService;
    }

    public GateFailure logFailure(String gateItemId, String description,
                                 String expectedBehavior, String actualBehavior,
                                 boolean createCorrectiveTask, String projectId, String phaseId) {
        String id = UUID.randomUUID().toString();
        GateFailure failure = new GateFailure(id, gateItemId, description, expectedBehavior, actualBehavior);
        failureRepo.save(failure);

        // Mark gate item as FAILED
        gateService.updateGateItemStatus(gateItemId, ReleaseGateItem.Status.FAILED,
                "Failure logged: " + description);

        // Optionally create corrective task
        if (createCorrectiveTask && projectId != null && phaseId != null) {
            String taskTitle = "Fix Defect: " + description;
            String taskDesc = String.format("Auto-generated corrective task for failed gate check.\nExpected: %s\nActual: %s",
                    expectedBehavior, actualBehavior);
            taskService.createTask(projectId, phaseId, taskTitle, taskDesc, Task.Priority.CRITICAL, null);
        }

        return failure;
    }

    public void markFixed(String failureId, String correctiveAction) {
        failureRepo.findById(failureId).ifPresent(f -> {
            f.setCorrectiveAction(correctiveAction);
            f.setStatus(GateFailure.Status.FIXED);
            failureRepo.save(f);
        });
    }

    public void verifyRetest(String failureId, String retestResult, boolean retestPassed) {
        failureRepo.findById(failureId).ifPresent(f -> {
            f.setRetestResult(retestResult);
            if (retestPassed) {
                f.setStatus(GateFailure.Status.VERIFIED);
                // Update gate item status to PASSED
                gateService.updateGateItemStatus(f.getGateItemId(), ReleaseGateItem.Status.PASSED,
                        "Retest passed: " + retestResult);
            } else {
                f.setStatus(GateFailure.Status.OPEN);
                gateService.updateGateItemStatus(f.getGateItemId(), ReleaseGateItem.Status.FAILED,
                        "Retest failed: " + retestResult);
            }
            failureRepo.save(f);
        });
    }

    public List<GateFailure> getFailuresForItem(String gateItemId) {
        return failureRepo.findByGateItemId(gateItemId);
    }

    public List<GateFailure> getAllFailures() {
        return failureRepo.findAll();
    }
}

