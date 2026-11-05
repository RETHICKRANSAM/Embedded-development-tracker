package com.embedded.services;

import com.embedded.models.*;
import com.embedded.repository.*;

import java.util.List;

public class ProgressService {
    private final TaskRepository taskRepo;
    private final PhaseRepository phaseRepo;
    private final ReleaseGateRepository gateRepo;

    public ProgressService(TaskRepository taskRepo, PhaseRepository phaseRepo, ReleaseGateRepository gateRepo) {
        this.taskRepo = taskRepo;
        this.phaseRepo = phaseRepo;
        this.gateRepo = gateRepo;
    }

    public static class ProjectMetrics {
        public int totalTasks;
        public int completedTasks;
        public int pendingTasks;
        public int blockedTasks;
        public double devTaskProgressPercent;

        public int totalGateItems;
        public int passedGateItems;
        public int failedGateItems;
        public int passedGates;
        public double releaseReadinessPercent;

        public boolean isDemoReady;
        public boolean isPilotReady;
        public boolean isProductionReady;
    }

    public ProjectMetrics calculateMetrics(String projectId) {
        ProjectMetrics m = new ProjectMetrics();

        // 1. Task Development Progress
        List<Task> tasks = taskRepo.findByProjectId(projectId);
        m.totalTasks = tasks.size();
        m.completedTasks = (int) tasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count();
        m.blockedTasks = (int) tasks.stream().filter(t -> t.getStatus() == Task.Status.BLOCKED).count();
        m.pendingTasks = m.totalTasks - m.completedTasks;
        m.devTaskProgressPercent = m.totalTasks == 0 ? 0.0 : ((double) m.completedTasks / m.totalTasks) * 100.0;

        // 2. Release Gate Readiness (strictly separate from dev tasks)
        List<ReleaseGate> gates = gateRepo.findGatesByProjectId(projectId);
        int totalItems = 0;
        int passedItems = 0;
        int failedItems = 0;
        int passedGateCount = 0;

        for (ReleaseGate gate : gates) {
            List<ReleaseGateItem> items = gateRepo.findItemsByGateId(gate.getId());
            totalItems += items.size();
            passedItems += (int) items.stream().filter(i -> i.getStatus() == ReleaseGateItem.Status.PASSED).count();
            failedItems += (int) items.stream().filter(i -> i.getStatus() == ReleaseGateItem.Status.FAILED).count();

            if (gate.getStatus() == ReleaseGate.Status.PASSED) {
                passedGateCount++;
                if (gate.getGateType() == ReleaseGate.GateType.GATE_A_DEMO) m.isDemoReady = true;
                if (gate.getGateType() == ReleaseGate.GateType.GATE_B_PILOT) m.isPilotReady = true;
                if (gate.getGateType() == ReleaseGate.GateType.GATE_C_PRODUCTION) m.isProductionReady = true;
            }
        }

        m.totalGateItems = totalItems;
        m.passedGateItems = passedItems;
        m.failedGateItems = failedItems;
        m.passedGates = passedGateCount;
        m.releaseReadinessPercent = totalItems == 0 ? 0.0 : ((double) passedItems / totalItems) * 100.0;

        return m;
    }
}

