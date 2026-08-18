import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, setHours, setMinutes } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: string | null; // ISO string
  onChange: (isoString: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pilih tenggat waktu...',
  className
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? parseISO(value) : undefined;
  const timeStr = selectedDate ? format(selectedDate, 'HH:mm') : '09:00';

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(null);
      return;
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    const updated = setMinutes(setHours(date, hours || 9), minutes || 0);
    onChange(updated.toISOString());
  };

  const handleTimeChange = (newTime: string) => {
    const [h, m] = newTime.split(':').map(Number);
    const baseDate = selectedDate || new Date();
    const updated = setMinutes(setHours(baseDate, h), m);
    onChange(updated.toISOString());
  };

  const setQuickDate = (type: 'today' | 'tomorrow' | 'afterTomorrow' | 'nextWeek') => {
    const now = new Date();
    let target = new Date();
    if (type === 'today') {
      target = setHours(setMinutes(now, 0), 18);
    } else if (type === 'tomorrow') {
      target.setDate(now.getDate() + 1);
      target = setHours(setMinutes(target, 0), 9);
    } else if (type === 'afterTomorrow') {
      target.setDate(now.getDate() + 2);
      target = setHours(setMinutes(target, 0), 9);
    } else if (type === 'nextWeek') {
      target.setDate(now.getDate() + 7);
      target = setHours(setMinutes(target, 0), 9);
    }
    onChange(target.toISOString());
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return placeholder;
    if (isToday(selectedDate)) {
      return `Hari ini, ${format(selectedDate, 'HH:mm')}`;
    }
    if (isTomorrow(selectedDate)) {
      return `Besok, ${format(selectedDate, 'HH:mm')}`;
    }
    return format(selectedDate, 'd MMM yyyy, HH:mm', { locale: idLocale });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-between text-left font-normal h-9 px-3 text-xs rounded-lg border-border bg-background hover:bg-muted/40 transition-colors',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{formatDisplayValue()}</span>
          </div>
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground ml-1"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3 space-y-3 rounded-2xl shadow-lg border-border" align="start">
        {/* Quick Date Chips */}
        <div className="flex flex-wrap items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setQuickDate('today')}
            className="px-2 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            Hari Ini (18:00)
          </button>
          <button
            type="button"
            onClick={() => setQuickDate('tomorrow')}
            className="px-2 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            Besok (09:00)
          </button>
          <button
            type="button"
            onClick={() => setQuickDate('afterTomorrow')}
            className="px-2 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            Lusa (09:00)
          </button>
          <button
            type="button"
            onClick={() => setQuickDate('nextWeek')}
            className="px-2 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            +7 Hari
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="border border-border/60 rounded-xl p-1 bg-card/50">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
        </div>

        {/* Time Selector */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Waktu:</span>
          </div>

          <div className="flex items-center gap-1">
            {['09:00', '12:00', '16:00', '20:00'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleTimeChange(preset)}
                className={cn(
                  'px-1.5 py-0.5 text-[11px] rounded transition-colors',
                  timeStr === preset
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                )}
              >
                {preset}
              </button>
            ))}

            <input
              type="time"
              value={timeStr}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="h-7 px-1.5 text-xs bg-background border border-border rounded-md font-mono"
            />
          </div>
        </div>

        {/* Done / Clear button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {value ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[11px] text-destructive hover:underline"
            >
              Hapus Tenggat
            </button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-7 px-3 text-xs rounded-lg font-medium"
          >
            Selesai
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
