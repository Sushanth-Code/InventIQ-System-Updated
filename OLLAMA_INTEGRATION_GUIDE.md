# Ollama Integration Guide for InventIQ

This guide explains how to integrate [Ollama](https://github.com/ollama/ollama) with your InventIQ Smart Inventory Assistant to enhance its AI capabilities.

## What is Ollama?

Ollama is an open-source project that allows you to run large language models (LLMs) locally on your machine. It provides a simple API for running models like Llama, Mistral, and others without requiring cloud services.

## Why Use Ollama with InventIQ?

- **Privacy**: Your inventory data stays on your machine
- **No API costs**: Run AI models without subscription fees
- **Customization**: Fine-tune models for inventory-specific tasks
- **Offline capability**: Use AI features without internet connection

## Installation Guide

### 1. Install Ollama

Visit [https://ollama.com/download](https://ollama.com/download) and download the installer for your operating system.

- **Windows**: Download and run the installer
- **macOS**: Download the .dmg file and drag to Applications
- **Linux**: Follow the instructions on the download page

### 2. Verify Ollama Installation

After installation, Ollama will run as a service on your machine. You can verify it's working by opening a terminal/command prompt and running:

```bash
ollama list
```

You should see a list of available models (might be empty if you haven't pulled any yet).

### 3. Pull the Llama3 Model

Ollama needs to download the model files before you can use them. Run:

```bash
ollama pull llama3
```

This will download the Llama3 model, which is recommended for InventIQ. The download may take some time depending on your internet connection (approximately 4-5GB).

## Configuration

### 1. Environment Variables

The InventIQ backend is already configured to use Ollama, but you can customize the settings by creating a `.env` file in the backend directory with these variables:

```
USE_OLLAMA=True
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

### 2. Start the Backend

Start your InventIQ backend as usual:

```bash
cd backend
python app.py
```

### 3. Start the Frontend

```bash
cd frontend
npm start
```

## Using the Smart Assistant with Ollama

1. Navigate to the Smart Assistant tab in the InventIQ interface
2. Ask questions about your inventory such as:
   - "Show me low stock items"
   - "What are the trending products?"
   - "Should I restock any items?"
   - "Give me an inventory summary"

## Troubleshooting

### Ollama Not Responding

If you get errors about connecting to Ollama:

1. Check if Ollama is running with: `ollama ps`
2. If not running, start it with: `ollama serve`
3. Verify the API is accessible by visiting: http://localhost:11434/api/tags

### Model Not Found

If you get a "model not found" error:

1. List available models: `ollama list`
2. Pull the required model: `ollama pull llama3`
3. Update your .env file to use an available model

## Advanced Configuration

### Using Different Models

Ollama supports various models. You can try others by:

1. Pulling the model: `ollama pull mistral`
2. Updating your .env file: `OLLAMA_MODEL=mistral`

### Custom Model Parameters

You can adjust model parameters in `backend/app/services/ollama_service.py` to change:

- Temperature (creativity level)
- Max tokens (response length)
- System prompt (instructions to the AI)

## Performance Considerations

Running LLMs locally requires significant system resources:

- **Recommended**: 16GB+ RAM, modern CPU with 8+ cores
- **Minimum**: 8GB RAM, quad-core CPU
- **GPU**: Optional but recommended for faster responses

---

For more information about Ollama, visit the [official GitHub repository](https://github.com/ollama/ollama).
