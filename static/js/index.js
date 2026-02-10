import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

let state = {
    model: null,
    apiKey: localStorage.getItem('gemini_api_key') || ""
};

const messagesFlow = document.getElementById("messages-flow");
const configForm = document.getElementById("config-form");
const chatForm = document.getElementById("chat-form");
const apiInput = document.getElementById("api-input");
const userInput = document.getElementById("user-input");
const clearApiBtn = document.getElementById("clear-api-btn");

if (state.apiKey) {
    initModel(state.apiKey);
    apiInput.placeholder = "Chave salva!";
}

function initModel(key) {
    try {
        const genAI = new GoogleGenerativeAI(key);
        state.model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        return true;
    } catch (e) {
        console.error("Erro ao inicializar:", e);
        return false;
    }
}

function addMessageToUI(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = `message-bubble message-bubble--${sender}`;
    const content = document.createElement("pre");
    content.textContent = text;
    bubble.appendChild(content);
    messagesFlow.appendChild(bubble);
    messagesFlow.scrollTop = messagesFlow.scrollHeight;
    return bubble;
}

configForm.onsubmit = (e) => {
    e.preventDefault();
    const key = apiInput.value.trim();
    if (key && initModel(key)) {
        localStorage.setItem('gemini_api_key', key);
        state.apiKey = key;
        alert("API Key configurada e salva com segurança!");
        apiInput.value = "";
        apiInput.placeholder = "Chave salva!";
    }
};

clearApiBtn.addEventListener("click", () => {
    localStorage.removeItem('gemini_api_key');
    state.apiKey = "";
    state.model = null;
    apiInput.value = "";
    apiInput.placeholder = "Cole sua API Key...";
    
    alert("Chave API removida com sucesso!\nAgora você precisa configurar uma nova chave para continuar.");
});

chatForm.onsubmit = async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    
    if (!text) return;
    if (!state.model) {
        alert("Por favor, configure sua API Key primeiro!");
        return;
    }

    addMessageToUI(text, "user");
    userInput.value = "";

    const loadingBubble = addMessageToUI("Digitando...", "ai");

    try {
        const result = await state.model.generateContent(text);
        const response = await result.response;
        loadingBubble.querySelector("pre").textContent = response.text();
    } catch (error) {
        loadingBubble.querySelector("pre").textContent = "Erro: " + error.message;
        loadingBubble.style.color = "#ff6b6b";
    }
    
    messagesFlow.scrollTop = messagesFlow.scrollHeight;
};

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm.requestSubmit();
    }
});