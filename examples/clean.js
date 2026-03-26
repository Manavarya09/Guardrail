// Example of clean code that passes all Guardrail rules

// Good: API key from environment
const apiKey = process.env.API_KEY;

// Good: Parameterized query
function getUser(db, userId) {
  return db.query("SELECT * FROM users WHERE id = $1", [userId]);
}

// Good: Proper error handling
function processData(data) {
  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse data:", error.message);
    return null;
  }
}

// Good: Cached loop length
function processItems(items) {
  const len = items.length;
  for (let i = 0; i < len; i++) {
    console.log(items[i]);
  }
}

// Good: Concurrent async operations
async function fetchAll(urls) {
  const results = await Promise.all(urls.map((url) => fetch(url)));
  return results;
}

export { getUser, processData, processItems, fetchAll };
