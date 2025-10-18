# 📋 Database Quick Reference Card

## 🚀 Most Common Commands

### Development (Daily Use)

```bash
# Update database schema (SAFE - keeps data)
npm run db:setup:dev

# Fresh start (DANGER - deletes everything)
npm run db:setup:dev:fresh

# Create admin user
npm run db:create-admin

# Start server
npm start
```

### Production Deployment

```bash
# Run migrations (SAFE)
npm run db:migrate

# Check status
npm run db:migrate:status

# Start server
npm start
```

---

## 🎯 Decision Tree: Which Command Should I Use?

```
┌─────────────────────────────────────────┐
│    What are you trying to do?          │
└────────────┬────────────────────────────┘
             │
   ┌─────────┴─────────┐
   │                   │
   ▼                   ▼
DEVELOPMENT      PRODUCTION
   │                   │
   │                   │
   ▼                   ▼
First time?       First time?
   │                   │
 YES │ NO           YES │ NO
   │   │               │   │
   ▼   ▼               ▼   ▼
  [A] [B]             [C] [D]

[A] First Development Setup
    $ npm run db:setup:dev:fresh
    $ npm run db:create-admin

[B] Daily Development Work
    $ npm run db:setup:dev
    (Just pulled code? Same command!)

[C] First Production Setup
    $ npm run db:migrate
    (Runs all migrations)

[D] Production Update
    $ npm run db:migrate
    (Runs only new migrations)
```

---

## 🔄 Complete Workflows

### Workflow 1: Brand New Project Setup

```bash
# 1. Create database
createdb lms_db

# 2. Configure .env
cat > .env << EOF
DB_DATABASE=lms_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
NODE_ENV=development
JWT_SECRET=your-secret-key-here
EOF

# 3. Install dependencies
npm install

# 4. Setup database
npm run db:setup:dev:fresh

# 5. Create admin
npm run db:create-admin

# 6. Start server
npm start
```

**Time**: ~2 minutes  
**Data Loss**: N/A (fresh install)

---

### Workflow 2: Pulled New Code from Git

```bash
# 1. Pull latest code
git pull origin main

# 2. Install new dependencies (if any)
npm install

# 3. Update database
npm run db:setup:dev

# 4. Restart server
npm start
```

**Time**: ~30 seconds  
**Data Loss**: ❌ No (safe)

---

### Workflow 3: Deploy to Production

```bash
# 1. SSH to production server
ssh your-server

# 2. Pull latest code
cd /path/to/backend
git pull origin main

# 3. Install dependencies
npm install

# 4. Run migrations
NODE_ENV=production npm run db:migrate

# 5. Restart server
pm2 restart lms-backend
# or
npm start
```

**Time**: ~1-2 minutes  
**Data Loss**: ❌ No (migrations are safe)

---

### Workflow 4: Something Went Wrong - Reset Dev Database

```bash
# ⚠️ WARNING: This deletes all development data

# 1. Fresh reset
npm run db:setup:dev:fresh

# 2. Recreate admin
npm run db:create-admin

# 3. (Optional) Add sample data
npm run db:seed

# 4. Start fresh
npm start
```

**Time**: ~1 minute  
**Data Loss**: ⚠️ YES (only in development)

---

## 🆘 Emergency Troubleshooting

### Problem: Can't connect to database

```bash
# Check PostgreSQL is running
brew services list  # macOS
systemctl status postgresql  # Linux

# Start if not running
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# Test connection
psql -U postgres -d lms_db
```

---

### Problem: "Table already exists" error

```bash
# Check migration status
npm run db:migrate:status

# Development: Just reset
npm run db:setup:dev:fresh

# Production: Don't use force - check what's wrong
psql -d lms_db -c "\dt"
```

---

### Problem: "Column already exists" error

```bash
# Development: Reset database
npm run db:setup:dev:fresh

# Production: Edit migration to check first
# (Don't run destructive commands)
```

---

### Problem: Forgot admin password

```bash
# Recreate admin user
npm run db:create-admin
```

---

### Problem: Need to rollback production migration

```bash
# ⚠️ CAREFUL - Only do this if really needed

# 1. Check current status
npm run db:migrate:status

# 2. Backup database first!
pg_dump lms_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Rollback one migration
npm run db:migrate:undo

# 4. Verify
npm run db:migrate:status
```

---

## 📊 Understanding Your Database

### Tables Created (30+ tables)

**Core System**:
- `users` - User accounts
- `courses` - Course catalog
- `enrollments` - Student enrollments
- `course_chapters` - Course content
- `chapter_progress` - Student progress

**Testing System**:
- `course_tests` - Tests/quizzes
- `test_questions` - Test questions
- `test_question_options` - Answer choices
- `test_attempts` - Student test submissions
- `test_answers` - Individual answers
- `certificates` - Earned certificates

**Project System**:
- `projects` - Realtime projects
- `project_phases` - Project milestones
- `project_progress` - Student project work
- `documents` - Project documents
- `videos` - Project videos

**Hackathon System**:
- `hackathons` - Hackathon events
- `hackathon_participants` - Registrations
- `hackathon_submissions` - Project submissions
- `hackathon_groups` - Team groups
- `hackathon_group_members` - Team members

