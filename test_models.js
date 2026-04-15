import fs from 'fs';

const getEnvKey = () => {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
  return match ? match[1].trim() : null;
};

const apiKey = getEnvKey();
if (!apiKey) {
  console.log("No API key found in .env");
  process.exit(1);
}

const listModels = async () => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      console.log("All available models:");
      data.models.forEach(m => {
        console.log(m.name);
      });
    } else {
      console.log("Error fetching models:", data);
    }
  } catch (error) {
    console.log("Error:", error);
  }
};

listModels();
