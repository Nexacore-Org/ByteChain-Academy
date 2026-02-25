# Inline Quiz Manager Panel — Implementation Summary

## Overview

Implemented a full inline quiz management UI for the admin lessons list, including a slide-over panel, create/edit modes, and integration with lesson forms.

## Files Created

| File | Purpose |
|------|---------|
| `lib/api.ts` | API client for backend (`NEXT_PUBLIC_API_URL` or `http://localhost:3001`) |
| `hooks/use-lesson-quiz.ts` | Fetch, create, update quiz; manage panel open/close and loading/error state |
| `hooks/use-admin-lessons.ts` | Fetch lessons for a course and derive `hasQuiz` from quiz API |
| `components/ui/sheet.tsx` | Slide-over panel from the right |
| `components/admin/quiz-question-block.tsx` | Single question block with options, radio, drag handle, add/remove |
| `components/admin/quiz-manager-panel.tsx` | Slide-over panel with create/edit modes, passing score, DnD questions |
| `components/admin/lesson-row.tsx` | Lesson row with conditional Quiz badge (amber vs muted + Quiz) |
| `components/admin/new-lesson-form.tsx` | New lesson dialog; quiz section locked until saved |
| `components/admin/edit-lesson-form.tsx` | Edit lesson dialog; fetches quiz on load, shows "X questions" or "No quiz attached" |
| `app/admin/layout.tsx` | Admin layout with header |
| `app/admin/page.tsx` | Admin courses list |
| `app/admin/courses/[courseId]/lessons/page.tsx` | Admin lessons list with LessonRow, Quiz panel, New/Edit forms |

## Files Modified

| File | Change |
|------|--------|
| `components/header.tsx` | Added Admin link when `user.role === "Admin"` |
| `package.json` | Added `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |

## API Integration

Uses backend endpoints:

- `GET /quizzes/lesson/:lessonId` — fetch quiz (404 = no quiz)
- `POST /quizzes` — create quiz (body: `title`, `description`, `lessonId`, `questions`)
- `PATCH /quizzes/:id` — update quiz (replaces questions)
- `GET /lessons/course/:courseId` — list lessons
- `GET /lessons/:id` — get lesson
- `POST /lessons` — create lesson
- `PATCH /lessons/:id` — update lesson

Backend `correctAnswer` is the option text string. Passing score is stored in quiz description (backend uses 70% by default).

## Features Implemented

### 1. Lesson Row Quiz Button

- **With quiz**: amber badge "Quiz" — opens panel in edit mode
- **Without quiz**: muted grey "+ Quiz" with dashed border — opens panel in create mode
- Click opens slide-over panel (no navigation)

### 2. Quiz Manager Panel

- **Create mode**: empty state → "Create Quiz" → passing score input, Add Question, Save Quiz
- **Edit mode**: pre-filled with existing questions, Update Quiz
- Passing score 1–100 (default 70)
- Questions: text, options (2–6), correct answer radio, remove option/question
- Drag-and-drop question reorder
- Inline validation (min 2 options, one correct, non-empty question)
- Success toast "Quiz saved" on save
- Error banner on save failure; Retry on fetch failure
- Loading skeleton (3 blocks) while fetching
- Save/Update button shows spinner and is disabled during submit

### 3. Lesson Forms

- **New Lesson**: Quiz section disabled until lesson is saved; then "+ Add Quiz" opens panel
- **Edit Lesson**: Fetches quiz on load; shows "X questions" or "No quiz attached"; "Edit Quiz" / "+ Add Quiz" opens panel

## How to Test

1. **Set Admin role**  
   - Sign in and set `user_profile` in localStorage to include `"role": "Admin"`,  
   - or update user context/profile to support changing role.

2. **Start backend**  
   - Backend on port 3001 with CORS for `http://localhost:3000`.

3. **Open Admin**  
   - Visit `/admin` (Admin link in header if role is Admin).  
   - Or go directly to `/admin/courses/{courseId}/lessons` (use a course ID from the backend).

4. **Test flows**
   - Quiz button on lesson rows (with/without quiz)
   - Create quiz via panel
   - Edit existing quiz
   - Add quiz from New Lesson form (after saving lesson)
   - Add/Edit quiz from Edit Lesson form

## Environment

- `NEXT_PUBLIC_API_URL` — optional; defaults to `http://localhost:3001`
