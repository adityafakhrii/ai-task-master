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

      <PopoverContent
        className="w-auto max-w-[95vw] p-3.5 space-y-3 rounded-2xl shadow-xl border-border bg-popover text-popover-foreground z-[60]"
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={16}
      >
        {/* Quick Date Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => setQuickDate('today')}
            className="px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            Hari Ini (18:00)
          </button>
          <button
            type="button"
            onClick={() => setQuickDate('tomorrow')}
            className="px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            Besok (09:00)
          </button>
          <button
            type="button"
            onClick={() => setQuickDate('afterTomorrow')}
            className="px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            Lusa (09:00)
          </button>
          <button
            type="button"
            onClick={() => setQuickDate('nextWeek')}
            className="px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            +7 Hari
          </button>
        </div>

        {/* Side-by-Side: Calendar on Left, Time Selector on Right */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Calendar (Left) */}
          <div className="border border-border/60 rounded-xl p-1 bg-card/40">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </div>

          {/* Time Picker Panel (Right) */}
          <div className="border border-border/60 rounded-xl p-3 bg-card/40 sm:w-44 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Pilih Jam</span>
              </div>

              {/* Time Presets Column */}
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5">
                {[
                  { time: '09:00', label: '09:00 Pagi' },
                  { time: '12:00', label: '12:00 Siang' },
                  { time: '16:00', label: '16:00 Sore' },
                  { time: '20:00', label: '20:00 Malam' }
                ].map((item) => (
                  <button
                    key={item.time}
                    type="button"
                    onClick={() => handleTimeChange(item.time)}
                    className={cn(
                      'px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all text-left flex items-center justify-between',
                      timeStr === item.time
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'bg-secondary/60 hover:bg-secondary text-secondary-foreground'
                    )}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time Input */}
            <div className="space-y-1 pt-2 border-t border-border/60">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                Jam Kustom
              </label>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full h-8 px-2 text-xs bg-background border border-border rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
          {value ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[11px] text-destructive hover:underline font-medium"
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
            className="h-7 px-3.5 text-xs rounded-lg font-semibold"
          >
            Terapkan
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