**Chat & Social**:
- `chat_messages` - Chat messages
- `chat_participants` - Chat participants
- `groups` - Student groups
- `group_members` - Group members

**Tracking**:
- `activity_logs` - User activity
- `achievements` - Student achievements
- `file_uploads` - Uploaded files
- `student_permissions` - Permission settings

**System**:
- `SequelizeMeta` - Migration tracking

---

## 🔐 Environment Variables

### Required Variables

```bash
# Database
DB_DATABASE=lms_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

# Environment
NODE_ENV=development  # or production

# Authentication
JWT_SECRET=your-secret-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket
```

### Check Your Configuration

```bash
# Show current database config
cat .env | grep DB_

# Test connection
psql -U $DB_USER -d $DB_DATABASE -h $DB_HOST
```

---

## 📈 Migration Status Commands

```bash
# Show all migrations and their status
npm run db:migrate:status

# Output looks like:
# up    001-create-users.js
# up    002-create-courses.js
# down  038-new-feature.js      ← Not yet applied
```

**Statuses**:
- `up` = Already applied ✅
- `down` = Pending ⏳

---

## ⚡ Pro Tips

### Tip 1: Check Before You Run
```bash
# Always check status before migrating
npm run db:migrate:status

# Check database exists
psql -l | grep lms
```

### Tip 2: Development Iteration
```bash
# Fast iteration during development:
# 1. Edit model file
# 2. npm run db:setup:dev
# 3. npm start
# 4. Test
# 5. Repeat
```

### Tip 3: Production Safety
```bash
# Always backup before production changes
pg_dump lms_prod > backup_$(date +%Y%m%d).sql

# Then migrate
npm run db:migrate
```

### Tip 4: View Database Schema
```bash
# Connect to database
psql -d lms_db

# List all tables
\dt

# Describe a table
\d users

# See all columns
\d+ users

# Exit
\q
```

### Tip 5: Check Logs
```bash
# Development logs show all SQL queries
npm run db:setup:dev
# Watch the output for SQL

# Production logs are silent (by design)
# Check PostgreSQL logs instead:
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 🎯 When to Use What

| Situation | Command | Safe? |
|-----------|---------|-------|
| First time setup | `db:setup:dev:fresh` | ⚠️ |
| Daily development | `db:setup:dev` | ✅ |
| Pulled new code | `db:setup:dev` | ✅ |
| Reset dev database | `db:setup:dev:fresh` | ⚠️ |
| Production deploy | `db:migrate` | ✅ |
| Production update | `db:migrate` | ✅ |
| Check prod status | `db:migrate:status` | ✅ |
| Emergency rollback | `db:migrate:undo` | ⚠️ |

**Legend**:
- ✅ = Safe, no data loss
- ⚠️ = Can lose data, use carefully

---

## 📞 Support Checklist

If something goes wrong, check these in order:

1. ✅ Is PostgreSQL running?
   ```bash
   psql -l
   ```

2. ✅ Is `.env` configured correctly?
   ```bash
   cat .env | grep DB_
   ```

3. ✅ Does the database exist?
   ```bash
   psql -l | grep lms
   ```

4. ✅ Can you connect manually?
   ```bash
   psql -U postgres -d lms_db
   ```

5. ✅ Are dependencies installed?
   ```bash
   npm install
   ```

6. ✅ What's the migration status?
   ```bash
   npm run db:migrate:status
   ```

7. ✅ Any errors in logs?
   ```bash
   npm start
   # Read the output
   ```

---

## 🔍 Useful SQL Queries

```sql
-- Connect to database
psql -d lms_db

-- Count users
SELECT COUNT(*) FROM users;

-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- See recent migrations
SELECT * FROM "SequelizeMeta" ORDER BY name DESC LIMIT 5;

-- Check admin users
SELECT id, name, email, role FROM users WHERE role = 'admin';

-- Count enrollments
SELECT COUNT(*) FROM enrollments;

-- Most recent hackathons
SELECT id, name, status, start_date 
FROM hackathons 
ORDER BY created_at DESC 
LIMIT 5;

-- Active students
SELECT COUNT(*) FROM users WHERE is_active = true AND role = 'student';
```

---

## 🎓 Key Concepts

### What is sequelize.sync()?
- Reads your model files
- Creates/updates tables automatically
- Fast but not safe for production

### What are migrations?
- SQL change scripts
- Version controlled
- Safe for production
- Can be rolled back

### What is SequelizeMeta?
- Special table
- Tracks which migrations ran
- Don't modify it manually

### Development vs Production
- **Dev**: Use sync (fast iteration)
- **Prod**: Use migrations (safety)

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All migrations tested in staging
- [ ] Database backup created
- [ ] `.env` configured for production
- [ ] `NODE_ENV=production` set
- [ ] SSL certificate valid
- [ ] Migration status checked
- [ ] Rollback plan prepared
- [ ] Team notified of deployment

---

## 📚 Further Reading

- `DATABASE_SETUP_GUIDE.md` - Detailed guide
- `DATABASE_MIGRATION_ANALYSIS.md` - Complete analysis
- `README_DATABASE.md` - Database documentation
- [Sequelize Docs](https://sequelize.org/docs/v6/other-topics/migrations/)

---

**Last Updated**: October 18, 2025  
**Quick Reference Version**: 1.0  
**Status**: ✅ Production Ready


