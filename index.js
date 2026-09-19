/* ==========================================================================
   IEEE Computer Society — UCEOU | Git & GitHub Workshop JavaScript
   Ultra-Premium Responsive Interactive Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNetworkCanvas();
  initScrollProgressAndScrollSpy();
  initCardSpotlight();
  initWorkflowStepper();
  initTerminalSimulator();
  initCheatSheet();
  initContributionGenerator();
  initToastSystem();
  initModalSystem();
  initBackToTop();
  (window.requestIdleCallback || setTimeout)(initGitHubStarsFallback);
});

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const REPO = 'pansuriyaForam/IEEE-CS-UCEOU-Git-GitHub-Workshop';
const REPO_URL = `https://github.com/${REPO}`;

/* -------------------------------------------------------------------------- */
/* 1. Interactive Network Canvas (Drifting Nodes & Pointer Attraction)        */
/* -------------------------------------------------------------------------- */
function initNetworkCanvas() {
  const canvas = document.getElementById('net');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const pointer = { x: -9999, y: -9999 };
  let width = 0, height = 0, particles = [], rafId = 0, resizeTimer;

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    // Ignore small height-only changes (mobile URL bar) to avoid re-allocating the canvas
    if (particles.length && w === width && Math.abs(h - height) < 120) return;
    const widthChanged = w !== width;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = w; height = h;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (widthChanged || !particles.length) {
      const cap = w < 768 ? 35 : 65;
      const count = Math.min(cap, Math.max(20, Math.floor((w * h) / 18000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 1
      }));
    }
    draw();
  }

  // Squared-distance early exit: most pairs are out of range, so they cost almost nothing
  function link(p, x, y, max, rgb, alpha) {
    const dx = p.x - x, dy = p.y - y, d2 = dx * dx + dy * dy;
    if (d2 > max * max) return;
    ctx.strokeStyle = `rgba(${rgb},${((1 - Math.sqrt(d2) / max) * alpha).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 242, 254, 0.75)';
    ctx.beginPath();                       // all dots in one path / one fill
    for (const p of particles) { ctx.moveTo(p.x + p.r, p.y); ctx.arc(p.x, p.y, p.r, 0, 6.2832); }
    ctx.fill();
    ctx.lineWidth = 0.65;
    const hasPointer = pointer.x > 0;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let k = i + 1; k < particles.length; k++) link(p, particles[k].x, particles[k].y, 125, '0,153,255', 0.22);
      if (hasPointer) link(p, pointer.x, pointer.y, 160, '139,92,246', 0.55);
    }
  }

  function tick() {
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }
    draw();
    rafId = requestAnimationFrame(tick);
  }
  const start = () => { if (!rafId && !reduceMotion) rafId = requestAnimationFrame(tick); };
  const stop = () => { cancelAnimationFrame(rafId); rafId = 0; };

  const clearPointer = () => { pointer.x = pointer.y = -9999; };
  window.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  window.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') clearPointer(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', clearPointer);
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); }, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));  // no work in background tabs

  resize();
  start();
}

/* -------------------------------------------------------------------------- */
/* 2. Scroll Progress Bar, Mobile Drawer & ScrollSpy                          */
/* -------------------------------------------------------------------------- */
function initScrollProgressAndScrollSpy() {
  const progressBar = document.querySelector('.progress');
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('nav-links');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navBackdrop = document.getElementById('nav-backdrop');
  const backBtn = document.getElementById('back-to-top');
  const sections = [...document.querySelectorAll('main section[id]')];
  const navItems = [...document.querySelectorAll('.nav-link')];
  const desktopNav = matchMedia('(min-width: 1181px)');
  if (!navbar || !navLinks || !mobileToggle || !navBackdrop) return;

  let ranges = [], maxScroll = 1, ticking = false, activeId = '';

  // Layout is measured only when it can change (not on every scroll event)
  function measure() {
    ranges = sections.map(s => [s.id, s.offsetTop - 140, s.offsetTop - 140 + s.offsetHeight]);
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    update();
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, y / maxScroll)})`;
    navbar.classList.toggle('scrolled', y > 30);
    backBtn?.classList.toggle('visible', y > 400);
    const hit = ranges.find(r => y >= r[1] && y < r[2]);
    if (hit && hit[0] !== activeId) {
      activeId = hit[0];
      navItems.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${activeId}`));
    }
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  new ResizeObserver(measure).observe(document.body);   // fonts loading, cheat-sheet filtering, etc.

  function toggleMenu(open = !navLinks.classList.contains('active')) {
    navLinks.classList.toggle('active', open);
    navBackdrop.classList.toggle('active', open);
    mobileToggle.classList.toggle('active', open);
    mobileToggle.setAttribute('aria-expanded', String(open));
    const modalOpen = document.getElementById('modal-overlay')?.classList.contains('active');
    document.body.style.overflow = open || modalOpen ? 'hidden' : '';
  }

  mobileToggle.addEventListener('click', () => toggleMenu());
  navBackdrop.addEventListener('click', () => toggleMenu(false));
  navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) toggleMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) { toggleMenu(false); mobileToggle.focus(); }
  });
  desktopNav.addEventListener('change', (e) => { if (e.matches) toggleMenu(false); });
}

/* -------------------------------------------------------------------------- */
/* 3. Card Mouse-Follow Radial Spotlight Effect                               */
/* -------------------------------------------------------------------------- */
function initCardSpotlight() {
  // One delegated, rAF-throttled listener instead of one per card; skipped on touch-only devices
  if (!matchMedia('(hover: hover)').matches) return;
  let raf = 0;
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest?.('[data-spotlight]');
    if (!card || raf) return;
    const { clientX, clientY } = e;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${clientX - rect.left}px`);
      card.style.setProperty('--my', `${clientY - rect.top}px`);
    });
  }, { passive: true });
}

