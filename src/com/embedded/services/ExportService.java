package com.embedded.services;

import com.embedded.models.*;
import com.embedded.repository.*;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

public class ExportService {
    private final ProjectRepository projectRepo;
    private final PhaseRepository phaseRepo;
    private final TaskRepository taskRepo;
    private final ReleaseGateRepository gateRepo;
    private final NoteRepository noteRepo;

    public ExportService(ProjectRepository projectRepo, PhaseRepository phaseRepo,
                         TaskRepository taskRepo, ReleaseGateRepository gateRepo,
                         NoteRepository noteRepo) {
        this.projectRepo = projectRepo;
        this.phaseRepo = phaseRepo;
        this.taskRepo = taskRepo;
        this.gateRepo = gateRepo;
        this.noteRepo = noteRepo;
    }

    public String exportProjectSummaryJson(String projectId) throws IOException {
        Optional<Project> pOpt = projectRepo.findById(projectId);
        if (pOpt.isEmpty()) return "{}";

        Project p = pOpt.get();
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append(String.format("  \"id\": \"%s\",\n", p.getId()));
        sb.append(String.format("  \"name\": \"%s\",\n", p.getName()));
        sb.append(String.format("  \"projectCode\": \"%s\",\n", p.getProjectCode()));
        sb.append(String.format("  \"hardwarePlatform\": \"%s\",\n", p.getHardwarePlatform()));
        sb.append(String.format("  \"mcu\": \"%s\",\n", p.getMcu()));
        sb.append(String.format("  \"status\": \"%s\",\n", p.getStatus()));

        // Phases
        List<Phase> phases = phaseRepo.findPhasesByProjectId(projectId);
        sb.append("  \"phases\": [\n");
        for (int i = 0; i < phases.size(); i++) {
            Phase ph = phases.get(i);
            sb.append(String.format("    {\"sequence\": %d, \"name\": \"%s\", \"status\": \"%s\"}%s\n",
                    ph.getSequence(), ph.getName(), ph.getStatus(), (i < phases.size() - 1 ? "," : "")));
        }
        sb.append("  ],\n");

        // Tasks count
        List<Task> tasks = taskRepo.findByProjectId(projectId);
        sb.append(String.format("  \"totalTasks\": %d,\n", tasks.size()));

        // Release Gates
        List<ReleaseGate> gates = gateRepo.findGatesByProjectId(projectId);
        sb.append("  \"releaseGates\": [\n");
        for (int i = 0; i < gates.size(); i++) {
            ReleaseGate g = gates.get(i);
            sb.append(String.format("    {\"gateType\": \"%s\", \"name\": \"%s\", \"status\": \"%s\", \"firmware\": \"%s\"}%s\n",
                    g.getGateType(), g.getName(), g.getStatus(),
                    g.getFirmwareVersion() != null ? g.getFirmwareVersion() : "N/A",
                    (i < gates.size() - 1 ? "," : "")));
        }
        sb.append("  ]\n");
        sb.append("}\n");

        return sb.toString();
    }

    public String exportGatesCsv(String projectId) {
        StringBuilder sb = new StringBuilder();
        sb.append("Gate,Item Sequence,Checklist Item,Mandatory,Status,Notes\n");

        List<ReleaseGate> gates = gateRepo.findGatesByProjectId(projectId);
        for (ReleaseGate gate : gates) {
            List<ReleaseGateItem> items = gateRepo.findItemsByGateId(gate.getId());
            for (ReleaseGateItem item : items) {
                sb.append(String.format("\"%s\",%d,\"%s\",%b,\"%s\",\"%s\"\n",
                        gate.getName(),
                        item.getSequence(),
                        item.getTitle().replace("\"", "\"\""),
                        item.isMandatory(),
                        item.getStatus(),
                        item.getNotes() != null ? item.getNotes().replace("\"", "\"\"") : ""));
            }
        }
        return sb.toString();
    }

    public void saveToFile(String content, String filePath) throws IOException {
        File file = new File(filePath);
        if (file.getParentFile() != null) {
            file.getParentFile().mkdirs();
        }
        try (FileWriter writer = new FileWriter(file)) {
            writer.write(content);
        }
    }
}

