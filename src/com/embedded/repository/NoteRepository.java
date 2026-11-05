package com.embedded.repository;

import com.embedded.models.Note;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class NoteRepository {
    private final Map<String, Note> notes = new ConcurrentHashMap<>();

    public void save(Note note) {
        if (note != null && note.getId() != null) {
            notes.put(note.getId(), note);
        }
    }

    public Optional<Note> findById(String id) {
        return Optional.ofNullable(notes.get(id));
    }

    public List<Note> findByProjectId(String projectId) {
        return notes.values().stream()
                .filter(n -> n.getProjectId().equals(projectId))
                .sorted(Comparator.comparing(Note::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<Note> findByPhaseId(String phaseId) {
        return notes.values().stream()
                .filter(n -> phaseId != null && phaseId.equals(n.getPhaseId()))
                .sorted(Comparator.comparing(Note::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<Note> findByCategory(Note.Category category) {
        return notes.values().stream()
                .filter(n -> n.getCategory() == category)
                .collect(Collectors.toList());
    }

    public List<Note> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return findAll();
        }
        String q = query.toLowerCase();
        return notes.values().stream()
                .filter(n -> n.getTitle().toLowerCase().contains(q) ||
                        n.getContent().toLowerCase().contains(q))
                .sorted(Comparator.comparing(Note::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<Note> findAll() {
        return notes.values().stream()
                .sorted(Comparator.comparing(Note::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public boolean deleteById(String id) {
        return notes.remove(id) != null;
    }

    public void deleteByProjectId(String projectId) {
        notes.values().removeIf(n -> n.getProjectId().equals(projectId));
    }
}

