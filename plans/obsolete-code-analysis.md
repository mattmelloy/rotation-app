# Obsolete Code Analysis Report

**Generated:** 2026-02-16  
**Project:** The Rotation  
**Status:** ✅ CLEANUP COMPLETED

This report identifies unused code, deprecated functions, and files that can be safely removed from the codebase.

---

## Summary

| Category | Count | Status |
|----------|-------|--------|
| Unused Components | 1 | ✅ Deleted |
| Unused Exports | 3 | ✅ Removed |
| Deprecated Functions | 1 | ✅ Removed |
| Duplicate API Routes | 5 files | ⚠️ Requires evaluation |
| Potentially Outdated Docs | 8 files | ⚠️ Requires review |

---

## 1. Unused Components

### `components/CloudSyncModal.tsx` ✅ **DELETED**

**Lines:** ~250  
**Status:** Deleted - was never imported anywhere

---

## 2. Unused Exports

### `lib/supabase.ts`

#### `isHardcoded()` ✅ **REMOVED**
- Was only referenced by the unused `CloudSyncModal.tsx`
- Always returned `false` - served no purpose

### `lib/storage.ts`

#### `removeItem()` ✅ **REMOVED**
- Was exported but never imported anywhere in the codebase
- IndexedDB cleanup is handled elsewhere

### `utils.ts`

#### `getTier()` ✅ **REMOVED** (Deprecated)
- Was marked as `@deprecated`
- Was not imported anywhere (only `getMealTier` is used)

---

## 3. Duplicate API Implementations

The project has **two separate API implementations** for the same endpoints:

### Vercel Serverless Functions (Active)
```
api/ai/
├── chat.ts
├── edit-recipe.ts
├── generate-recipe.ts
├── parse-image.ts
└── thermomix-method.ts
```

### Express Server (Potentially Unused)
```
server/
├── index.ts
├── routes/
│   └── ai.ts (contains all the same endpoints)
└── package.json (separate dependencies)
```

**Analysis:**
- The frontend (`ai.ts`, `AIChefChat.tsx`) uses `/api/ai/...` routes
- These routes are handled by Vercel serverless functions in production
- The Express server appears to be for local development only

**Recommendation:** 
- If local development works with Vite's proxy + Vercel dev, the `server/` directory can be removed
- Otherwise, keep it but document its purpose clearly

---

## 4. Potentially Outdated Documentation

### Plans Directory
```
plans/
├── meals-page-redesign.md          (15.8 KB)
├── three-tier-categorization-design.md (14.4 KB)
└── website-review-improvement-plan.md  (15.8 KB)
```

These appear to be planning documents. If the features have been implemented, these can be:
- Archived to a `docs/archive/` folder
- Or deleted if no longer needed

### Root-Level Documentation
```
BACKEND_SETUP.md
DATA_SYNC_FIX.md
FIX_SUPABASE_SCHEMA.md
SUPABASE_README.md
VERCEL_DEPLOYMENT.md
```

These may contain outdated information. Review each for:
- Current relevance
- Duplicate information
- Whether they should be consolidated into a single `docs/` folder

---

## 5. Code Quality Observations

### Constants File Size
- `constants.ts` is **15,652 chars** (~450 lines)
- Contains 12 example meals with full recipes
- Consider: Move to a separate `data/initialMeals.ts` file

### App.tsx Size  
- `App.tsx` is **35,527 chars** (~850 lines)
- Contains multiple inline components and modals
- Consider: Extract modals to separate files

---

## Action Items

### Immediate (Safe to Delete)
1. ✅ Delete `components/CloudSyncModal.tsx`
2. ✅ Delete `isHardcoded()` from `lib/supabase.ts`
3. ✅ Delete `removeItem()` from `lib/storage.ts`
4. ✅ Delete `getTier()` from `utils.ts`

### After Verification
5. ⚠️ Evaluate if `server/` directory is needed for local dev
6. ⚠️ Review and consolidate documentation files
7. ⚠️ Archive completed plan files

### Future Improvements
8. 📝 Consider splitting `App.tsx` into smaller modules
9. 📝 Move initial meals data to separate file

---

## Verification Commands

```bash
# Verify CloudSyncModal is unused
grep -r "CloudSyncModal" --include="*.ts*" --exclude-dir=node_modules .

# Verify removeItem is unused
grep -r "removeItem" --include="*.ts*" --exclude-dir=node_modules .

# Verify getTier is unused (except in utils.ts itself)
grep -r "getTier" --include="*.ts*" --exclude-dir=node_modules .
```

---

## Estimated Cleanup Impact

- **Lines of code removed:** ~300-600 lines
- **Files deleted:** 1-2 files (plus potentially `server/` directory)
- **Maintenance burden reduced:** Fewer files to understand and maintain
- **No functional impact:** All identified code is unused or deprecated
