import api from './api';

export const summarizeText = async (data) => {
  const response = await api.post('/llm/summarize', data);
  return response.data;
};
