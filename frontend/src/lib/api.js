const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function getHealth() {
  return fetch(`${API_BASE_URL}/health`).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail ?? "Health check failed");
    }
    return data;
  });
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail ?? "Request failed");
  }

  return data;
}

export function uploadPdf(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/upload/pdf", {
    method: "POST",
    body: formData,
  });
}

export function listUploadedPdfs() {
  return request("/documents/pdfs");
}

export function deleteUploadedPdf(filename) {
  return request(`/documents/pdfs/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  });
}

export function askQuestion(question) {
  return request("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
}

export function summarizeTopic(topic) {
  return request("/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
}

export function generateQuiz(topic, numQuestions) {
  return request("/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, num_questions: numQuestions }),
  });
}
