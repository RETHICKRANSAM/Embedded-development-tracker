package com.embedded.services;

import com.embedded.models.Note;
import com.embedded.repository.NoteRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

public class NoteService {
    private final NoteRepository noteRepo;

    public NoteService(NoteRepository noteRepo) {
        this.noteRepo = noteRepo;
    }

    public Note createNote(String projectId, String phaseId, String title,
                           String content, Note.Category category) {
        String id = UUID.randomUUID().toString();
        Note note = new Note(id, projectId, phaseId, title, content, category);
        noteRepo.save(note);
        return note;
    }

    public Optional<Note> getNoteById(String id) {
        return noteRepo.findById(id);
    }

    public List<Note> getNotesByProject(String projectId) {
        return noteRepo.findByProjectId(projectId);
    }

    public List<Note> getNotesByPhase(String phaseId) {
        return noteRepo.findByPhaseId(phaseId);
    }

    public List<Note> getNotesByCategory(Note.Category category) {
        return noteRepo.findByCategory(category);
    }

    public List<Note> searchNotes(String query) {
        return noteRepo.search(query);
    }

    public List<Note> filterNotes(String projectId, String phaseId, Note.Category category) {
        return noteRepo.findAll().stream()
                .filter(n -> projectId == null || projectId.equals(n.getProjectId()))
                .filter(n -> phaseId == null || phaseId.equals(n.getPhaseId()))
                .filter(n -> category == null || category == n.getCategory())
                .collect(Collectors.toList());
    }

    public void updateNote(String id, String title, String content, Note.Category category) {
        noteRepo.findById(id).ifPresent(n -> {
            if (title != null) n.setTitle(title);
            if (content != null) n.setContent(content);
            if (category != null) n.setCategory(category);
            noteRepo.save(n);
        });
    }

    public boolean deleteNote(String id) {
        return noteRepo.deleteById(id);
    }

    public List<Note> getAllNotes() {
        return noteRepo.findAll();
    }
}

