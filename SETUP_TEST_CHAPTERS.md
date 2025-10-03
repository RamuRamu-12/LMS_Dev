# Test Chapters Setup Guide

This guide explains how to integrate tests into course chapters so students can take tests directly from the chapter view.

## What's Been Changed

### Backend Changes

1. **Database Migration** (`backend/migrations/034-add-test-id-to-chapters.js`)
   - Added `test_id` column to `course_chapters` table
   - Links chapters to tests

2. **CourseChapter Model** (`backend/models/CourseChapter.js`)
   - Added `test_id` field
   - Updated validation to allow chapters with only a test (no video/PDF required)
   - Added `hasTest()` method

3. **Model Associations** (`backend/models/index.js`)
   - Added relationship between CourseChapter and CourseTest

4. **Course Controller** (`backend/controllers/courseController.js`)
   - Updated `getCourseContent` to include test data when fetching chapters

5. **Test Taking Controller** (`backend/controllers/testTakingController.js`)
   - Automatically generates certificates when students pass tests

### Frontend Changes

1. **StudentChapterView Component** (`frontend/src/components/course/StudentChapterView.jsx`)
   - Detects when a chapter has an associated test
   - Shows beautiful test interface with test details
   - Launches TestTakingModal when "Take Test" is clicked
   - Displays test information: passing score, time limit, max attempts

## Setup Steps

### Step 1: Run the Migration

Run the migration to add the `test_id` column to the database:

```bash
cd backend
node run-migration.js 034-add-test-id-to-chapters
```

### Step 2: Link Your Test Chapter to a Test

You have two options:

#### Option A: Using the Helper Script

First, find your course ID, chapter title, and test ID. Then run:

```bash
cd backend
node link-test-to-chapter.js <courseId> "<chapterTitle>" <testId>
```

Example:
```bash
node link-test-to-chapter.js 1 "Final_Assignment" 1
```

#### Option B: Using SQL (if you prefer)

```sql
-- First, find your chapter ID
SELECT id, title, course_id FROM course_chapters WHERE title LIKE '%Final%';

-- Then, find your test ID
SELECT id, title, course_id FROM course_tests WHERE course_id = <your_course_id>;

-- Update the chapter to link to the test
UPDATE course_chapters 
SET test_id = <test_id> 
WHERE id = <chapter_id>;
```

### Step 3: Restart the Backend Server

```bash
cd backend
npm start
```

Or if you're using nodemon:
```bash
npm run dev
```

### Step 4: Test the Feature

1. Log in as a student
2. Navigate to the course
3. Click on the test chapter (e.g., "Final_Assignment")
4. You should see a beautiful test interface instead of "No Content Available"
5. Click "Take Test" to start the test
6. Complete and submit the test
7. If you pass (score >= passing score), you'll automatically receive a certificate!

## How It Works

### Test Chapter Flow

1. **Chapter View**: When a student clicks on a chapter that has a `test_id`, the StudentChapterView component detects it and shows:
   - Test title and description
   - Passing score, time limit, and max attempts
   - A "Take Test" button
   - Instructions (if provided)

2. **Taking the Test**: When the student clicks "Take Test":
   - TestTakingModal opens
   - Student answers questions
   - Timer counts down (if time limit is set)
   - Student submits test

3. **Test Results**: After submission:
   - Score is calculated
   - If passed: Certificate is automatically generated
   - Results are displayed with score breakdown
   - Student can view their certificate in their profile

### Certificate Generation

When a student passes a test (score >= passing_score):
- A certificate is automatically created
- Certificate includes:
  - Student name
  - Course name
  - Test title
  - Score achieved
  - Unique certificate number
  - Verification code
  - Issue date

Students can view and download their certificates from:
- Profile page
- Achievements section
- Certificate verification page

## Creating New Test Chapters

To create a new chapter that contains a test:

### 1. Create the Test First

Use the admin panel to create a test:
- Go to Course Management
- Select the course
- Create a new test with questions

### 2. Create the Chapter

When creating a new chapter via the admin panel:
- Set a clear title (e.g., "Chapter 5 Assessment", "Final Exam")
- Leave video_url and pdf_url empty if you only want a test
- After creation, use the helper script to link it to a test

OR, if the admin interface supports it, select the test when creating the chapter.

## Troubleshooting

### "No Content Available" Still Shows

Check:
1. Migration ran successfully
2. Chapter has `test_id` set in database
3. Test is active (`is_active = true`)
4. Backend server was restarted
5. Frontend was refreshed (clear cache if needed)

### "Must be enrolled to take test" Error

The student must:
1. Be logged in
2. Be enrolled in the course
3. Have a valid enrollment status

### Certificate Not Generated

Check:
1. Student's score is >= test passing_score
2. No existing certificate for this student + course
3. Backend logs for any errors
4. Database `certificates` table

## Database Schema

### course_chapters Table (Updated)

```sql
CREATE TABLE course_chapters (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT,
    pdf_url TEXT,
    test_id INTEGER REFERENCES course_tests(id),  -- NEW FIELD
    chapter_order INTEGER NOT NULL,
    duration_minutes INTEGER,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Relationships

- CourseChapter → CourseTest (via test_id)
- CourseChapter → Course (via course_id)
- CourseTest → Course (via course_id)

## API Endpoints Used

- `GET /api/courses/:id/content` - Fetches course with chapters and tests
- `GET /api/tests/:id/questions` - Gets questions for a test
- `POST /api/test-taking/start` - Starts a test attempt
- `POST /api/test-taking/submit` - Submits test answers (auto-generates certificate if passed)

## Future Enhancements

Possible improvements:
- Allow multiple tests per chapter
- Support for practice tests (no certificate)
- Test prerequisites (complete other chapters first)
- Randomized question order
- Question bank with random selection
- Time bonuses for quick completion

## Support

If you encounter any issues:
1. Check backend logs (`backend/logs/error.log`)
2. Check browser console for frontend errors
3. Verify database schema is up to date
4. Ensure all migrations have run successfully

---

**Created:** {{date}}
**Last Updated:** {{date}}

