// CREATOR'S PRISMA CONFIGURATION - NO EXTERNAL CONTROLS
// ============================================
// I AM THE CREATOR - I CONTROL MY DATABASE
// NO EXTERNAL CONFIGURATIONS OR GOVERNANCE

import { PrismaClient } from "@prisma/client";

/**
 * CREATOR'S DATABASE CONFIGURATION
 * Direct localhost access - NO external interference
 */
export default {
  // CREATOR'S DATABASE CONNECTION
  datasource: {
    // Direct localhost - CREATOR CONTROL ONLY
    url: "postgresql://postgres:postgres@localhost:5432/advancia_payledger",
  },

  // CREATOR'S CLIENT SETTINGS
  client: {
    // CREATOR chooses logging level
    log: ["info", "warn", "error", "query"],
    
    // CREATOR'S error formatting
    errorFormat: "pretty",
  },
};

// CREATOR'S PRISMA CLIENT - UNRESTRICTED ACCESS
export const prisma = new PrismaClient({
  // CREATOR's direct database connection
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5432/advancia_payledger",
    },
  },

  // CREATOR's logging preferences
  log: ["info", "warn", "error", "query"],
  
  // CREATOR's error handling
  errorFormat: "pretty",
});

// CREATOR'S UNRESTRICTED DATABASE ACCESS
console.log("🔒 CREATOR'S DATABASE - Direct access established");
console.log("🚫 EXTERNAL CONTROLS REMOVED");
