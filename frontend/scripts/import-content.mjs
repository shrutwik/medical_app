import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const TABLE_KEYS = [
  'systems',
  'conditions',
  'cases',
  'caseDetails',
  'sections',
  'mechanisms',
  'resources',
  'quizzes',
  'checkpoints',
];

const SECTION_TYPES = new Set([
  'narrative',
  'histology',
  'pathology',
  'physiology',
  'pharmacology',
  'mechanism',
  'treatment',
  'clinicalPearl',
]);

function slugify(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, value);
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeHotspot(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  const id = String(raw.id ?? '').trim();
  const label = String(raw.label ?? '').trim();
  const shape = raw.shape === 'circle' ? 'circle' : 'rect';
  if (!id || !label) return undefined;
  const out = {
    id,
    label,
    shape,
    description: raw.description ? String(raw.description).trim() : undefined,
    linkedStepIndex:
      raw.linkedStepIndex !== undefined && raw.linkedStepIndex !== null
        ? Number(raw.linkedStepIndex)
        : undefined,
    linkedTabKey: raw.linkedTabKey ? String(raw.linkedTabKey).trim() : undefined,
  };
  if (Number.isNaN(out.linkedStepIndex)) delete out.linkedStepIndex;
  if (shape === 'rect' && raw.rect && typeof raw.rect === 'object') {
    const { x, y, w, h } = raw.rect;
    if ([x, y, w, h].every((n) => typeof n === 'number' && !Number.isNaN(n))) {
      out.rect = { x, y, w, h };
    }
  }
  if (shape === 'circle' && raw.circle && typeof raw.circle === 'object') {
    const { cx, cy, r } = raw.circle;
    if ([cx, cy, r].every((n) => typeof n === 'number' && !Number.isNaN(n))) {
      out.circle = { cx, cy, r };
    }
  }
  if (shape === 'rect' && !out.rect) return undefined;
  if (shape === 'circle' && !out.circle) return undefined;
  return out;
}

function normalizeAnimation(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  const kind = String(raw.kind ?? '').trim();
  const url = String(raw.url ?? '').trim();
  if (!/^https?:\/\//i.test(url)) return undefined;
  if (!['gif', 'lottie', 'video'].includes(kind)) return undefined;
  const out = {
    kind,
    url,
    autoplay: typeof raw.autoplay === 'boolean' ? raw.autoplay : undefined,
    durationMs:
      raw.durationMs !== undefined && raw.durationMs !== null ? Number(raw.durationMs) : undefined,
    posterUrl:
      raw.posterUrl && /^https?:\/\//i.test(String(raw.posterUrl).trim())
        ? String(raw.posterUrl).trim()
        : undefined,
  };
  if (Number.isNaN(out.durationMs)) delete out.durationMs;
  return out;
}

function normalizeSectionIllustrations(rawItem) {
  if (Array.isArray(rawItem.illustrations)) {
    const list = rawItem.illustrations
      .map((item) => {
        const url = String(item?.url ?? '').trim();
        if (!/^https?:\/\//i.test(url)) return null;
        const entry = {
          url,
          caption: item?.caption ? String(item.caption).trim() : undefined,
        };
        if (Array.isArray(item.hotspots)) {
          const hotspots = item.hotspots.map(normalizeHotspot).filter(Boolean);
          if (hotspots.length) entry.hotspots = hotspots;
        }
        const anim = normalizeAnimation(item.animation);
        if (anim) entry.animation = anim;
        return entry;
      })
      .filter(Boolean);
    return list.length ? list : undefined;
  }
  const single = rawItem.illustrationUrl ? String(rawItem.illustrationUrl).trim() : '';
  if (/^https?:\/\//i.test(single)) {
    const entry = {
      url: single,
      caption: rawItem.illustrationCaption ? String(rawItem.illustrationCaption).trim() : undefined,
    };
    const anim = normalizeAnimation(rawItem.animation);
    if (anim) entry.animation = anim;
    return [entry];
  }
  return undefined;
}

function parseSteps(value) {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        const illustrationUrl =
          item.illustrationUrl && /^https?:\/\//i.test(String(item.illustrationUrl).trim())
            ? String(item.illustrationUrl).trim()
            : undefined;
        const illustrationCaption =
          illustrationUrl && item.illustrationCaption
            ? String(item.illustrationCaption).trim()
            : undefined;
        const base = {
          stepNumber: Number(item.stepNumber ?? index + 1),
          label: String(item.label ?? '').trim(),
          description: String(item.description ?? '').trim(),
        };
        if (illustrationUrl) {
          base.illustrationUrl = illustrationUrl;
          if (illustrationCaption) base.illustrationCaption = illustrationCaption;
        }
        if (item.hotspotId && String(item.hotspotId).trim()) {
          base.hotspotId = String(item.hotspotId).trim();
        }
        return base;
      })
      .filter((item) => item.label && item.description);
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => ({
        stepNumber: index + 1,
        label: `Step ${index + 1}`,
        description: line,
      }));
  }

  return [];
}

