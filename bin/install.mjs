#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readdirSync, statSync, unlinkSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = join(__dirname, '..', 'plugins');
const CLAUDE_HOME = join(homedir(), '.claude');

function collectFiles(src, dest, list = []) {
  if (!existsSync(src)) return list;
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      collectFiles(srcPath, destPath, list);
    } else {
      list.push({ src: srcPath, dest: destPath });
    }
  }
  return list;
}

function printHelp() {
  console.log(`
  claude-harness-kit — install multi-agent harness to ~/.claude/

  Usage:
    npx claude-harness-kit [options] [teams...]

  Options:
    --uninstall     Remove installed files
    --force, -f     Overwrite existing files
    --dry-run       Preview without copying
    --help, -h      Show this help

  Teams:
    dev-team        Feature development pipeline (5 agents, 1 skill)
    review-team     Code review fan-out/fan-in (5 agents, 1 skill)
    fe-team         Frontend expert pool + reflection (6 agents, 5 skills)
    be-team         Backend expert pool + reflection (8 agents, 5 skills)
    explore-team    Codebase exploration (4 agents, 3 skills)
    research-team   Blackboard-pattern web research (4 agents, 3 skills)
    debate-team     Adversarial debate for decisions (4 agents, 2 skills)
    ops-team        Release, CI watch, zombie-collector (0 agents, 3 skills)

  Examples:
    npx claude-harness-kit                        # All teams
    npx claude-harness-kit fe-team be-team        # Specific teams
    npx claude-harness-kit --dry-run              # Preview
    npx claude-harness-kit --force                # Overwrite existing
`);
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');
  const dryRun = args.includes('--dry-run');
  const uninstall = args.includes('--uninstall');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    printHelp();
    process.exit(0);
  }

  const flags = ['--force', '-f', '--dry-run', '--uninstall', '--help', '-h'];
  const requestedPlugins = args.filter((a) => !flags.includes(a));

  const allPlugins = readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const plugins =
    requestedPlugins.length > 0
      ? requestedPlugins.filter((p) => {
          if (!allPlugins.includes(p)) {
            console.log(`  unknown team: ${p} (available: ${allPlugins.join(', ')})`);
            return false;
          }
          return true;
        })
      : allPlugins;

  if (plugins.length === 0) {
    console.log('  no teams to install.');
    process.exit(1);
  }

  const mode = uninstall ? 'uninstall' : dryRun ? 'dry-run' : force ? 'force' : 'safe (skip existing)';
  console.log(`\n  claude-harness-kit ${uninstall ? 'uninstaller' : 'installer'}\n`);
  console.log(`  Target: ${CLAUDE_HOME}`);
  console.log(`  Teams: ${plugins.join(', ')}`);
  console.log(`  Mode: ${mode}\n`);

  if (uninstall) {
    let removed = 0;
    for (const plugin of plugins) {
      const pluginDir = join(PLUGINS_DIR, plugin);

      // agents
      const agentsDir = join(pluginDir, 'agents');
      if (existsSync(agentsDir)) {
        for (const f of readdirSync(agentsDir)) {
          const dest = join(CLAUDE_HOME, 'agents', f);
          if (existsSync(dest)) {
            if (!dryRun) unlinkSync(dest);
            console.log(`  remove: agents/${f}`);
            removed++;
          }
        }
      }

      // skills
      const skillsDir = join(pluginDir, 'skills');
      if (existsSync(skillsDir)) {
        for (const d of readdirSync(skillsDir, { withFileTypes: true })) {
          if (!d.isDirectory()) continue;
          const dest = join(CLAUDE_HOME, 'skills', `${d.name}.md`);
          if (existsSync(dest)) {
            if (!dryRun) unlinkSync(dest);
            console.log(`  remove: skills/${d.name}.md`);
            removed++;
          }
        }
      }

      // harness docs
      const rootMds = readdirSync(pluginDir).filter(
        (f) => f.endsWith('.md') && f !== 'AGENTS.md' && statSync(join(pluginDir, f)).isFile()
      );
      for (const md of rootMds) {
        const dest = join(CLAUDE_HOME, 'harnesses', md);
        if (existsSync(dest)) {
          if (!dryRun) unlinkSync(dest);
          console.log(`  remove: harnesses/${md}`);
          removed++;
        }
      }

      // hooks (ops-team only)
      const hooksDir = join(pluginDir, 'hooks');
      if (existsSync(hooksDir)) {
        for (const entry of readdirSync(hooksDir, { withFileTypes: true })) {
          if (!entry.isFile() || !entry.name.endsWith('.sh')) continue;
          const dest = join(CLAUDE_HOME, 'hooks', entry.name);
          if (existsSync(dest)) {
            if (!dryRun) unlinkSync(dest);
            console.log(`  remove: hooks/${entry.name}`);
            removed++;
          }
        }
      }
    }
    console.log(`\n  Done! Removed: ${removed}\n`);
    process.exit(0);
  }

  const operations = [];

  for (const plugin of plugins) {
    const pluginDir = join(PLUGINS_DIR, plugin);

    // agents/ -> ~/.claude/agents/
    const agentsDir = join(pluginDir, 'agents');
    if (existsSync(agentsDir)) {
      operations.push(...collectFiles(agentsDir, join(CLAUDE_HOME, 'agents')));
    }

    // skills/<name>/SKILL.md -> ~/.claude/skills/<name>.md
    const skillsDir = join(pluginDir, 'skills');
    if (existsSync(skillsDir)) {
      const skillFolders = readdirSync(skillsDir, { withFileTypes: true }).filter((d) =>
        d.isDirectory()
      );
      for (const folder of skillFolders) {
        const skillFile = join(skillsDir, folder.name, 'SKILL.md');
        if (existsSync(skillFile)) {
          operations.push({
            src: skillFile,
            dest: join(CLAUDE_HOME, 'skills', `${folder.name}.md`),
          });
        }
      }
    }

    // harness docs (*.md at plugin root, excluding AGENTS.md)
    const rootMds = readdirSync(pluginDir).filter(
      (f) => f.endsWith('.md') && f !== 'AGENTS.md' && statSync(join(pluginDir, f)).isFile()
    );
    for (const md of rootMds) {
      operations.push({
        src: join(pluginDir, md),
        dest: join(CLAUDE_HOME, 'harnesses', md),
      });
    }

    // hooks/*.sh -> ~/.claude/hooks/ (ops-team)
    const hooksDir = join(pluginDir, 'hooks');
    if (existsSync(hooksDir)) {
      for (const f of readdirSync(hooksDir)) {
        if (f.endsWith('.sh')) {
          operations.push({
            src: join(hooksDir, f),
            dest: join(CLAUDE_HOME, 'hooks', f),
            executable: true,
          });
        }
      }
    }
  }

  let copied = 0;
  let skipped = 0;

  for (const op of operations) {
    const rel = op.dest.replace(CLAUDE_HOME + '/', '');
    if (dryRun) {
      if (existsSync(op.dest)) {
        console.log(`  [skip] ${rel}`);
        skipped++;
      } else {
        console.log(`  [copy] ${rel}`);
        copied++;
      }
      continue;
    }

    mkdirSync(dirname(op.dest), { recursive: true });

    if (existsSync(op.dest) && !force) {
      console.log(`  skip: ${rel}`);
      skipped++;
    } else {
      cpSync(op.src, op.dest);
      if (op.executable) chmodSync(op.dest, 0o755);
      console.log(`  copy: ${rel}`);
      copied++;
    }
  }

  console.log(`\n  Done! ${dryRun ? 'Would copy' : 'Copied'}: ${copied}, Skipped: ${skipped}\n`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
