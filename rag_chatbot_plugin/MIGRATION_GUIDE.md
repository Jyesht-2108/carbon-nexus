# Migration Guide: MySQL to Supabase

This guide helps you migrate the RAG Chatbot Plugin from MySQL to Supabase.

## Prerequisites

- Supabase account and project created
- Supabase project URL and service role key
- Existing MySQL data (if any) to migrate

---

## Step 1: Update Dependencies

```bash
npm install @supabase/supabase-js
npm uninstall mysql2
```

---

## Step 2: Update Environment Variables

Edit `.env`:

```env
# Remove these (MySQL)
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=password
# DB_NAME=erp_rag

# Add these (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 3: Create Supabase Tables

Go to your Supabase dashboard → SQL Editor and run:

```sql
-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id BIGSERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  student_id BIGINT NOT NULL,
  class_id INT NOT NULL,
  qdrant_collection TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_uploads_student ON uploads(student_id);
CREATE INDEX idx_uploads_class ON uploads(class_id);

-- Ingestion jobs table
CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id BIGSERIAL PRIMARY KEY,
  upload_id BIGINT NOT NULL REFERENCES uploads(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','done','failed')),
  processed_at TIMESTAMPTZ,
  chunks_count INT DEFAULT 0,
  error_message TEXT
);

CREATE INDEX idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX idx_ingestion_jobs_upload ON ingestion_jobs(upload_id);

-- NEW: Recommendations table (for Carbon Nexus)
CREATE TABLE IF NOT EXISTS recommendations (
  id BIGSERIAL PRIMARY KEY,
  hotspot_id BIGINT,
  supplier_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  co2_reduction FLOAT,
  cost_impact TEXT,
  feasibility INT CHECK (feasibility >= 0 AND feasibility <= 10),
  confidence FLOAT,
  root_cause TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','implemented')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_hotspot ON recommendations(hotspot_id);
CREATE INDEX idx_recommendations_supplier ON recommendations(supplier_id);
```

---

## Step 4: Migrate Existing Data (Optional)

If you have existing MySQL data:

### Export from MySQL

```bash
mysqldump -u root -p erp_rag uploads ingestion_jobs > backup.sql
```

### Convert to Supabase Format

1. Convert `AUTO_INCREMENT` to `BIGSERIAL`
2. Convert `DATETIME` to `TIMESTAMPTZ`
3. Convert `ENUM` to `TEXT` with `CHECK` constraints

### Import to Supabase

Use Supabase SQL Editor to run the converted SQL.

---

## Step 5: Update Code (Already Done)

The following files have been updated:

✅ `src/config/database.ts` - Supabase client  
✅ `src/config/env.ts` - Supabase config  
✅ `package.json` - Dependencies  
✅ `.env` and `.env.example` - Environment variables  

---

## Step 6: Test the Migration

```bash
# Start the service
npm run dev

# Test health check
curl http://localhost:4000/health

# Test recommendation endpoint
npm run test:recommend
# or
./test-recommend.ps1
```

---

## Step 7: Update Upload/Query Controllers (If Needed)

The upload and query controllers may need updates to use Supabase syntax:

### MySQL Syntax (Old)
```typescript
await db.execute('INSERT INTO uploads VALUES (?, ?, ?)', [val1, val2, val3]);
```

### Supabase Syntax (New)
```typescript
await db.from('uploads').insert({ col1: val1, col2: val2 });
```

---

## Common Issues & Solutions

### Issue 1: Connection Error
**Error:** `Failed to connect to Supabase`

**Solution:** 
- Check `SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_KEY` has proper permissions
- Ensure network connectivity

### Issue 2: Table Not Found
**Error:** `relation "uploads" does not exist`

**Solution:**
- Run the SQL table creation script in Supabase SQL Editor
- Verify tables exist in Supabase dashboard

### Issue 3: Permission Denied
**Error:** `permission denied for table uploads`

**Solution:**
- Use `SUPABASE_SERVICE_KEY` (not anon key) for backend operations
- Service role key bypasses Row Level Security

---

## Verification Checklist

- [ ] Dependencies installed (`@supabase/supabase-js`)
- [ ] Environment variables updated
- [ ] Tables created in Supabase
- [ ] Service starts without errors
- [ ] Health check passes
- [ ] Recommendation endpoint works
- [ ] Data is being saved to Supabase

---

## Rollback Plan

If you need to rollback to MySQL:

1. Restore `.env` with MySQL credentials
2. Run `npm install mysql2`
3. Revert `src/config/database.ts` from git
4. Restart service

---

## Performance Comparison

| Feature | MySQL | Supabase |
|---------|-------|----------|
| Setup Time | Manual | Instant |
| Scaling | Manual | Auto |
| Backups | Manual | Auto |
| API Access | Custom | Built-in REST |
| Real-time | Custom | Built-in |
| Auth | Custom | Built-in |

---

## Next Steps

1. ✅ Migration complete
2. Test all endpoints thoroughly
3. Update any custom queries
4. Set up Row Level Security (if needed)
5. Configure backups in Supabase dashboard
6. Monitor performance

---

## Support

For issues:
- Check Supabase logs in dashboard
- Review `logs/` directory
- Check service logs: `npm run dev`

Migration complete! 🎉
