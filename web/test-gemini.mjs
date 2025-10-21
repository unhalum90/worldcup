// Simple test to verify Gemini API key and find available models
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error('❌ No API key found. Set GEMINI_API_KEY in .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listAvailableModels() {
  console.log('🔍 Fetching list of available models from API...\n');
  
  try {
    // Use the REST API directly to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    
    console.log('📋 Available models:');
    data.models.forEach(model => {
      console.log(`  - ${model.name}`);
      if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
        console.log(`    ✅ Supports generateContent`);
      }
    });
    
    return data.models;
  } catch (error) {
    console.error('❌ Failed to list models:', error.message);
    return [];
  }
}

async function testModels() {
  console.log('🧪 Testing Gemini API...\n');
  
  // First, list what's available
  const availableModels = await listAvailableModels();
  
  if (availableModels.length === 0) {
    console.log('\n❌ Could not retrieve model list. Trying known models anyway...\n');
  } else {
    console.log('\n🧪 Testing models that support generateContent...\n');
  }
  
  const modelsToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "Hello World" in JSON format');
      const response = await result.response;
      const text = response.text();
      console.log(`✅ ${modelName} works!`);
      console.log(`   Response: ${text.substring(0, 100)}...\n`);
      
      // If we found a working model, save it
      console.log(`\n🎉 SUCCESS! Use this model name: "${modelName}"\n`);
      break;
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}\n`);
    }
  }
}

listAvailableModels().then(() => {
  console.log('\n');
  testModels();
});