function addIssue(issues, issue) {
  issues.push(issue);
}

function uniqueId(existing, desired, issues, sourceId) {
  let candidate = desired || `item_${existing.size + 1}`;
  if (!existing.has(candidate)) {
    existing.add(candidate);
    return candidate;
  }

  addIssue(issues, {
    level: 'warning',
    code: 'duplicate_id',
    message: `Duplicate id "${candidate}" encountered. A suffix was added.`,
    sourceId,
  });

  let suffix = 2;
  while (existing.has(`${candidate}_${suffix}`)) {
    suffix += 1;
  }
  candidate = `${candidate}_${suffix}`;
  existing.add(candidate);
  return candidate;
}

function resolveByRef(items, ref, labelField = 'name') {
  if (!ref) return undefined;
  return items.find((item) => item.id === ref || item[labelField] === ref || item.title === ref);
}

function createDataset() {
  return {
    systems: [],
    conditions: [],
    cases: [],
    caseDetails: [],
    sections: [],
    mechanisms: [],
    resources: [],
    quizzes: [],
    checkpoints: [],
  };
}

function buildBatch(batchDir) {
  const workingDir = path.join(batchDir, 'working');
  const meta = readJson(path.join(workingDir, 'import_batch.json'), {
    batchId: slugify(path.basename(batchDir)),
    title: path.basename(batchDir),
    defaultPublishStatus: 'draft',
    defaultDifficulty: 'medium',
  });

  return {
    meta,
    systems: readJson(path.join(workingDir, 'systems.json'), []),
    conditions: readJson(path.join(workingDir, 'conditions.json'), []),
    cases: readJson(path.join(workingDir, 'cases.json'), []),
    caseDetails: readJson(path.join(workingDir, 'case_details.json'), []),
    sourceItems: readJson(path.join(workingDir, 'source_items.json'), []),
  };
}

