package com.embedded.services;

import com.embedded.models.Task;
import com.embedded.models.TaskChecklistItem;
import com.embedded.repository.TaskRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

public class TaskService {
    private final TaskRepository taskRepo;

    public TaskService(TaskRepository taskRepo) {
        this.taskRepo = taskRepo;
    }

    public Task createTask(String projectId, String phaseId, String title,
                           String description, Task.Priority priority, String dueDate) {
        String id = UUID.randomUUID().toString();
        Task task = new Task(id, projectId, phaseId, title, description, priority, dueDate);
        taskRepo.save(task);
        return task;
    }

    public Optional<Task> getTaskById(String id) {
        return taskRepo.findById(id);
    }

    public List<Task> getTasksByProjectId(String projectId) {
        return taskRepo.findByProjectId(projectId);
    }

    public List<Task> getTasksByPhaseId(String phaseId) {
        return taskRepo.findByPhaseId(phaseId);
    }

    public List<Task> getBlockedTasks(String projectId) {
        return taskRepo.findByProjectId(projectId).stream()
                .filter(t -> t.getStatus() == Task.Status.BLOCKED)
                .collect(Collectors.toList());
    }

    public void updateTaskStatus(String taskId, Task.Status status) {
        taskRepo.findById(taskId).ifPresent(t -> {
            t.setStatus(status);
            taskRepo.save(t);
        });
    }

    public void addChecklistItem(String taskId, String title) {
        taskRepo.findById(taskId).ifPresent(t -> {
            int seq = t.getChecklistItems().size() + 1;
            TaskChecklistItem item = new TaskChecklistItem(UUID.randomUUID().toString(), taskId, title, seq);
            t.addChecklistItem(item);
            taskRepo.save(t);
        });
    }

    public void toggleChecklistItem(String taskId, String itemId) {
        taskRepo.findById(taskId).ifPresent(t -> {
            for (TaskChecklistItem item : t.getChecklistItems()) {
                if (item.getId().equals(itemId)) {
                    item.setCompleted(!item.isCompleted());
                    break;
                }
            }
            taskRepo.save(t);
        });
    }

    public boolean deleteTask(String taskId) {
        return taskRepo.deleteById(taskId);
    }

    public List<Task> getAllTasks() {
        return taskRepo.findAll();
    }
}

