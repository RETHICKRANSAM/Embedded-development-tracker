export interface DefaultPhaseTemplate {
  name: string;
  description: string;
  sequence: number;
  checklistItems: {
    title: string;
    description?: string;
    isMandatory: boolean;
  }[];
}

export const DEFAULT_PHASES: DefaultPhaseTemplate[] = [
  {
    name: "Phase 1: Requirements and Planning",
    description: "Define objectives, architecture boundaries, hardware selection, and project setup.",
    sequence: 1,
    checklistItems: [
      { title: "Define project objective", isMandatory: true },
      { title: "Define functional requirements", isMandatory: true },
      { title: "Define hardware and software requirements", isMandatory: true },
      { title: "Select MCU/SoC and development board", isMandatory: true },
      { title: "Identify peripherals and interfaces", isMandatory: true },
      { title: "Define acceptance criteria", isMandatory: true },
      { title: "Create project repository", isMandatory: true },
      { title: "Record project risks and assumptions", isMandatory: false },
    ],
  },
  {
    name: "Phase 2: Hardware Study and Bring-up",
    description: "Datasheet study, board power-on, clock, reset, GPIO, debugger, and UART logging bring-up.",
    sequence: 2,
    checklistItems: [
      { title: "Review datasheet and reference manual", isMandatory: true },
      { title: "Verify board power supply", isMandatory: true },
      { title: "Verify clock and reset configuration", isMandatory: true },
      { title: "Verify GPIO configuration", isMandatory: true },
      { title: "Verify debugger connection", isMandatory: true },
      { title: "Verify UART logging", isMandatory: true },
      { title: "Verify required peripheral interfaces", isMandatory: true },
      { title: "Record hardware issues and observations", isMandatory: false },
    ],
  },
  {
    name: "Phase 3: Firmware Architecture and Development",
    description: "Modular architecture, build system, drivers, application logic, and error handling.",
    sequence: 3,
    checklistItems: [
      { title: "Define firmware architecture", isMandatory: true },
      { title: "Create modular project structure", isMandatory: true },
      { title: "Configure the build system", isMandatory: true },
      { title: "Implement drivers", isMandatory: true },
      { title: "Implement middleware and application logic", isMandatory: true },
      { title: "Handle errors and timeouts", isMandatory: true },
      { title: "Add logging and diagnostics", isMandatory: true },
      { title: "Review memory usage", isMandatory: false },
      { title: "Review interrupt and concurrency behavior", isMandatory: true },
      { title: "Commit changes to version control", isMandatory: true },
    ],
  },
  {
    name: "Phase 4: Unit and Integration Testing",
    description: "Module unit tests, interface verification, hardware-in-the-loop, and static analysis.",
    sequence: 4,
    checklistItems: [
      { title: "Test individual functions and modules", isMandatory: true },
      { title: "Test drivers against real hardware", isMandatory: true },
      { title: "Verify UART, SPI, I2C, ADC, PWM, DMA or other applicable interfaces", isMandatory: true },
      { title: "Verify error handling and boundary conditions", isMandatory: true },
      { title: "Test RTOS task interactions, if applicable", isMandatory: false },
      { title: "Verify communication failures and recovery", isMandatory: true },
      { title: "Run static analysis", isMandatory: false },
      { title: "Fix critical defects", isMandatory: true },
      { title: "Record test results and evidence", isMandatory: true },
    ],
  },
  {
    name: "Phase 5: System Validation and Stress Testing",
    description: "End-to-end functionality, repeated resets, power failure cycles, timing, and long-duration tests.",
    sequence: 5,
    checklistItems: [
      { title: "Verify complete system functionality", isMandatory: true },
      { title: "Test repeated startup and reset", isMandatory: true },
      { title: "Test power interruption and recovery", isMandatory: true },
      { title: "Test peripheral and communication failures", isMandatory: true },
      { title: "Measure CPU and memory usage", isMandatory: false },
      { title: "Perform a long-duration test", isMandatory: true },
      { title: "Verify timing requirements", isMandatory: true },
      { title: "Verify thermal and power behavior where relevant", isMandatory: false },
      { title: "Record known issues and limitations", isMandatory: true },
    ],
  },
  {
    name: "Phase 6: Demo or Pilot Preparation",
    description: "Version freeze, backup image, demo script, failure recovery, and release gate verification.",
    sequence: 6,
    checklistItems: [
      { title: "Freeze the demo firmware version", isMandatory: true },
      { title: "Verify the hardware configuration", isMandatory: true },
      { title: "Test the main use cases end-to-end", isMandatory: true },
      { title: "Verify startup and shutdown", isMandatory: true },
      { title: "Check logs and diagnostic messages", isMandatory: true },
      { title: "Verify recovery from expected failures", isMandatory: true },
      { title: "Prepare a known-good backup firmware image", isMandatory: true },
      { title: "Prepare setup and demonstration instructions", isMandatory: true },
      { title: "Record remaining issues", isMandatory: true },
      { title: "Complete the Product Release Gates checklist", isMandatory: true },
    ],
  },
  {
    name: "Phase 7: Post-Demo Review",
    description: "Feedback collection, bug triage, follow-up engineering tasks, and milestone roadmap.",
    sequence: 7,
    checklistItems: [
      { title: "Record demo feedback", isMandatory: true },
      { title: "Record failures and unexpected behavior", isMandatory: true },
      { title: "Create follow-up tasks", isMandatory: true },
      { title: "Document improvements", isMandatory: true },
      { title: "Decide the next development milestone", isMandatory: true },
    ],
  },
];

