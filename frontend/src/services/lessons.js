import api from './api';

export const getLessons = async () => {
  const response = await api.get('/lessons');
  return response.data.lessons;
};

export const getMentorLessons = async () => {
  const response = await api.get('/lessons/mentor/my-lessons');
  return response.data.lessons;
};

export const getLesson = async (id) => {
  const response = await api.get(`/lessons/${id}`);
  return response.data.lesson;
};

export const createLesson = async (lessonData) => {
  const response = await api.post('/lessons', lessonData);
  return response.data.lesson;
};

export const updateLesson = async (id, lessonData) => {
  const response = await api.put(`/lessons/${id}`, lessonData);
  return response.data.lesson;
};

export const deleteLesson = async (id) => {
  const response = await api.delete(`/lessons/${id}`);
  return response.data;
};