function normalizeBatch(batch) {
  const dataset = createDataset();
  const issues = [];
  const unresolvedItems = [];

  const systemIds = new Set();
  const conditionIds = new Set();
  const caseIds = new Set();
  const sectionIds = new Set();
  const mechanismIds = new Set();
  const resourceIds = new Set();
  const quizIds = new Set();
  const checkpointIds = new Set();

  for (const rawSystem of batch.systems) {
    if (!rawSystem?.name) {
      addIssue(issues, {
        level: 'error',
        code: 'missing_required_field',
        message: 'System is missing a name.',
      });
      continue;
    }

    const id = uniqueId(systemIds, rawSystem.id || slugify(rawSystem.name), issues);
    dataset.systems.push({
      id,
      name: String(rawSystem.name).trim(),
    });
  }

  for (const rawCondition of batch.conditions) {
    const resolvedSystem = resolveByRef(dataset.systems, rawCondition.systemRef || rawCondition.systemId);
    if (!rawCondition?.name || !resolvedSystem) {
      addIssue(issues, {
        level: 'error',
        code: resolvedSystem ? 'missing_required_field' : 'missing_system',
        message: resolvedSystem
          ? `Condition "${rawCondition?.name ?? '(unnamed)'}" is missing a required field.`
          : `Condition "${rawCondition?.name ?? '(unnamed)'}" could not resolve its system.`,
      });
      continue;
    }

    const id = uniqueId(conditionIds, rawCondition.id || slugify(rawCondition.name), issues);
    dataset.conditions.push({
      id,
      systemId: resolvedSystem.id,
      name: String(rawCondition.name).trim(),
      summary: String(rawCondition.summary ?? '').trim(),
      learningGoals: toArray(rawCondition.learningGoals),
    });
  }

  for (const rawCase of batch.cases) {
    const resolvedCondition = resolveByRef(dataset.conditions, rawCase.conditionRef || rawCase.conditionId);
    if (!rawCase?.title || !resolvedCondition || !rawCase.shortDescription) {
      addIssue(issues, {
        level: 'error',
        code: resolvedCondition ? 'missing_required_field' : 'missing_condition',
        message: resolvedCondition
          ? `Case "${rawCase?.title ?? '(unnamed)'}" is missing title, condition, or short description.`
          : `Case "${rawCase?.title ?? '(unnamed)'}" could not resolve its condition.`,
      });
      continue;
    }

    const id = uniqueId(caseIds, rawCase.id || slugify(rawCase.title), issues);
    dataset.cases.push({
      id,
      conditionId: resolvedCondition.id,
      title: String(rawCase.title).trim(),
      shortDescription: String(rawCase.shortDescription).trim(),
      difficulty: String(rawCase.difficulty ?? batch.meta.defaultDifficulty ?? 'medium').trim(),
      tags: toArray(rawCase.tags),
      publishStatus: rawCase.publishStatus ?? batch.meta.defaultPublishStatus ?? 'draft',
      updatedAt: new Date().toISOString(),
      isFoundationCase: Boolean(rawCase.isFoundationCase),
    });
  }

  const foundationCaseByCondition = new Map(
    dataset.cases
      .filter((item) => item.isFoundationCase)
      .map((item) => [item.conditionId, item]),
  );

  for (const rawDetail of batch.caseDetails) {
    const resolvedCase = resolveByRef(dataset.cases, rawDetail.caseRef || rawDetail.caseId, 'title');
    if (!resolvedCase) {
      addIssue(issues, {
        level: 'error',
        code: 'missing_case',
        message: `Case detail could not resolve its case.`,
      });
      continue;
    }

    dataset.caseDetails.push({
      caseId: resolvedCase.id,
      clinicalNarrative: {
        presentation: String(rawDetail.clinicalNarrative?.presentation ?? '').trim(),
        history: String(rawDetail.clinicalNarrative?.history ?? '').trim(),
        vitals: rawDetail.clinicalNarrative?.vitals ?? {},
        exam: String(rawDetail.clinicalNarrative?.exam ?? '').trim(),
        discussionPrompts: Array.isArray(rawDetail.clinicalNarrative?.discussionPrompts)
          ? rawDetail.clinicalNarrative.discussionPrompts.map((item) => String(item).trim()).filter(Boolean)
          : [],
      },
      diagnosis: {
        name: String(rawDetail.diagnosis?.name ?? '').trim(),
        keyFindings: Array.isArray(rawDetail.diagnosis?.keyFindings)
          ? rawDetail.diagnosis.keyFindings.map((item) => String(item).trim()).filter(Boolean)
          : [],
        tests: Array.isArray(rawDetail.diagnosis?.tests)
          ? rawDetail.diagnosis.tests.map((test) => ({
              name: String(test.name ?? '').trim(),
              result: String(test.result ?? '').trim(),
              interpretation: String(test.interpretation ?? '').trim(),
            }))
          : [],
      },
      treatment: {
        plan: String(rawDetail.treatment?.plan ?? '').trim(),
        medications: Array.isArray(rawDetail.treatment?.medications)
          ? rawDetail.treatment.medications.map((med) => ({
              name: String(med.name ?? '').trim(),
              class: String(med.class ?? '').trim(),
              role: String(med.role ?? '').trim(),
            }))
          : [],
        followUp: String(rawDetail.treatment?.followUp ?? '').trim(),
        outcome: String(rawDetail.treatment?.outcome ?? '').trim(),
      },
    });
  }

  const sectionOrderCounters = new Map();

  for (const rawItem of batch.sourceItems) {
    const system = resolveByRef(dataset.systems, rawItem.systemRef);
    const condition = resolveByRef(dataset.conditions, rawItem.conditionRef);
    const explicitCase = resolveByRef(dataset.cases, rawItem.caseRef, 'title');
    const fallbackCase = condition ? foundationCaseByCondition.get(condition.id) : undefined;
    const resolvedCase = explicitCase ?? fallbackCase;

    const mapped = {
      ...rawItem,
      id: rawItem.sourceId || slugify(rawItem.title || rawItem.prompt || rawItem.body || rawItem.contentType),
      systemId: system?.id,
      conditionId: condition?.id,
      caseId: resolvedCase?.id,
      resolved: Boolean(condition && resolvedCase),
    };

    if (!condition) {
      addIssue(issues, {
        level: 'error',
        code: 'missing_condition',
        message: `Source item "${rawItem.title ?? rawItem.prompt ?? rawItem.sourceId ?? '(untitled)'}" could not resolve its condition.`,
        sourceId: rawItem.sourceId,
        itemTitle: rawItem.title ?? rawItem.prompt,
      });
      unresolvedItems.push(mapped);
      continue;
    }

    if (!resolvedCase) {
      addIssue(issues, {
        level: 'error',
        code: explicitCase ? 'missing_case' : 'missing_foundation_case',
        message: explicitCase
          ? `Source item "${rawItem.title ?? rawItem.prompt ?? rawItem.sourceId ?? '(untitled)'}" could not resolve its case.`
          : `No foundation case exists for condition "${condition.name}" to absorb broad content.`,
        sourceId: rawItem.sourceId,
        itemTitle: rawItem.title ?? rawItem.prompt,
      });
      unresolvedItems.push(mapped);
      continue;
    }

    const titleBase = rawItem.title || rawItem.prompt || rawItem.body || rawItem.sourceId || rawItem.contentType;

    if (rawItem.contentType === 'section') {
      const sectionType = SECTION_TYPES.has(rawItem.sectionType) ? rawItem.sectionType : 'narrative';
      const content = String(rawItem.body ?? rawItem.explanation ?? '').trim();
      if (!titleBase || !content) {
        addIssue(issues, {
          level: 'error',
          code: 'missing_required_field',
          message: `Section item "${rawItem.sourceId ?? '(untitled)'}" needs a title and body.`,
          sourceId: rawItem.sourceId,
          itemTitle: rawItem.title,
        });
        unresolvedItems.push(mapped);
        continue;
      }
      const orderKey = `${resolvedCase.id}:${sectionType}`;
      const nextOrder = rawItem.order ?? ((sectionOrderCounters.get(orderKey) ?? 0) + 1);
      sectionOrderCounters.set(orderKey, nextOrder);
      const illustrations = normalizeSectionIllustrations(rawItem);
      const sectionRow = {
        id: uniqueId(sectionIds, mapped.id || slugify(`${resolvedCase.id}_${titleBase}`), issues, rawItem.sourceId),
        caseId: resolvedCase.id,
        type: sectionType,
        title: String(titleBase).trim(),
        content,
        order: nextOrder,
        tags: toArray(rawItem.tags),
      };
      if (illustrations?.length) {
        sectionRow.illustrations = illustrations;
      }
      dataset.sections.push(sectionRow);
      continue;
    }

    if (rawItem.contentType === 'quiz') {
      const question = String(rawItem.prompt ?? rawItem.title ?? '').trim();
      const options = toArray(rawItem.options);
      const answerIndex = Number(rawItem.answerIndex);
      if (!question || options.length < 2 || Number.isNaN(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
        addIssue(issues, {
          level: 'error',
          code: 'invalid_quiz',
          message: `Quiz item "${rawItem.sourceId ?? '(untitled)'}" needs a prompt, valid options, and an answer index.`,
          sourceId: rawItem.sourceId,
          itemTitle: rawItem.title ?? rawItem.prompt,
        });
        unresolvedItems.push(mapped);
        continue;
      }
      dataset.quizzes.push({
        id: uniqueId(quizIds, mapped.id || slugify(`${resolvedCase.id}_${question}`), issues, rawItem.sourceId),
        caseId: resolvedCase.id,
        sectionType: rawItem.sectionType || rawItem.targetTab || 'narrative',
        question,
        options,
        answerIndex,
        explanation: String(rawItem.explanation ?? rawItem.body ?? '').trim(),
        tags: toArray(rawItem.tags),
      });
      continue;
    }

    if (rawItem.contentType === 'checkpoint') {
      const prompt = String(rawItem.prompt ?? rawItem.body ?? '').trim();
      if (!titleBase || !prompt) {
        addIssue(issues, {
          level: 'error',
          code: 'missing_required_field',
          message: `Checkpoint item "${rawItem.sourceId ?? '(untitled)'}" needs a title and prompt.`,
          sourceId: rawItem.sourceId,
          itemTitle: rawItem.title ?? rawItem.prompt,
        });
        unresolvedItems.push(mapped);
        continue;
      }
      dataset.checkpoints.push({
        id: uniqueId(checkpointIds, mapped.id || slugify(`${resolvedCase.id}_${titleBase}`), issues, rawItem.sourceId),
        caseId: resolvedCase.id,
        tabKey: rawItem.targetTab || rawItem.sectionType || 'overview',
        title: String(titleBase).trim(),
        prompt,
        hint: String(rawItem.hint ?? '').trim(),
        answer: String(rawItem.explanation ?? rawItem.body ?? '').trim(),
      });
      continue;
    }

    if (rawItem.contentType === 'resource') {
      if (!titleBase) {
        addIssue(issues, {
          level: 'error',
          code: 'missing_required_field',
          message: `Resource item "${rawItem.sourceId ?? '(untitled)'}" needs a title.`,
          sourceId: rawItem.sourceId,
          itemTitle: rawItem.title,
        });
        unresolvedItems.push(mapped);
        continue;
      }
      dataset.resources.push({
        id: uniqueId(resourceIds, mapped.id || slugify(`${resolvedCase.id}_${titleBase}`), issues, rawItem.sourceId),
        caseId: resolvedCase.id,
        sectionType: rawItem.sectionType || rawItem.targetTab || 'narrative',
        type: rawItem.resourceType || 'reference',
        title: String(titleBase).trim(),
        description: String(rawItem.body ?? rawItem.explanation ?? '').trim(),
        caption: String(rawItem.caption ?? '').trim(),
        sourceType: String(rawItem.sourceType ?? 'external').trim(),
        sourceReference: {
          fileName: String(rawItem.sourceFileName ?? '').trim(),
          pageNumber: Number(rawItem.sourcePageNumber ?? 0),
        },
        assetKey: String(rawItem.assetKey ?? slugify(titleBase)).trim(),
        externalUrl: rawItem.externalUrl ? String(rawItem.externalUrl).trim() : undefined,
        thumbnailUrl:
          rawItem.thumbnailUrl && /^https?:\/\//i.test(String(rawItem.thumbnailUrl).trim())
            ? String(rawItem.thumbnailUrl).trim()
            : undefined,
        tags: toArray(rawItem.tags),
      });
      continue;
    }

    if (rawItem.contentType === 'mechanism') {
      const steps = parseSteps(rawItem.steps ?? rawItem.body);
      if (!titleBase || steps.length === 0) {
        addIssue(issues, {
          level: 'error',
          code: 'missing_required_field',
          message: `Mechanism item "${rawItem.sourceId ?? '(untitled)'}" needs a title and at least one step.`,
          sourceId: rawItem.sourceId,
          itemTitle: rawItem.title,
        });
        unresolvedItems.push(mapped);
        continue;
      }
      const mechanismRow = {
        id: uniqueId(mechanismIds, mapped.id || slugify(`${resolvedCase.id}_${titleBase}`), issues, rawItem.sourceId),
        caseId: resolvedCase.id,
        title: String(titleBase).trim(),
        relatedDrug: String(rawItem.relatedDrug ?? '').trim(),
        steps,
      };
      if (rawItem.diagramUrl && /^https?:\/\//i.test(String(rawItem.diagramUrl).trim())) {
        mechanismRow.diagramUrl = String(rawItem.diagramUrl).trim();
        if (rawItem.diagramCaption) {
          mechanismRow.diagramCaption = String(rawItem.diagramCaption).trim();
        }
      }
      if (Array.isArray(rawItem.diagramHotspots)) {
        const diagramHotspots = rawItem.diagramHotspots.map(normalizeHotspot).filter(Boolean);
        if (diagramHotspots.length) mechanismRow.diagramHotspots = diagramHotspots;
      }
      const diagAnim = normalizeAnimation(rawItem.diagramAnimation);
      if (diagAnim) mechanismRow.diagramAnimation = diagAnim;
      dataset.mechanisms.push(mechanismRow);
      continue;
    }

    addIssue(issues, {
      level: 'error',
      code: 'unsupported_content_type',
      message: `Unsupported content type "${rawItem.contentType}".`,
      sourceId: rawItem.sourceId,
      itemTitle: rawItem.title,
    });
    unresolvedItems.push(mapped);
  }

  const report = {
    batchId: batch.meta.batchId,
    title: batch.meta.title,
    generatedAt: new Date().toISOString(),
    summary: {
      systems: dataset.systems.length,
      conditions: dataset.conditions.length,
      cases: dataset.cases.length,
      caseDetails: dataset.caseDetails.length,
      sections: dataset.sections.length,
      mechanisms: dataset.mechanisms.length,
      resources: dataset.resources.length,
      quizzes: dataset.quizzes.length,
      checkpoints: dataset.checkpoints.length,
      issues: issues.length,
      unresolvedItems: unresolvedItems.length,
    },
    issues,
    unresolvedItems,
  };

  return { dataset, report };
}

function renderMarkdownReport(report) {
  return [
    `# Import Report: ${report.title}`,
    '',
    `- Batch ID: \`${report.batchId}\``,
    `- Generated At: ${report.generatedAt}`,
    `- Systems: ${report.summary.systems}`,
    `- Conditions: ${report.summary.conditions}`,
    `- Cases: ${report.summary.cases}`,
    `- Case Details: ${report.summary.caseDetails}`,
    `- Sections: ${report.summary.sections}`,
    `- Mechanisms: ${report.summary.mechanisms}`,
    `- Resources: ${report.summary.resources}`,
    `- Quizzes: ${report.summary.quizzes}`,
    `- Checkpoints: ${report.summary.checkpoints}`,
    `- Issues: ${report.summary.issues}`,
    `- Unresolved Items: ${report.summary.unresolvedItems}`,
    '',
    '## Issues',
    '',
    ...(report.issues.length === 0
      ? ['No issues found.']
      : report.issues.map(
          (issue) =>
            `- [${issue.level.toUpperCase()}] ${issue.code}: ${issue.message}${issue.sourceId ? ` (source: ${issue.sourceId})` : ''}`,
        )),
  ].join('\n');
}

function syncMock(dataset, projectRoot) {
  const mockDir = path.join(projectRoot, 'mock');
  ensureDir(mockDir);
  writeJson(path.join(mockDir, 'systems.json'), dataset.systems);
  writeJson(path.join(mockDir, 'conditions.json'), dataset.conditions);
  writeJson(path.join(mockDir, 'cases.json'), dataset.cases.map(({ publishStatus, updatedAt, ...item }) => item));
  writeJson(path.join(mockDir, 'case_details.json'), dataset.caseDetails);
  writeJson(path.join(mockDir, 'sections.json'), dataset.sections);
  writeJson(path.join(mockDir, 'mechanisms.json'), dataset.mechanisms);
  writeJson(path.join(mockDir, 'resources.json'), dataset.resources);
  writeJson(path.join(mockDir, 'quizzes.json'), dataset.quizzes);
  writeJson(path.join(mockDir, 'checkpoints.json'), dataset.checkpoints);
}

function main() {
  const args = process.argv.slice(2);
  const syncMocks = args.includes('--sync-mock');
  const batchArg = args.find((item) => !item.startsWith('--'));

  if (!batchArg) {
    console.error('Usage: node scripts/import-content.mjs imports/<batch-name> [--sync-mock]');
    process.exit(1);
  }

  const projectRoot = path.resolve(process.cwd());
  const batchDir = path.resolve(projectRoot, batchArg);
  const batch = buildBatch(batchDir);
  const { dataset, report } = normalizeBatch(batch);

  const outputDir = path.join(batchDir, 'output');
  const reportDir = path.join(batchDir, 'report');
  ensureDir(outputDir);
  ensureDir(reportDir);

  writeJson(path.join(outputDir, 'systems.json'), dataset.systems);
  writeJson(path.join(outputDir, 'conditions.json'), dataset.conditions);
  writeJson(path.join(outputDir, 'cases.json'), dataset.cases);
  writeJson(path.join(outputDir, 'case_details.json'), dataset.caseDetails);
  writeJson(path.join(outputDir, 'sections.json'), dataset.sections);
  writeJson(path.join(outputDir, 'mechanisms.json'), dataset.mechanisms);
  writeJson(path.join(outputDir, 'resources.json'), dataset.resources);
  writeJson(path.join(outputDir, 'quizzes.json'), dataset.quizzes);
  writeJson(path.join(outputDir, 'checkpoints.json'), dataset.checkpoints);
  writeJson(path.join(outputDir, 'content-dataset.json'), dataset);
  writeJson(path.join(reportDir, 'import-report.json'), report);
  writeText(path.join(reportDir, 'import-report.md'), `${renderMarkdownReport(report)}\n`);

  if (syncMocks) {
    syncMock(dataset, projectRoot);
  }

  console.log(`Import completed for ${batch.meta.title}`);
  console.log(`Issues: ${report.summary.issues}`);
  console.log(`Unresolved items: ${report.summary.unresolvedItems}`);
  console.log(`Output written to ${path.relative(projectRoot, outputDir)}`);
  console.log(`Report written to ${path.relative(projectRoot, reportDir)}`);
  if (syncMocks) {
    console.log('Mock dataset updated from import output.');
  }
}

main();
