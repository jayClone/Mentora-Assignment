import api from './api';

export const getStudents = async () => {
  const response = await api.get('/students');
  return response.data.students;
};

export const getStudent = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data.student;
};

export const createStudent = async (studentData) => {
  const response = await api.post('/students', studentData);
  return response.data.student;
};

export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data.student;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};
