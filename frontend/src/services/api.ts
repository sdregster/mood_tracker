/**
 * API сервис для работы с backend
 */

// В продакшене используем текущий домен, в разработке - localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:8000');

export interface MoodData {
  full_date: string;
  date: string;
  weekday: string;
  time: string;
  mood: number;
  activities: string;
  note_title: string;
  note: string;
}

export interface UploadResponse {
  status: string;
}

/**
 * Загружает CSV данные с сервера
 */
export const fetchMoodData = async (): Promise<MoodData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/mood.csv`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    throw error;
  }
};

/**
 * Загружает CSV файл на сервер
 */
export const uploadMoodData = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    throw error;
  }
};

/**
 * Парсит CSV строку в массив объектов
 */
const parseCSV = (csvText: string): MoodData[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const data: MoodData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || '';
      });
      
      // Преобразуем mood в число
      const mood = parseInt(row.mood) || 0;
      
      data.push({
        full_date: row.full_date || '',
        date: row.date || '',
        weekday: row.weekday || '',
        time: row.time || '',
        mood: mood,
        activities: row.activities || '',
        note_title: row.note_title || '',
        note: row.note || '',
      });
    }
  }
  
  return data;
};

/**
 * Генерирует моковые данные для разработки
 */
export const generateMockData = (days: number = 30): MoodData[] => {
  const data: MoodData[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Генерируем случайные данные настроения от -4 до 4
    const mood = Math.floor(Math.random() * 9) - 4;
    
    data.push({
      full_date: date.toISOString(),
      date: date.toISOString().split('T')[0],
      weekday: date.toLocaleDateString('ru-RU', { weekday: 'long' }),
      time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      mood: mood,
      activities: ['Работа', 'Спорт', 'Отдых', 'Встречи'][Math.floor(Math.random() * 4)],
      note_title: `Запись ${i}`,
      note: `Тестовая запись для ${date.toLocaleDateString('ru-RU')}`,
    });
  }
  
  return data;
}; 