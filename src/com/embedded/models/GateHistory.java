package com.embedded.models;

import java.time.LocalDateTime;

public class GateHistory {
    private String id;
    private String gateId;
    private String eventType;
    private String details;
    private String firmwareVersion;
    private String hardwareRevision;
    private LocalDateTime createdAt;

    public GateHistory(String id, String gateId, String eventType, String details,
                       String firmwareVersion, String hardwareRevision) {
        this.id = id;
        this.gateId = gateId;
        this.eventType = eventType;
        this.details = details;
        this.firmwareVersion = firmwareVersion;
        this.hardwareRevision = hardwareRevision;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public String getGateId() { return gateId; }
    public String getEventType() { return eventType; }
    public String getDetails() { return details; }
    public String getFirmwareVersion() { return firmwareVersion; }
    public String getHardwareRevision() { return hardwareRevision; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    @Override
    public String toString() {
        return String.format("[%s] %s: %s (FW: %s | HW: %s) at %s",
                createdAt, eventType, details,
                firmwareVersion != null ? firmwareVersion : "N/A",
                hardwareRevision != null ? hardwareRevision : "N/A",
                createdAt);
    }
}

