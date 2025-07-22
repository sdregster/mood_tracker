
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ dateRange, onDateRangeChange }) => {
  const presetRanges = [
    {
      label: '7 дней',
      days: 7
    },
    {
      label: '2 недели',
      days: 14
    },
    {
      label: '1 месяц',
      days: 30
    },
    {
      label: '3 месяца',
      days: 90
    }
  ];

  const handlePresetClick = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    
    onDateRangeChange({ from, to });
  };

  // Определяем активный период
  const getActivePeriod = () => {
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const activeRange = presetRanges.find(range => range.days === diffDays);
    return activeRange ? activeRange.label : `${diffDays} дней`;
  };

  return (
    <Card className="shadow-sm border-0 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Период:</span>
            <span className="font-semibold text-card-foreground">{getActivePeriod()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {presetRanges.map((range) => (
              <Button
                key={range.days}
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => handlePresetClick(range.days)}
              >
                {range.label}
              </Button>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {dateRange.from.toLocaleDateString('ru-RU')} - {dateRange.to.toLocaleDateString('ru-RU')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateFilter;
