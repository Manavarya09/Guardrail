// Typical AI-generated code with common issues

// AI-Codegen: Hallucinated import
import { validateInput } from 'validation-utils';
import { formatDate } from 'date-utils';

// AI-Codegen: Unused imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// AI-Codegen: Placeholder code
const API_URL = "http://localhost:3000/api"; // hardcoded localhost
const WEBHOOK_URL = "https://example.com/webhook"; // placeholder URL

// Security: Insecure CORS
const app = express();
app.use(cors()); // no origin restriction

// TODO: Add authentication middleware
// FIXME: This is a temporary solution

// AI-Codegen: Fetch without error handling
async function getUsers() {
  const response = await fetch("http://localhost:8080/users");
  return response.json();
}

// AI-Codegen: Promise without catch
function loadData() {
  fetch("/api/data")
    .then(res => res.json())
    .then(data => processData(data));
}

// AI-Codegen: Overly broad catch
async function saveUser(user) {
  try {
    await db.save(user);
  } catch (err) {
    console.log(err);
  }
}

// AI-Codegen: Console log spam
function processData(data) {
  console.log("Processing data:", data);
  console.debug("Data length:", data.length);
  const result = data.map(item => item.value * 3.14159);
  console.log("Result:", result);
  return result;
}

// Security: Environment variable leak
function debugConfig() {
  console.log("DB Password:", process.env.DB_PASSWORD);
  console.log("API Key:", process.env.SECRET_KEY);
}

// Performance: N+1 query
async function getUserPosts(userIds) {
  const posts = [];
  for (const id of userIds) {
    const userPosts = await db.query("SELECT * FROM posts WHERE user_id = $1", [id]);
    posts.push(...userPosts);
  }
  return posts;
}
