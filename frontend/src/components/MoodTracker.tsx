import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import MoodChart from './MoodChart';
import MoodStats from './MoodStats';
import DateFilter from './DateFilter';
import { fetchMoodData, generateMockData, MoodData } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const MoodTracker = () => {
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [filteredData, setFilteredData] = useState<MoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Последние 7 дней
    to: new Date()
  });
  
  const { toast } = useToast();

  // Загружаем данные с сервера
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchMoodData();
        setMoodData(data);
        
        if (data.length === 0) {
          // Если данных нет, показываем моковые данные для демонстрации
          const mockData = generateMockData();
          setMoodData(mockData);
          toast({
            title: "Данные не найдены",
            description: "Показаны демонстрационные данные. Загрузите CSV файл для отображения реальных данных.",
            variant: "default",
          });
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные');
        
        // Показываем моковые данные в случае ошибки
        const mockData = generateMockData();
        setMoodData(mockData);
        
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить данные с сервера. Показаны демонстрационные данные.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Группировка данных по дням и вычисление среднего значения
  const groupedData = React.useMemo(() => {
    const grouped = moodData.reduce((acc, item) => {
      const dayKey = item.full_date; // Используем full_date для группировки
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(item);
      return acc;
    }, {} as Record<string, MoodData[]>);

    // Преобразуем в массив с средними значениями
    return Object.entries(grouped).map(([fullDate, entries]) => {
      const totalMood = entries.reduce((sum, entry) => sum + entry.mood, 0);
      const averageMood = totalMood / entries.length;
      
      // Берем данные из первой записи для остальных полей
      const firstEntry = entries[0];
      
      return {
        ...firstEntry,
        mood: averageMood, // Заменяем на среднее значение
        // Сохраняем все записи за день для tooltip
        allEntries: entries
      };
    });
  }, [moodData]);

  // Фильтрация данных по выбранному диапазону дат
  useEffect(() => {
    const filtered = groupedData.filter(item => {
      const itemDate = new Date(item.full_date);
      const isValidDate = !isNaN(itemDate.getTime());
      
      if (!isValidDate) {
        return false;
      }
      
      const inRange = itemDate >= dateRange.from && itemDate <= dateRange.to;
      return inRange;
    });
    setFilteredData(filtered);
  }, [groupedData, dateRange]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center justify-center gap-3">
          <BarChart3 className="text-foreground/70" />
          Центровка
        </h1>
        <p className="text-sm text-muted-foreground">Визуализация эмоциональных колебаний и стремления к балансу</p>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <MoodStats data={filteredData} />
      </div>

      {/* Фильтрация */}
      <div className="mb-6">
        <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="text-muted-foreground" />
            График эмоциональных колебаний
            {loading && <span className="text-sm text-muted-foreground">(загрузка...)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {error ? (
            <div className="text-center text-muted-foreground py-8">
              {error}
            </div>
          ) : (
            <>
              <MoodChart data={filteredData} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodTracker;
