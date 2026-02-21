# Handoff Framework Examples

**Purpose**: Demonstrate framework usage across different project types and scenarios

---

## Example Projects

### 1. minimal-project/ ✅

**Purpose**: Minimal viable framework adoption (3 docs only)

**Project type**: Small static site (React + TypeScript + Vite)

**Documents**:
- `00-MASTER-INDEX.md` — Navigation & overview (~1,000 tokens)
- `01-PROJECT-STATE.md` — Metrics & quality gates (~1,500 tokens)
- `02-CRITICAL-CONTEXT.md` — Known issues & decisions (~1,500 tokens)

**Total**: ~4,000 tokens (vs ~15,000 without framework = **3.75x reduction**)

**Key insights**:
- Even small projects benefit from framework structure
- 3 core docs provide sufficient context for handoffs
- Quality gates ensure code consistency
- Auto-generation (generate-state.mts) saves manual work

**When to use this pattern**:
- Projects <5,000 LOC
- Simple tech stack (no database, no complex backend)
- Small team (1-3 developers)
- Infrequent handoffs (weekly or less)

---

### 2. full-implementation/ (Coming Soon)

**Purpose**: Complete framework adoption (10+ docs)

**Project type**: Full-stack e-commerce (React + TypeScript + Supabase + Stripe)

**Planned documents**:
- 00-MASTER-INDEX.md
- 01-PROJECT-STATE.md
- 02-CRITICAL-CONTEXT.md
- ARCHITECTURE.md
- FEATURE-STATUS.md
- TESTID-FRAMEWORK.md
- GAP-ANALYSIS.md
- DEPLOYMENT-ROADMAP.md
- [2+ more]

**Estimated total**: ~30,000 tokens (vs ~180,000 without framework = **60x reduction**)

**Key insights**:
- Large projects need comprehensive documentation
- Quality gate artifacts reduce token usage dramatically
- Subagent workflows handle specialized audits
- Migration from existing docs is straightforward

**When to use this pattern**:
- Projects >20,000 LOC
- Complex tech stack (database, backend, multiple integrations)
- Multiple teams (5+ developers)
- Frequent handoffs (daily or multiple per day)

**Note**: Will symlink to real project once one implements full framework

---

### 3. multi-agent-workflow/ ✅

**Purpose**: Multi-agent handoff with quality gates between transitions

**Scenario**: 4 agents collaborate on feature implementation

**Agents**:
1. **Agent A** (Auditor): Run quality gates → Generate artifacts
2. **Agent B** (Implementer): Fix issues → Pass artifacts to next agent
3. **Agent C** (Tester): Validate fixes → Ensure no regressions
4. **Agent D** (Deployer): Final checks → Deploy to production

**Documents**:
- 00-MASTER-INDEX.md — Multi-agent coordination overview
- 01-AGENT-A-HANDOFF.md — Auditor → Implementer (with gate results)
- 02-AGENT-B-HANDOFF.md — Implementer → Tester (with artifacts)
- 03-AGENT-C-HANDOFF.md — Tester → Deployer (with validation)
- 04-AGENT-D-COMPLETION.md — Final deployment confirmation

**Total**: ~8,000 tokens (vs ~120,000 without framework = **15x reduction**)

**Key insights**:
- Quality gates act as contracts between agents
- Artifacts (JSON reports) eliminate redundant code reading
- Each agent only reads previous agent's handoff (~2K tokens)
- Token savings compound across multiple handoffs
- Clear handoff protocol prevents miscommunication

**When to use this pattern**:
- Complex features requiring specialized agents
- High-stakes deployments (e-commerce, healthcare, finance)
- Audit trails required for compliance
- Multiple agent teams working asynchronously

---

## Quick Comparison

| Example | Project Size | Docs | Tokens | Reduction | Use Case |
|---------|--------------|------|--------|-----------|----------|
| **minimal-project** | <5K LOC | 3 | ~4K | 3.75x | Learning, prototypes |
| **full-implementation** | >20K LOC | 10+ | ~30K | 60x | Production apps |
| **multi-agent-workflow** | Any size | 5 | ~8K | 15x | Complex features |

---

## How to Use These Examples

### For Learning

1. **Start with minimal-project**
   - Read all 3 docs (10 min total)
   - Understand the template structure
   - See how quality gates integrate
   - Notice token reduction vs traditional handoff

2. **Study multi-agent-workflow**
   - See how agents pass quality gate results
   - Understand artifact-based handoffs
   - Learn handoff protocol (gate → artifact → validate)
   - Notice how token savings compound

3. **Review full-implementation** (when available)
   - See all 10 templates in action
   - Understand when to use optional docs
   - Learn subagent workflow integration
   - See maximum token reduction (60x)

### For Implementation

1. **If migrating existing project**:
   ```bash
   npx tsx .handoff-framework/scripts/migrate-existing.mts <your-project>
   # Follow MIGRATION_LOG.md instructions
   ```

2. **If starting new project**:
   ```bash
   npx tsx .handoff-framework/scripts/init-project.mts <your-project>
   # Fill in TODO placeholders
   ```

3. **Generate current state**:
   ```bash
   npx tsx .handoff-framework/scripts/generate-state.mts <your-project>
   # Auto-generates 01-PROJECT-STATE.md
   ```

4. **Validate compliance**:
   ```bash
   npx tsx .handoff-framework/scripts/validate-docs.mts <your-project>
   # Checks framework standards
   ```

---

## Example Selection Guide

**Choose minimal-project if**:
- ✅ Project <10K LOC
- ✅ Simple tech stack (frontend only)
- ✅ Infrequent handoffs (<1 per week)
- ✅ Small team (1-3 people)
- ✅ Learning/prototyping phase

**Choose full-implementation if**:
- ✅ Project >20K LOC
- ✅ Complex tech stack (database, backend, APIs)
- ✅ Frequent handoffs (daily or multiple per day)
- ✅ Large team (5+ people)
- ✅ Production deployment

**Choose multi-agent-workflow if**:
- ✅ Complex features requiring specialized agents
- ✅ Quality gates critical for success
- ✅ Audit trails required
- ✅ Multiple teams collaborating asynchronously
- ✅ High-stakes deployments

---

## Templates vs Examples

**Templates** (in `.handoff-framework/templates/`):
- Empty structures with TODO placeholders
- Generic guidance applicable to any project
- Used by automation scripts (init-project.mts)

**Examples** (in `.handoff-framework/examples/`):
- Filled-in templates with realistic content
- Specific to project type/scenario
- Demonstrate best practices
- Show expected token counts

**Relationship**:
```
Templates → (init-project.mts) → Your Project Docs
Examples → (reference) → Your Project Docs
```

---

## Contributing New Examples

**Want to add an example?**

1. Create directory: `examples/<your-example-name>/`
2. Copy templates and fill in realistic content
3. Include all quality gate integration
4. Document token counts (before/after)
5. Add entry to this README
6. Submit PR with example

**Good example candidates**:
- SaaS application (subscription, billing)
- Mobile app (React Native)
- API-only backend (Node.js/Express)
- WordPress plugin
- Chrome extension
- CLI tool

---

## Questions?

**For conceptual questions**: See `.handoff-framework/README.md`  
**For technical questions**: See `.handoff-framework/HANDOFF_PROTOCOL.md`  
**For script usage**: See `.handoff-framework/scripts/README.md`

---

**Last updated**: 2026-02-14  
**Framework version**: 1.0.0
