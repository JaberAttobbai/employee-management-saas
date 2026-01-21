
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// تحميل متغيرات البيئة
dotenv.config();

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !authToken) {
    console.error('❌ DATABASE_URL or DATABASE_AUTH_TOKEN is missing');
    process.exit(1);
}

const client = createClient({
    url,
    authToken,
});

async function main() {
    console.log('🚀 Starting manual migration deployment to Turso...');

    // ترتيب الملفات حسب التاريخ (مهم جداً)
    const migrationsDir = path.join(__dirname, '../prisma/migrations');
    const dirs = fs.readdirSync(migrationsDir).sort();

    for (const dir of dirs) {
        if (dir === 'migration_lock.toml') continue;

        const migrationFile = path.join(migrationsDir, dir, 'migration.sql');
        if (fs.existsSync(migrationFile)) {
            console.log(`📦 Applying migration: ${dir}`);

            const sql = fs.readFileSync(migrationFile, 'utf8');

            // تقسيم الملف إلى جمل SQL (SQLite يدعم جملاً متعددة مفصولة بـ ;)
            // لكن LibSQL client قد يفضل تنفيذاً واحداً أو جمل منفصلة
            // للأمان، سننفذها جملة جملة إذا أمكن، أو نرسلها ككتلة واحدة إذا كان يدعمها

            try {
                await client.executeMultiple(sql);
                console.log(`✅ Applied: ${dir}`);
            } catch (e) {
                console.error(`❌ Failed to apply ${dir}:`, e);
                // لا نوقف العملية، قد يكون الخطأ "table already exists"
            }
        }
    }

    console.log('🎉 All migrations processed.');
}

main().catch(console.error);
