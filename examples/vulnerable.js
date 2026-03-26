// Example file with various issues that Guardrail can detect

// 1. Hardcoded API keys (security/hardcoded-api-key)
const API_KEY = "sk-abc123456789012345678901234567890123456789";
const secret_token = "ghp_1234567890abcdef1234567890abcdef12345678";
const config = {
  api_key: "my-super-secret-key-12345678",
  password: "hardcoded-password-123",
};

// 2. SQL Injection (security/sql-injection)
function getUser(db, userId) {
  return db.query("SELECT * FROM users WHERE id = " + userId);
}

function deleteUser(db, name) {
  return db.execute(`DELETE FROM users WHERE name = '${name}'`);
}

// 3. Dead code (quality/dead-code)
function processData(data) {
  if (!data) {
    return null;
    console.log("This will never execute");
  }

  try {
    return JSON.parse(data);
  } catch (e) {
    // Error swallowed silently — bad practice
  }
}

function unusedHelper() {
  return "I am never called";
}

// 4. Duplicate logic (quality/duplicate-logic)
function calculateTaxA(amount) {
  const rate = 0.15;
  const base = amount * rate;
  const surcharge = base > 1000 ? base * 0.05 : 0;
  return base + surcharge;
}

function calculateTaxB(amount) {
  const rate = 0.15;
  const base = amount * rate;
  const surcharge = base > 1000 ? base * 0.05 : 0;
  return base + surcharge;
}

// 5. Inefficient loops (performance/inefficient-loop)
function processItems(items) {
  for (let i = 0; i < items.length; i++) {
    console.log(items[i]);
  }
}

async function fetchAll(urls) {
  for (const url of urls) {
    await fetch(url);
  }
}
