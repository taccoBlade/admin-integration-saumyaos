# Engineering Workflow Lifecycle

All operations in the workspace follow this sequential pipeline:

```
[Receive Prompt]
       ↓
[Task Classification]
       ↓
[Graph Retrieval]
       ↓
[Context Loading]
       ↓
[Planning]
       ↓
[Execution]
       ↓
[Static Validation]
       ↓
[AI Review & Scoring]
       ↓
[Sync & Doc Update]
```

## Phase Specifications

1. **Receive Prompt**: User states objective.
2. **Task Classification**: Assign complexity rating.
3. **Graph Retrieval**: Run query on dependency graph.
4. **Context Loading**: Inject only required memory domains and files.
5. **Planning**: Create implementation plan.
6. **Execution**: Implement the changes.
7. **Static Validation**: Run linter, compiler checks, and tests.
8. **AI Review**: Assess quality against standards.
9. **Sync**: Write task history, patch memory, and update graph if needed.
