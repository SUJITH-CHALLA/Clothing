# Comprehensive Testing Strategy

## Overview
This document outlines the testing strategy for the **Clothify** e-commerce platform. The primary diagnostic and static analysis tool used in this project is **React Doctor**, paired with standard integration testing. React Doctor provides automated analysis of React/Next.js code for performance, architecture, security, and dead code elimination.

## 1. Automated Code Diagnostics (React Doctor)
[React Doctor](https://github.com/millionco/react-doctor) runs across all React components and Next.js routes.

### Execution
Run diagnostics locally before committing code:
```bash
npx -y react-doctor@latest . --verbose
```

### Analysis Scenarios & Rule Categories
React Doctor identifies issues across these core areas:

1. **State & Effects**:
   - Spotting infinite render loops in `useEffect`.
   - Identifying missing dependencies or improper state mutations.
   - Misuse of `useCallback` or `useMemo`.

2. **Performance Optimization**:
   - Unnecessary re-renders.
   - Heavy synchronous computations blocking the main thread.
   - Missing React Server Component boundaries (`"use client"` vs Server Components).

3. **Architecture & Correctness**:
   - Improper prop drilling.
   - Invalid hook calls outside functional components.
   - Next.js App Router specific rules (e.g., proper metadata exports, invalid routing handlers).

4. **Dead Code Elimination**:
   - Unused configuration files.
   - Unused component exports.
   - Duplicate implementations.
   - Dead TypeScript types.

5. **Accessibility & Security**:
   - Missing `alt` tags on `<img>` or Next.js `<Image>`.
   - Improper ARIA roles.
   - Prevention of XSS via unsafe prop injections (`dangerouslySetInnerHTML`).

### CI/CD Integration
React Doctor will be integrated into GitHub Actions to enforce code health on every Pull Request.
```yaml
- uses: actions/checkout@v5
  with:
    fetch-depth: 0
- uses: millionco/react-doctor@main
  with:
    diff: main
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
*Threshold Protocol*: A Health Score of **75+** is required for merges. Any score under 75 ("Needs work" or "Critical") will fail the pipeline.

## 2. Configuration
The project uses `react-doctor.config.json` at the root directory to suppress specific false positives (e.g., generated UI files from Shadcn that we intentionally do not modify).

```json
{
  "ignore": {
    "rules": ["react/no-danger"],
    "files": ["src/components/ui/**"]
  }
}
```

## 3. End-to-End Scenarios to Validate
In addition to React Doctor's static analysis, we ensure the structural integrity of the application by testing the following UX/UI states:
- **Authentication**: Successful OTP rendering, user session persistence via Supabase.
- **Cart & Checkout**: Drawer toggling, real-time quantity calculations, responsive Razorpay integration.
- **Admin Layout**: Proper protection middleware blocking non-admin users from accessing `/admin`.