export interface DefaultGateTemplate {
  name: string;
  gateType: "DEMO" | "PILOT" | "PRODUCTION";
  items: {
    title: string;
    description?: string;
    isMandatory: boolean;
  }[];
}

export const DEFAULT_RELEASE_GATES: DefaultGateTemplate[] = [
  {
    name: "Gate A: Before Demo",
    gateType: "DEMO",
    items: [
      { title: "Required functionality works", isMandatory: true },
      { title: "Main use cases tested end-to-end", isMandatory: true },
      { title: "Firmware build succeeds", isMandatory: true },
      { title: "Correct firmware version identified", isMandatory: true },
      { title: "Correct hardware and wiring verified", isMandatory: true },
      { title: "Required peripherals tested", isMandatory: true },
      { title: "Startup and reset behavior verified", isMandatory: true },
      { title: "Important error conditions tested", isMandatory: true },
      { title: "No unresolved demo-blocking defects", isMandatory: true },
      { title: "Logs and diagnostics checked", isMandatory: true },
      { title: "Recovery procedure available", isMandatory: true },
      { title: "Demo setup instructions prepared", isMandatory: true },
      { title: "Backup firmware or recovery image available where applicable", isMandatory: true },
      { title: "Known limitations documented", isMandatory: true },
    ],
  },
  {
    name: "Gate B: Before Pilot Deployment",
    gateType: "PILOT",
    items: [
      { title: "All mandatory functional requirements verified", isMandatory: true },
      { title: "Required unit and integration tests passed", isMandatory: true },
      { title: "System validation completed", isMandatory: true },
      { title: "Relevant stress and long-duration tests completed", isMandatory: true },
      { title: "Power consumption verified against requirements", isMandatory: true },
      { title: "Memory usage and timing requirements verified", isMandatory: true },
      { title: "Communication-loss behavior tested", isMandatory: true },
      { title: "Power-loss recovery tested", isMandatory: true },
      { title: "Firmware update and recovery tested, if supported", isMandatory: true },
      { title: "Required security checks completed", isMandatory: true },
      { title: "Relevant environmental and EMC testing completed where required", isMandatory: false },
      { title: "No unresolved release-blocking defects", isMandatory: true },
      { title: "All exceptions and known limitations documented", isMandatory: true },
      { title: "Recovery and rollback instructions prepared", isMandatory: true },
      { title: "Pilot acceptance criteria documented", isMandatory: true },
    ],
  },
  {
    name: "Gate C: Before Production Release",
    gateType: "PRODUCTION",
    items: [
      { title: "Production firmware version frozen", isMandatory: true },
      { title: "Source revision and build configuration recorded", isMandatory: true },
      { title: "Firmware artifact checksum recorded", isMandatory: true },
      { title: "Required regression tests passed", isMandatory: true },
      { title: "Applicable compliance requirements satisfied", isMandatory: true },
      { title: "Production hardware revision confirmed", isMandatory: true },
      { title: "Manufacturing and programming procedures documented", isMandatory: true },
      { title: "Production test procedure validated", isMandatory: true },
      { title: "Device configuration and calibration procedures verified", isMandatory: true },
      { title: "Firmware recovery and servicing procedures documented", isMandatory: true },
      { title: "Release notes prepared", isMandatory: true },
      { title: "Known limitations and residual risks reviewed", isMandatory: true },
      { title: "Final release review completed", isMandatory: true },
    ],
  },
];
