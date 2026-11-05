package com.embedded.repository;

import com.embedded.models.GateHistory;
import com.embedded.models.ReleaseGate;
import com.embedded.models.ReleaseGateItem;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class ReleaseGateRepository {
    private final Map<String, ReleaseGate> gates = new ConcurrentHashMap<>();
    private final Map<String, ReleaseGateItem> gateItems = new ConcurrentHashMap<>();
    private final List<GateHistory> historyEntries = Collections.synchronizedList(new ArrayList<>());

    public void saveGate(ReleaseGate gate) {
        if (gate != null && gate.getId() != null) {
            gates.put(gate.getId(), gate);
        }
    }

    public Optional<ReleaseGate> findGateById(String id) {
        return Optional.ofNullable(gates.get(id));
    }

    public List<ReleaseGate> findGatesByProjectId(String projectId) {
        return gates.values().stream()
                .filter(g -> g.getProjectId().equals(projectId))
                .sorted(Comparator.comparing(ReleaseGate::getGateType))
                .collect(Collectors.toList());
    }

    public Optional<ReleaseGate> findGateByType(String projectId, ReleaseGate.GateType type) {
        return gates.values().stream()
                .filter(g -> g.getProjectId().equals(projectId) && g.getGateType() == type)
                .findFirst();
    }

    public void saveGateItem(ReleaseGateItem item) {
        if (item != null && item.getId() != null) {
            gateItems.put(item.getId(), item);
        }
    }

    public Optional<ReleaseGateItem> findGateItemById(String id) {
        return Optional.ofNullable(gateItems.get(id));
    }

    public List<ReleaseGateItem> findItemsByGateId(String gateId) {
        return gateItems.values().stream()
                .filter(i -> i.getGateId().equals(gateId))
                .sorted(Comparator.comparingInt(ReleaseGateItem::getSequence))
                .collect(Collectors.toList());
    }

    public void saveHistory(GateHistory entry) {
        if (entry != null) {
            historyEntries.add(entry);
        }
    }

    public List<GateHistory> findHistoryByGateId(String gateId) {
        return historyEntries.stream()
                .filter(h -> h.getGateId().equals(gateId))
                .sorted(Comparator.comparing(GateHistory::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public void deleteByProjectId(String projectId) {
        List<String> gateIds = findGatesByProjectId(projectId).stream()
                .map(ReleaseGate::getId)
                .collect(Collectors.toList());
        gateIds.forEach(gates::remove);
        gateItems.values().removeIf(i -> gateIds.contains(i.getGateId()));
        historyEntries.removeIf(h -> gateIds.contains(h.getGateId()));
    }
}

