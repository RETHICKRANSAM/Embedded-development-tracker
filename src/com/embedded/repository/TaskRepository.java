package com.embedded.repository;

import com.embedded.models.Task;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class TaskRepository {
    private final Map<String, Task> tasks = new ConcurrentHashMap<>();

    public void save(Task task) {
        if (task != null && task.getId() != null) {
            tasks.put(task.getId(), task);
        }
    }

    public Optional<Task> findById(String id) {
        return Optional.ofNullable(tasks.get(id));
    }

    public List<Task> findByProjectId(String projectId) {
        return tasks.values().stream()
                .filter(t -> t.getProjectId().equals(projectId))
                .sorted(Comparator.comparing(Task::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<Task> findByPhaseId(String phaseId) {
        return tasks.values().stream()
                .filter(t -> t.getPhaseId().equals(phaseId))
                .sorted(Comparator.comparing(Task::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<Task> findByStatus(Task.Status status) {
        return tasks.values().stream()
                .filter(t -> t.getStatus() == status)
                .collect(Collectors.toList());
    }

    public List<Task> findAll() {
        return new ArrayList<>(tasks.values());
    }

    public boolean deleteById(String id) {
        return tasks.remove(id) != null;
    }

    public void deleteByProjectId(String projectId) {
        tasks.values().removeIf(t -> t.getProjectId().equals(projectId));
    }

    public int count() {
        return tasks.size();
    }
}