/* -------------------------------------------------------------------------- */
/* 4. Collaboration Workflow Stepper Engine                                    */
/* -------------------------------------------------------------------------- */
const WORKFLOW_STEPS = [
  {
    id: 'fork',
    num: 1,
    badge: 'STEP 01',
    category: 'GITHUB REMOTE',
    title: '1. Fork Repository 🍴',
    cmd: `gh repo fork ${REPO} --clone=false`,
    desc: 'Create your own personal copy of the repository on GitHub. This gives you a remote workspace where you can freely make changes without affecting the upstream project.',
    visual: 'GitHub Upstream (IEEE-CS-UCEOU) ──[ Fork ]──> Your GitHub Account (origin)'
  },
  {
    id: 'clone',
    num: 2,
    badge: 'STEP 02',
    category: 'LOCAL SETUP',
    title: '2. Clone to Machine 📥',
    cmd: 'git clone https://github.com/your-username/IEEE-CS-UCEOU-Git-GitHub-Workshop.git',
    desc: 'Download your forked repository from GitHub to your local computer so you can edit code in VS Code or your preferred IDE.',
    visual: 'Remote (origin/main) ══ download ══> Local Machine (main branch)'
  },
  {
    id: 'branch',
    num: 3,
    badge: 'STEP 03',
    category: 'BRANCHING',
    title: '3. Create a Feature Branch 🌿',
    cmd: 'git checkout -b feature/my-first-contribution',
    desc: 'Create an isolated feature branch. Never work directly on main! Branching ensures your main branch stays pristine and synchronized.',
    visual: 'main ────●───────────────────────────────> (clean)\n         └───● (feature/my-first-contribution)'
  },
  {
    id: 'changes',
    num: 4,
    badge: 'STEP 04',
    category: 'DEVELOPMENT',
    title: '4. Make Changes & Inspect 📝',
    cmd: 'code README.md   # Make edits, then check: git status',
    desc: 'Modify, fix bugs, or add new documentation. Use git status to keep track of changed, untracked, and modified files in your working tree.',
    visual: 'Modified files ──> Working Directory (un-staged changes)'
  },
  {
    id: 'commit',
    num: 5,
    badge: 'STEP 05',
    category: 'GIT SNAPSHOT',
    title: '5. Stage & Commit 💾',
    cmd: 'git add . && git commit -m "docs: add beginner FAQ resource"',
    desc: 'Stage your modified files with git add and record a permanent snapshot with a concise, descriptive commit message.',
    visual: 'Working Directory ──> Staging Area ──> Saved Commit [a1b2c3d]'
  },
  {
    id: 'push',
    num: 6,
    badge: 'STEP 06',
    category: 'REMOTE SYNC',
    title: '6. Push Branch to Fork 🚀',
    cmd: 'git push -u origin feature/my-first-contribution',
    desc: 'Upload your committed feature branch from your local machine up to your personal GitHub fork (origin).',
    visual: 'Local (feature branch) ══ upload ══> GitHub (origin/feature branch)'
  },
  {
    id: 'pr',
    num: 7,
    badge: 'STEP 07',
    category: 'OPEN SOURCE',
    title: '7. Open Pull Request 🔃',
    cmd: 'gh pr create --title "docs: add FAQ" --body "Closes #12"',
    desc: 'Submit a Pull Request (PR) from your fork to the original IEEE-CS-UCEOU repository asking maintainers to review and merge your work.',
    visual: 'Your Fork (origin:feature) ── [Pull Request] ──> Upstream (main)'
  },
  {
    id: 'review',
    num: 8,
    badge: 'STEP 08',
    category: 'PEER REVIEW',
    title: '8. Code Review & Feedback 👀',
    cmd: '# Maintainers review code lines and leave constructive comments',
    desc: 'Workshop maintainers and peers review your proposed changes, suggest improvements, or approve your work.',
    visual: 'Review Status: ⏳ Pending Review ──> 💬 Changes Requested / ✅ Approved'
  },
  {
    id: 'update',
    num: 9,
    badge: 'STEP 09',
    category: 'ITERATION',
    title: '9. Address Feedback 🔄',
    cmd: 'git commit -m "refactor: apply reviewer changes" && git push',
    desc: 'If maintainers request changes, simply make edits locally, commit, and push. Your Pull Request automatically updates!',
    visual: 'Local Fixes ──> Commit ──> Push ──> PR Auto-Refreshed ✨'
  },
  {
    id: 'merge',
    num: 10,
    badge: 'STEP 10',
    category: 'COMPLETION',
    title: '10. Merged & Synced! 🎉',
    cmd: 'git checkout main && git pull upstream main',
    desc: 'Congratulations! Your code is merged into the main project. You are officially an open-source contributor!',
    visual: 'Merged PR ──> Integrated into upstream/main 🚀'
  }
];

