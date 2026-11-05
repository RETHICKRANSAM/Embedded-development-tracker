package com.embedded.repository;

import com.embedded.models.Project;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class ProjectRepository {
    private final Map<String, Project> projects = new ConcurrentHashMap<>();

    public void save(Project project) {
        if (project != null && project.getId() != null) {
            projects.put(project.getId(), project);
        }
    }

    public Optional<Project> findById(String id) {
        return Optional.ofNullable(projects.get(id));
    }

    public Optional<Project> findByCode(String code) {
        return projects.values().stream()
                .filter(p -> p.getProjectCode().equalsIgnoreCase(code))
                .findFirst();
    }

    public List<Project> findAll() {
        return projects.values().stream()
                .sorted(Comparator.comparing(Project::getCreatedAt))
                .collect(Collectors.toList());
    }

    public List<Project> findByStatus(Project.Status status) {
        return projects.values().stream()
                .filter(p -> p.getStatus() == status)
                .collect(Collectors.toList());
    }

    public boolean deleteById(String id) {
        return projects.remove(id) != null;
    }

    public int count() {
        return projects.size();
    }
}
