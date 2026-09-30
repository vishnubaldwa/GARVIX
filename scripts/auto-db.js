const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
const envPath = path.join(__dirname, "..", ".env");

if (fs.existsSync(schemaPath)) {
  let isPostgres = false;
  
  if (process.env.DATABASE_URL) {
    isPostgres = process.env.DATABASE_URL.startsWith("postgres");
  } else if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    isPostgres = envContent.includes("postgres://") || envContent.includes("postgresql://");
  }
  
  const targetProvider = isPostgres ? "postgresql" : "sqlite";
  let schemaContent = fs.readFileSync(schemaPath, "utf8");
  const currentMatch = schemaContent.match(/provider\s*=\s*"(sqlite|postgresql)"/);
  
  if (currentMatch && currentMatch[1] !== targetProvider) {
    schemaContent = schemaContent.replace(/provider\s*=\s*"(sqlite|postgresql)"/g, `provider = "${targetProvider}"`);
    fs.writeFileSync(schemaPath, schemaContent, "utf8");
    console.log(`[Auto-DB] Automatically set Prisma schema provider to '${targetProvider}' based on environment.`);
  }
}
