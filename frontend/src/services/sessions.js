import api from './api';

export const getSessions = async () => {
  const response = await api.get('/sessions');
  return response.data.sessions;
};

export const getMentorSessions = async () => {
  const response = await api.get('/sessions/mentor/my-sessions');
  return response.data.sessions;
};

export const getSession = async (id) => {
  const response = await api.get(`/sessions/${id}`);
  return response.data.session;
};

export const createSession = async (sessionData) => {
  const response = await api.post('/sessions', sessionData);
  return response.data.session;
};

export const updateSession = async (id, sessionData) => {
  const response = await api.put(`/sessions/${id}`, sessionData);
  return response.data.session;
};

export const deleteSession = async (id) => {
  const response = await api.delete(`/sessions/${id}`);
  return response.data;
};

export const joinSession = async (id, studentId) => {
  const response = await api.post(`/sessions/${id}/join`, { studentId });
  return response.data.session;
};

export const leaveSession = async (id, studentId) => {
  const response = await api.post(`/sessions/${id}/leave`, { studentId });
  return response.data.session;
};