function initWorkflowStepper() {
  const track = document.getElementById('pipeline-track');
  const detailBadge = document.getElementById('wf-detail-badge');
  const detailCategory = document.getElementById('wf-detail-category');
  const detailTitle = document.getElementById('wf-detail-title');
  const detailDesc = document.getElementById('wf-detail-desc');
  const detailCmd = document.getElementById('wf-detail-cmd');
  const detailVisual = document.getElementById('wf-detail-visual');
  const stepCounter = document.getElementById('current-step-num');
  const prevBtn = document.getElementById('wf-prev-btn');
  const nextBtn = document.getElementById('wf-next-btn');

  if (!track) return;

  let currentStepIdx = 0;

  track.innerHTML = WORKFLOW_STEPS.map((step, idx) => `
    <div class="pipeline-step ${idx === 0 ? 'active' : ''}" data-index="${idx}" tabindex="0" role="button" aria-label="Step ${step.num}: ${step.id}">
      <div class="step-node">${step.num}</div>
      <div class="step-label">${step.id.toUpperCase()}</div>
    </div>
  `).join('');

  const steps = [...track.children];

  function renderStep(idx) {
    currentStepIdx = Math.max(0, Math.min(idx, WORKFLOW_STEPS.length - 1));
    const step = WORKFLOW_STEPS[currentStepIdx];

    steps.forEach((el, i) => {
      el.classList.toggle('active', i === currentStepIdx);
      el.classList.toggle('completed', i < currentStepIdx);
    });

    if (stepCounter) stepCounter.textContent = currentStepIdx + 1;
    if (detailBadge) detailBadge.textContent = step.badge;
    if (detailCategory) detailCategory.textContent = step.category;
    if (detailTitle) detailTitle.innerHTML = step.title;
    if (detailDesc) detailDesc.textContent = step.desc;
    if (detailCmd) detailCmd.textContent = step.cmd;
    if (detailVisual) detailVisual.textContent = step.visual;

    // Update copy button target
    const copyBtn = document.querySelector('.workflow-detail-box .copy-btn');
    if (copyBtn) copyBtn.setAttribute('data-copy', step.cmd);

    // Prev / Next button states
    if (prevBtn) {
      prevBtn.style.opacity = currentStepIdx === 0 ? '0.5' : '1';
      prevBtn.style.pointerEvents = currentStepIdx === 0 ? 'none' : 'auto';
    }
    if (nextBtn) {
      if (currentStepIdx === WORKFLOW_STEPS.length - 1) {
        nextBtn.innerHTML = `<span>Completed! 🎉</span>`;
      } else {
        nextBtn.innerHTML = `<span>Next Step</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      }
    }

    // Keep the active node centred inside the (horizontally scrollable) track
    const el = steps[currentStepIdx];
    track.scrollTo({ left: el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  track.addEventListener('click', (e) => {
    const stepEl = e.target.closest('.pipeline-step');
    if (stepEl) {
      const idx = parseInt(stepEl.getAttribute('data-index'), 10);
      renderStep(idx);
    }
  });

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      renderStep(currentStepIdx + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      renderStep(currentStepIdx - 1);
    }
  });

  prevBtn?.addEventListener('click', () => renderStep(currentStepIdx - 1));
  nextBtn?.addEventListener('click', () => {
    if (currentStepIdx < WORKFLOW_STEPS.length - 1) {
      renderStep(currentStepIdx + 1);
    } else {
      window.showToast?.('🎉 You reached the end of the workflow!');
    }
  });

  renderStep(0);
}

/* -------------------------------------------------------------------------- */
/* 5. Interactive Terminal Simulator CLI Engine                               */
/* -------------------------------------------------------------------------- */
function initTerminalSimulator() {
  const termBody = document.getElementById('terminal-body');
  const termInput = document.getElementById('terminal-input');
  const quickBtns = document.querySelectorAll('.quick-btn');
  const copyAllBtn = document.getElementById('term-copy-all');
  const branchIndicator = document.getElementById('term-branch-indicator');

  if (!termBody || !termInput) return;

  let currentBranch = 'main';
  let isStaged = false;
  let hasChanges = true;
  let commandHistory = [];
  let historyIndex = -1;

  let commitHistory = [
    { hash: 'e9a41f2', msg: 'Initial workshop structure & guidelines', author: 'IEEE-CS Maintainer', date: 'Sept 17, 2026' }
  ];

  function printLine(html, type = 'output') {
    const div = document.createElement('div');
    div.className = `terminal-line term-${type}`;
    div.innerHTML = html;
    termBody.appendChild(div);
    while (termBody.childElementCount > 300) termBody.firstElementChild.remove();
    termBody.scrollTop = termBody.scrollHeight;
  }

  function updateBranchUI() {
    if (branchIndicator) {
      branchIndicator.textContent = `(${currentBranch})`;
    }
  }

  function executeCommand(rawCmd) {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Record into history
    commandHistory.push(cmd);
    historyIndex = commandHistory.length;

    printLine(
      `<span class="term-prompt">user@ieee-cs-uceou</span><span class="term-colon">:</span><span class="term-path">~/git-workshop</span><span class="term-branch">(${currentBranch})</span>$ <span class="term-cmd">${escapeHtml(cmd)}</span>`,
      'line'
    );

    const parts = cmd.split(/\s+/);
    const mainCmd = parts[0].toLowerCase();

    switch (mainCmd) {
      case 'help':
        printLine(`
<span class="term-success">Available Interactive Commands:</span>
  - <span class="term-cmd">git status</span>          : Check working directory & staging state
  - <span class="term-cmd">git add .</span>           : Stage all changed files
  - <span class="term-cmd">git commit -m "msg"</span> : Commit staged changes with message
  - <span class="term-cmd">git checkout -b name</span>: Create & switch to a new feature branch
  - <span class="term-cmd">git push origin main</span>: Push branch to GitHub remote
  - <span class="term-cmd">git log</span>             : View commit log history
  - <span class="term-cmd">git branch</span>          : List local branches
  - <span class="term-cmd">git diff</span>            : View changes not yet staged
  - <span class="term-cmd">git pull upstream main</span>: Sync latest changes from upstream
  - <span class="term-cmd">workflow</span>            : Show workshop collaboration steps
  - <span class="term-cmd">whoami</span>              : Display current workshop user
  - <span class="term-cmd">date</span>                : Show current system date
  - <span class="term-cmd">ieee</span>                : Display IEEE CS Workshop banner
  - <span class="term-cmd">clear</span>               : Clear terminal output screen
        `);
        break;

      case 'clear':
        termBody.innerHTML = '';
        break;

      case 'whoami':
        printLine('workshop-contributor@ieee-cs-uceou');
        break;

      case 'date':
        printLine(new Date().toString());
        break;

      case 'ieee':
        printLine(`
<span class="term-success">
  ___ _____ _____ _____    ____ ____    _   _  ____ _____ ___  _   _ 
 |_ _| ____| ____| ____|  / ___/ ___|  | | | |/ ___| ____/ _ \\| | | |
  | ||  _| |  _| |  _|   | |   \\___ \\  | | | | |   |  _|| | | | | | |
  | || |___| |___| |___  | |___ ___| | | |_| | |___| |__| |_| | |_| |
 |___|_____|_____|_____|  \\____|____/   \\___/ \\____|_____\\___/ \\___/ 
</span>
<span class="term-cmd">IEEE Computer Society — UCEOU | Git &amp; GitHub Workshop 🚀</span>
<span class="term-output">Mastering Version Control, Branching &amp; Open Source Collaboration</span>
        `);
        break;

      case 'workflow':
        printLine(`
<span class="term-success">Collaborative GitHub Pipeline:</span>
Fork ➔ Clone ➔ Branch ➔ Make Changes ➔ Stage ➔ Commit ➔ Push ➔ PR ➔ Review ➔ Merge 🎉
Type <span class="term-cmd">git status</span> to inspect your repository state!
        `);
        break;

      case 'git':
        handleGitCommand(parts.slice(1));
        break;

      default:
        printLine(`bash: command not found: <span class="term-error">${escapeHtml(cmd)}</span>. Type <span class="term-cmd">help</span> for available commands.`, 'error');
        break;
    }
  }

  function handleGitCommand(args) {
    if (args.length === 0) {
      printLine(`usage: git [--version] [--help] &lt;command&gt; [&lt;args&gt;]`);
      return;
    }

    const sub = args[0].toLowerCase();

    if (sub === 'status') {
      if (!isStaged && hasChanges) {
        printLine(`
On branch <span class="term-branch">${currentBranch}</span>
Changes not staged for commit:
  (use "git add &lt;file&gt;..." to update what will be committed)

	<span class="term-error">modified:   README.md</span>
	<span class="term-error">modified:   resources/useful-resources.md</span>

no changes added to commit (use "git add" and/or "git commit -a")
        `);
      } else if (isStaged) {
        printLine(`
On branch <span class="term-branch">${currentBranch}</span>
Changes to be committed:
  (use "git restore --staged &lt;file&gt;..." to unstage)

	<span class="term-success">modified:   README.md</span>
	<span class="term-success">modified:   resources/useful-resources.md</span>
        `);
      } else {
        printLine(`On branch <span class="term-branch">${currentBranch}</span>\nnothing to commit, working tree clean ✨`, 'success');
      }
    } else if (sub === 'add') {
      isStaged = true;
      printLine(`Staged 2 modified files for commit. Type <span class="term-cmd">git status</span> or <span class="term-cmd">git commit</span>.`, 'success');
    } else if (sub === 'commit') {
      if (!isStaged) {
        printLine(`error: no changes added to commit (use "git add ." first)`, 'error');
        return;
      }
      const rawMsg = args.slice(1).join(' ');
      const match = rawMsg.match(/-m\s+["']?([^"']+)["']?/);
      const msg = match ? match[1] : 'Update workshop documentation';
      const hash = Math.random().toString(16).substring(2, 9);
      commitHistory.unshift({
        hash,
        msg,
        author: 'Workshop Participant',
        date: new Date().toLocaleDateString()
      });
      isStaged = false;
      hasChanges = false;
      printLine(`[${currentBranch} ${hash}] ${escapeHtml(msg)}\n 2 files changed, 18 insertions(+)`, 'success');
    } else if (sub === 'checkout' || sub === 'switch') {
      if (args[1] === '-b' && args[2]) {
        currentBranch = args[2];
        updateBranchUI();
        printLine(`Switched to a new branch '<span class="term-branch">${currentBranch}</span>'`, 'success');
      } else if (args[1]) {
        currentBranch = args[1];
        updateBranchUI();
        printLine(`Switched to branch '<span class="term-branch">${currentBranch}</span>'`, 'success');
      } else {
        printLine(`usage: git checkout -b &lt;new-branch-name&gt;`, 'error');
      }
    } else if (sub === 'branch') {
      printLine(`  main\n* <span class="term-branch">${currentBranch}</span>`);
    } else if (sub === 'push') {
      const targetBranch = args[2] || currentBranch;
      printLine(`
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
Writing objects: 100% (4/4), 512 bytes | 512.00 KiB/s, done.
To https://github.com/your-username/IEEE-CS-UCEOU-Git-GitHub-Workshop.git
 * [new branch]      ${targetBranch} -> ${targetBranch}
<span class="term-success">Branch '${targetBranch}' set up to track remote branch '${targetBranch}' from 'origin'.</span>
<span class="term-cmd">🚀 Next Step: Open GitHub to submit your Pull Request!</span>
      `);
    } else if (sub === 'diff') {
      if (hasChanges && !isStaged) {
        printLine(`
<span class="term-output">diff --git a/README.md b/README.md</span>
<span class="term-error">--- a/README.md</span>
<span class="term-success">+++ b/README.md</span>
@@ -12,4 +12,6 @@
<span class="term-output"> # IEEE CS UCEOU Git &amp; GitHub Workshop</span>
<span class="term-success">+## Workshop Overview</span>
<span class="term-success">+Mastering open-source collaboration workflows!</span>
        `);
      } else {
        printLine(`(No working tree differences)`);
      }
    } else if (sub === 'pull') {
      printLine(`
remote: Enumerating objects: 4, done.
remote: Total 4 (delta 2), reused 4 (delta 2)
Unpacking objects: 100% (4/4), done.
From ${REPO_URL}
 * branch            main       -> FETCH_HEAD
Already up to date ✨
      `, 'success');
    } else if (sub === 'log') {
      const logs = commitHistory.map(c => `
<span class="term-branch">commit ${c.hash}</span> (HEAD -> <span class="term-cmd">${currentBranch}</span>)
Author: ${c.author} &lt;user@ieee-cs-uceou.org&gt;
Date:   ${c.date}

    ${c.msg}
      `).join('\n');
      printLine(logs);
    } else {
      printLine(`git: '${sub}' simulation ready. Try <span class="term-cmd">git status</span>, <span class="term-cmd">git add .</span>, or <span class="term-cmd">git commit -m "..."</span>.`, 'output');
    }
  }

  // Keydown Handler for Input & History Navigation
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = termInput.value;
      termInput.value = '';
      executeCommand(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex > 0) {
        historyIndex--;
        termInput.value = commandHistory[historyIndex] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        termInput.value = commandHistory[historyIndex] || '';
      } else {
        historyIndex = commandHistory.length;
        termInput.value = '';
      }
    }
  });

  // Quick Preset Chips
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) {
        executeCommand(cmd);
        termInput.focus();
      }
    });
  });

  // Copy All Terminal Output Button
  copyAllBtn?.addEventListener('click', () => {
    const text = termBody.innerText;
    navigator.clipboard.writeText(text).then(() => {
      window.showToast?.('📋 Terminal output copied to clipboard!');
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 6. Git Command Cheat Sheet Search & Filter Engine                          */
/* -------------------------------------------------------------------------- */
const CHEAT_ITEMS = [
  { cmd: 'git init', category: 'basics', desc: 'Initialize a new local Git repository in current directory', example: 'git init' },
  { cmd: 'git clone <url>', category: 'basics', desc: 'Clone a remote repository to your local computer', example: 'git clone https://github.com/org/repo.git' },
  { cmd: 'git status', category: 'basics', desc: 'Inspect working directory & staging area state', example: 'git status' },
  { cmd: 'git add <file>', category: 'basics', desc: 'Stage file modifications for the next commit', example: 'git add README.md  # or git add .' },
  { cmd: 'git commit -m "msg"', category: 'basics', desc: 'Record staged changes into repository history snapshot', example: 'git commit -m "feat: add workshop notes"' },
  { cmd: 'git branch', category: 'branching', desc: 'List all local branches in the repository', example: 'git branch' },
  { cmd: 'git checkout -b <name>', category: 'branching', desc: 'Create a new feature branch and switch to it immediately', example: 'git checkout -b feature/docs' },
  { cmd: 'git switch <branch>', category: 'branching', desc: 'Switch branches cleanly in modern Git versions', example: 'git switch main' },
  { cmd: 'git merge <branch>', category: 'branching', desc: 'Merge specified branch into currently active branch', example: 'git merge feature/docs' },
  { cmd: 'git remote add origin', category: 'remote', desc: 'Connect local repository to remote GitHub repository', example: 'git remote add origin <url>' },
  { cmd: 'git push -u origin <branch>', category: 'remote', desc: 'Upload local commits to remote GitHub fork', example: 'git push -u origin feature/docs' },
  { cmd: 'git pull upstream main', category: 'remote', desc: 'Fetch & merge latest updates from original upstream repository', example: 'git pull upstream main' },
  { cmd: 'git restore <file>', category: 'undo', desc: 'Discard un-staged changes in your working tree', example: 'git restore README.md' },
  { cmd: 'git reset HEAD~1', category: 'undo', desc: 'Undo latest commit but keep all file changes intact locally', example: 'git reset HEAD~1' },
  { cmd: 'git stash / stash pop', category: 'undo', desc: 'Temporarily shelve dirty changes to restore a clean state', example: 'git stash && git stash pop' }
];

function initCheatSheet() {
  const grid = document.getElementById('cheatsheet-grid');
  const searchInput = document.getElementById('cheat-search');
  const clearBtn = document.getElementById('search-clear-btn');
  const filterPills = document.querySelectorAll('.filter-pill');
  const resultsCount = document.getElementById('search-results-count');

  if (!grid) return;

  let activeCategory = 'all';
  let searchQuery = '';

  function renderGrid() {
    const filtered = CHEAT_ITEMS.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = item.cmd.toLowerCase().includes(searchQuery) ||
                            item.desc.toLowerCase().includes(searchQuery) ||
                            item.example.toLowerCase().includes(searchQuery);
      return matchesCategory && matchesSearch;
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${filtered.length} of ${CHEAT_ITEMS.length} commands`;
    }

    if (clearBtn) {
      clearBtn.classList.toggle('visible', searchQuery.length > 0);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 48px; background: rgba(13, 21, 38, 0.4); border-radius: var(--radius-lg); border: 1px dashed var(--border-glass);">
          <div style="font-size: 32px; margin-bottom: 12px;">🔍</div>
          <h3 style="color: #fff; margin-bottom: 6px;">No Git commands matched "${escapeHtml(searchQuery)}"</h3>
          <p style="font-size: 14px;">Try searching for terms like <code>checkout</code>, <code>commit</code>, <code>stash</code>, or <code>branch</code>.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => `
      <div class="cheat-card" data-spotlight>
        <div>
          <div class="cheat-header">
            <span class="cheat-command">${escapeHtml(item.cmd)}</span>
            <span class="cheat-tag">${item.category.toUpperCase()}</span>
          </div>
          <p class="cheat-desc">${escapeHtml(item.desc)}</p>
        </div>
        <div class="cheat-copy-row">
          <code class="cheat-example">${escapeHtml(item.example)}</code>
          <button class="copy-btn" data-copy="${escapeHtml(item.example)}" title="Copy Command">
            <svg class="copy-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  let searchTimer;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderGrid();
    }, 90);
  });

  clearBtn?.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      searchQuery = '';
      searchInput.focus();
      renderGrid();
    }
  });

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category') || 'all';
      renderGrid();
    });
  });

  renderGrid();
}

/* -------------------------------------------------------------------------- */
/* 7. First Contribution Idea Generator Engine                                */
/* -------------------------------------------------------------------------- */
const CONTRIBUTION_IDEAS = [
  {
    title: '📝 Fix a Typo or Documentation Formatting',
    difficulty: 'Beginner Friendly 🌟',
    file: 'README.md or CONTRIBUTING.md',
    steps: [
      'Fork the repo on GitHub and clone your fork locally.',
      'Create a branch: git checkout -b fix/typo-readme',
      'Improve wording or fix a formatting typo in README.md.',
      'Commit: git commit -m "docs: fix formatting typo in README"',
      'Push to origin and submit your Pull Request!'
    ]
  },
  {
    title: '📖 Add a Curated Git/GitHub Learning Resource',
    difficulty: 'Beginner Friendly 🌟',
    file: 'resources/useful-resources.md',
    steps: [
      'Find a helpful tutorial, visual Git tool, or YouTube video.',
      'Create a branch: git checkout -b feature/add-git-resource',
      'Append your resource link with a brief 1-sentence description.',
      'Commit: git commit -m "docs: add Oh My Git learning game link"',
      'Push to your fork and open a Pull Request!'
    ]
  },
  {
    title: '💡 Add a Beginner FAQ Question & Answer',
    difficulty: 'Beginner Friendly 🌟',
    file: 'resources/useful-resources.md',
    steps: [
      'Identify a common question (e.g. "What is origin vs upstream?").',
      'Create branch: git checkout -b docs/faq-git-origin',
      'Add a concise explanation under the FAQ section.',
      'Commit: git commit -m "docs: add FAQ for git origin and upstream"',
      'Push your branch and open a PR for maintainers to review.'
    ]
  },
  {
    title: '🎨 Improve Code Examples or Visual Branch Diagrams',
    difficulty: 'Intermediate 🚀',
    file: 'practice/README.md',
    steps: [
      'Draft a clear ASCII art diagram for merge conflict resolution.',
      'Create branch: git checkout -b feature/conflict-example',
      'Update practice/README.md with structured sample output.',
      'Commit & push to your fork, then submit your Pull Request.'
    ]
  }
];

function initContributionGenerator() {
  const container = document.getElementById('idea-container');
  const rollBtn = document.getElementById('roll-idea-btn');

  if (!container || !rollBtn) return;

  let lastIndex = -1;

  function displayRandomIdea() {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * CONTRIBUTION_IDEAS.length);
    } while (randomIndex === lastIndex && CONTRIBUTION_IDEAS.length > 1);

    lastIndex = randomIndex;
    const idea = CONTRIBUTION_IDEAS[randomIndex];

    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';

    setTimeout(() => {
      container.innerHTML = `
        <div class="idea-card">
          <div class="idea-badge">${idea.difficulty} • Target File: <code>${idea.file}</code></div>
          <h3 class="idea-title">${idea.title}</h3>
          <ul class="idea-steps">
            ${idea.steps.map(step => `
              <li class="idea-step-item">
                <div class="step-checkbox">✓</div>
                <span>${step}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;

      // Interactive checklist
      container.querySelectorAll('.idea-step-item').forEach(item => {
        item.addEventListener('click', () => {
          item.classList.toggle('checked');
        });
      });

      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 200);
  }

  rollBtn.addEventListener('click', displayRandomIdea);
  displayRandomIdea();
}

/* -------------------------------------------------------------------------- */
/* 8. Toast Notification & Copy to Clipboard System                           */
/* -------------------------------------------------------------------------- */
let toastTimeout;
const checkIcon = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`;

// Clipboard API needs a secure context; fall back to execCommand (file://, http://)
function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy') ? resolve() : reject(); } catch (err) { reject(err); }
    ta.remove();
  });
}

function initToastSystem() {
  const toast = document.getElementById('app-toast');

  window.showToast = function (msg) {
    if (!toast) return;
    toast.innerHTML = `${checkIcon(18)}<span>${escapeHtml(msg)}</span>`;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy]');
    const text = btn?.getAttribute('data-copy');
    if (!text) return;
    copyText(text).then(() => {
      showToast(`Copied: ${text}`);
      const svg = btn.querySelector('svg');
      if (svg && !btn.dataset.busy) {        // guard: a 2nd click mid-flash used to freeze the check icon
        btn.dataset.busy = '1';
        const original = svg.outerHTML;
        svg.outerHTML = checkIcon(15);
        setTimeout(() => {
          const cur = btn.querySelector('svg');
          if (cur) cur.outerHTML = original;
          delete btn.dataset.busy;
        }, 1500);
      }
    }).catch(() => showToast('Failed to copy to clipboard'));
  });
}

/* -------------------------------------------------------------------------- */
/* 9. Modal System & Floating Back To Top                                     */
/* -------------------------------------------------------------------------- */
function initModalSystem() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  if (!overlay) return;
  let opener = null;

  function setOpen(open) {
    overlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeBtn?.focus({ preventScroll: true });
    else opener?.focus?.({ preventScroll: true });
  }

  document.querySelectorAll('.open-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); opener = btn; setOpen(true); });
  });
  closeBtn?.addEventListener('click', () => setOpen(false));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) setOpen(false);
  });
}

// Visibility of the button is toggled by the shared scroll handler in section 2
function initBackToTop() {
  document.getElementById('back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

/* -------------------------------------------------------------------------- */
/* 10. Live GitHub Stars Fetcher with Graceful Fallback                       */
/* -------------------------------------------------------------------------- */
function initGitHubStarsFallback() {
  const badge = document.getElementById('star-count-badge');
  if (!badge) return;
  const KEY = 'ieee-cs-stars';

  // Session cache: avoids re-hitting GitHub's 60 req/hr unauthenticated limit on every visit/reload
  try {
    const cached = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (cached && Date.now() - cached.t < 600000) { badge.textContent = `⭐ ${cached.n}`; return; }
  } catch (_) { /* storage unavailable */ }

  fetch(`https://api.github.com/repos/${REPO}`)
    .then(res => (res.ok ? res.json() : Promise.reject()))
    .then(data => {
      if (typeof data.stargazers_count !== 'number') return;
      badge.textContent = `⭐ ${data.stargazers_count}`;
      try { sessionStorage.setItem(KEY, JSON.stringify({ n: data.stargazers_count, t: Date.now() })); } catch (_) {}
    })
    .catch(() => { badge.textContent = '⭐ Star'; });
}

/* Helper Utilities */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}