/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared/services/chatbotApi.js
 */

import { useAuthStore } from '../../app/store/authStore';
import { API_BASE_URL } from './apiBase';

const CHATBOT_API_URL = `${API_BASE_URL}/chat`;

const chatbotApi = {
  /**
   * Gửi câu hỏi tới API Chatbot RAG.
   *
   * @param {{ projectId?: number|string, project_id?: number|string, message: string }} payload
   * @returns {Promise<{ success: boolean, answer: string, table: { columns: Array, data: Array } | null }>}
   */
  sendMessage: async ({ projectId, project_id, message }) => {
    const resolvedProjectId = project_id ?? projectId;
    const token = useAuthStore.getState().token;

    const response = await fetch(CHATBOT_API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        project_id: Number(resolvedProjectId),
        message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chatbot API error: ${response.status}`);
    }

    return response.json();
  },
};

export default chatbotApi;
