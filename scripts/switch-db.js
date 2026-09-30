const fs = require("fs");
const path = require("path");

const target = process.argv[2];
const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

if (!fs.existsSync(schemaPath)) {
  console.error("❌ prisma/schema.prisma not found.");
  process.exit(1);
}

let content = fs.readFileSync(schemaPath, "utf8");

if (target === "postgres" || target === "postgresql") {
  content = content.replace(/provider\s*=\s*"(sqlite|postgresql)"/g, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, content, "utf8");
  console.log("✅ Successfully switched Prisma schema provider to: postgresql");
} else if (target === "sqlite") {
  content = content.replace(/provider\s*=\s*"(sqlite|postgresql)"/g, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, content, "utf8");
  console.log("✅ Successfully switched Prisma schema provider to: sqlite");
} else {
  console.log("Usage: node scripts/switch-db.js [postgres|sqlite]");
  process.exit(1);
}
