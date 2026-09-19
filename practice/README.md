# 🛠️ Git & GitHub Practice

Welcome to the practice section of the **Git & GitHub Workshop - IEEE Computer Society UCEOU**.

The best way to learn Git and GitHub is to use them.

This section is designed to help you practice the workflow covered in the workshop and build confidence before making your first open-source contribution.

---

## 🎯 What You'll Practice

By completing these exercises, you will practice:

- 🍴 Forking a repository
- 📥 Cloning a repository
- 🌿 Creating and switching branches
- ✏️ Making changes
- 💾 Creating commits
- 🚀 Pushing branches to GitHub
- 🔀 Merging branches
- ⚔️ Creating and resolving merge conflicts
- 🔃 Creating Pull Requests
- 👀 Going through code review
- 🌱 Making your first contribution

---

# 🧩 Practice 1: Your First Branch

Start with a repository you have access to.

Create a new branch:

```bash
git switch -c practice-your-name
```

Make a small change to a file.

For example, you could improve a sentence in the documentation or add a useful Git command.

Then:

```bash
git status
git add .
git commit -m "Add my first practice change"
git push origin practice-your-name
```

### Goal

Understand the relationship between:

```text
Working Directory
       ↓
Staging Area
       ↓
Local Repository
       ↓
Remote Repository
```

---

# 🔀 Practice 2: Create and Merge Branches

Create a new branch:

```bash
git switch -c feature-example
```

Make a change and commit it.

Then switch back to your main branch:

```bash
git switch main
```

Merge your branch:

```bash
git merge feature-example
```

### Goal

Understand how Git combines work from different branches.

---

# ⚔️ Practice 3: Create a Merge Conflict

Merge conflicts are a normal part of collaborative development.

To practice:

1. Create a branch.
2. Change the same line of a file.
3. Commit the change.
4. Return to `main`.
5. Create another branch.
6. Change the same line differently.
7. Commit the change.
8. Attempt to merge the branches.

Git will detect that it cannot automatically decide which change should remain.

You may see conflict markers such as:

```text
<<<<<<< HEAD
Your version
=======
Other version
>>>>>>> branch-name
```

Resolve the file manually, then:

```bash
git add .
git commit -m "Resolve merge conflict"
```

### Goal

Learn that a merge conflict isn't an error to panic about.

It is Git asking:

> **"Which version should I keep?"**

---

# 🚀 Practice 4: Your First Pull Request

Now try the complete GitHub collaboration workflow.

```text
Fork
 ↓
Clone
 ↓
Branch
 ↓
Change
 ↓
Commit
 ↓
Push
 ↓
Pull Request
 ↓
Review
 ↓
Merge
```

Use this repository or another repository where you have permission to contribute.

When creating your Pull Request:

- Give it a clear title.
- Explain what you changed.
- Explain why you changed it.
- Check your changes before submitting.
- Respond to review feedback if requested.

The repository's Pull Request template will help guide you.

---

# 🌱 Practice 5: Make a Real Contribution

Ready to go beyond practice?

Look through the repository's **Issues** and find something you can improve.

Look for issues labelled:

- `good first issue`
- `help wanted`
- `documentation`
- `beginner`

You can also create an Issue if you find a problem or have an improvement idea.

Then follow the contribution workflow described in [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

# 💡 What Can You Contribute?

Your contribution doesn't need to be complicated.

You could:

- Fix a typo
- Improve documentation
- Add a Git command example
- Improve an explanation
- Add a beginner FAQ
- Add a useful learning resource
- Fix a broken link
- Improve the workshop material
- Suggest a new practice exercise

Start small.

The objective is to understand the **process of contributing**, not to make the biggest change.

---

# 🧠 Practice Checklist

Use this checklist to track your progress:

### Git Basics

- [ ] I can check repository status
- [ ] I can create a branch
- [ ] I can switch between branches
- [ ] I can stage changes
- [ ] I can create commits
- [ ] I can push a branch

### Collaboration

- [ ] I can fork a repository
- [ ] I can clone a fork
- [ ] I can create a Pull Request
- [ ] I understand code review
- [ ] I can respond to review feedback
- [ ] I understand how a Pull Request gets merged

### Merge Conflicts

- [ ] I have created a merge conflict
- [ ] I understand conflict markers
- [ ] I can resolve a merge conflict
- [ ] I can commit the resolved changes

### Open Source

- [ ] I have found a beginner-friendly Issue
- [ ] I have made a meaningful contribution
- [ ] I have opened a Pull Request
- [ ] I have completed my first contribution 🎉

---

# 🚀 What's Next?

Once you're comfortable with Git and GitHub, don't stop here.

Explore:

- Open-source projects
- GitHub Issues
- Pull Requests
- Code reviews
- GitHub Actions
- Continuous Integration
- Project documentation
- Developer communities

The goal is to move from:

```text
Learning Git
     ↓
Practicing Git
     ↓
Collaborating with Git
     ↓
Contributing to Open Source
     ↓
Building with the Community
```

---

## ⭐ Remember

You don't learn Git by memorizing commands.

You learn Git by **using it, breaking things, fixing them, and collaborating with other people.**

Happy practicing! 🚀

**IEEE Computer Society - UCEOU**