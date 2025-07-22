import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart } from 'lucide-react';

interface MoodData {
  date: string;
  mood: number;
}

interface MoodStatsProps {
  data: MoodData[];
}

const MoodStats: React.FC<MoodStatsProps> = ({ data }) => {
  // Группировка по дням для корректных расчетов
  const dailyData = React.useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push(item);
      return acc;
    }, {} as Record<string, MoodData[]>);

    return Object.entries(grouped).map(([date, entries]) => ({
      date,
      mood: entries[entries.length - 1].mood // Берем последнюю запись дня
    }));
  }, [data]);

  // Расчет статистики
  const averageDeviation = dailyData.length > 0 
    ? (dailyData.reduce((sum, item) => sum + item.mood, 0) / dailyData.length).toFixed(1)
    : '0.0';

  const positiveDays = dailyData.filter(item => item.mood > 0).length;
  const negativeDays = dailyData.filter(item => item.mood < 0).length;

  // Стрик стабильности (дни подряд в пределах ±1)
  const calculateStabilityStreak = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (let i = dailyData.length - 1; i >= 0; i--) {
      const isStable = Math.abs(dailyData[i].mood) <= 1;
      if (isStable) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return { current: currentStreak, max: maxStreak };
  };

  // Вариабельность (среднее abs-различие между соседними значениями)
  const calculateVariability = () => {
    if (dailyData.length < 2) return 0;
    
    let totalDiff = 0;
    for (let i = 1; i < dailyData.length; i++) {
      totalDiff += Math.abs(dailyData[i].mood - dailyData[i-1].mood);
    }
    
    return (totalDiff / (dailyData.length - 1)).toFixed(1);
  };

  const stabilityStreak = calculateStabilityStreak();
  const variability = calculateVariability();

  const stats = [
    {
      title: 'Среднее отклонение',
      value: averageDeviation,
      icon: BarChart,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      description: 'Среднее значение'
    },
    {
      title: 'Стрик стабильности',
      value: stabilityStreak.current.toString(),
      icon: TrendingUp,
      color: 'text-[hsl(var(--balanced))]',
      bgColor: 'bg-[hsl(var(--balanced)/0.1)]',
      streak: stabilityStreak,
      description: 'Дни в пределах ±1'
    },
    {
      title: 'Положительные дни',
      value: `${positiveDays}`,
      icon: TrendingUp,
      color: 'text-[hsl(var(--hypo-mild))]',
      bgColor: 'bg-[hsl(var(--hypo-mild)/0.1)]',
      description: `из ${dailyData.length} дней`
    },
    {
      title: 'Отрицательные дни',
      value: `${negativeDays}`,
      icon: TrendingDown,
      color: 'text-[hsl(var(--depression-mild))]',
      bgColor: 'bg-[hsl(var(--depression-mild)/0.1)]',
      description: `из ${dailyData.length} дней`
    },
    {
      title: 'Вариабельность',
      value: variability.toString(),
      icon: BarChart,
      color: 'text-[hsl(var(--moderate))]',
      bgColor: 'bg-[hsl(var(--moderate)/0.1)]',
      description: 'Средняя амплитуда'
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-3 w-3 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground truncate">{stat.title}</span>
            </div>
            <div className="text-lg font-bold text-card-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground leading-tight">
              {stat.description}
            </p>
            {stat.streak && stat.streak.max > 0 && (
              <p className="text-xs text-muted-foreground">
                Макс: {stat.streak.max}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default MoodStats;
