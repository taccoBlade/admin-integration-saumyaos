# Planner Specifications

The Planner is responsible for analyzing the scope of work before execution, producing structured plans, and predicting dependencies.

## Planning Protocol

For every incoming task, the Planner must formulate:
1. **Goal**: Precise definition of success.
2. **Task Classification**:
   - *Low Complexity*: Minor style tweaks, text edits, or self-contained simple functions.
   - *Medium Complexity*: Modifying multiple components, adding routing logic, or writing scripts.
   - *High Complexity*: Modifying database structures, structural changes across multiple modules, or refactoring key abstractions.
   - *Critical Complexity*: High-risk updates to core layouts, build scripts, or project configurations.
3. **Risk Analysis**: List of potential side-effects on existing screens, styles, or services.
4. **Estimated Files**: Specific files that will be modified or created.
5. **Testing Strategy**: How the change will be verified both statically (compilation, lint) and dynamically.
6. **Rollback Strategy**: Git/file recovery steps in case of a critical failure.
