import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Clock, X, Check } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, setHours, setMinutes } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateTimePickerProps {
  value?: string | null; // ISO string
  onChange: (isoString: string | null) => void;
  placeholder?: string;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pilih tenggat waktu...',
  className
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? parseISO(value) : undefined;
  const currentHour = selectedDate ? format(selectedDate, 'HH') : '09';
  const currentMinute = selectedDate ? format(selectedDate, 'mm') : '00';

  const updateDateTime = (date: Date | undefined, hourStr: string, minStr: string) => {
    if (!date) {
      onChange(null);
      return;
    }
    const h = parseInt(hourStr, 10);
    const m = parseInt(minStr, 10);
    const updated = setMinutes(setHours(date, h), m);
    onChange(updated.toISOString());
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(null);
      return;
    }
    updateDateTime(date, currentHour, currentMinute);
  };

  const handleHourChange = (newHour: string) => {
    const baseDate = selectedDate || new Date();
    updateDateTime(baseDate, newHour, currentMinute);
  };

  const handleMinuteChange = (newMin: string) => {
    const baseDate = selectedDate || new Date();
    updateDateTime(baseDate, currentHour, newMin);
  };

  const handlePresetSelect = (hour: number, minute: number) => {
    const baseDate = selectedDate || new Date();
    updateDateTime(baseDate, hour.toString().padStart(2, '0'), minute.toString().padStart(2, '0'));
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
        className="w-auto p-3 space-y-2.5 rounded-2xl shadow-2xl border-border bg-popover text-popover-foreground z-[70] max-h-[85vh] overflow-y-auto"
        align="start"
        side="bottom"
        sideOffset={4}
        collisionPadding={12}
      >
        {/* Quick Date Chips Bar */}
        <div className="flex flex-wrap items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setQuickDate('today')}
            className="px-2 py-0.5 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            Hari Ini (18:00)
          </button>
          <button
            type="button"
            onClick={() => setQuickDate('tomorrow')}
            className="px-2 py-0.5 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            Besok (09:00)
          </button>
          <button
            type="button"
            onClick={() => setQuickDate('afterTomorrow')}
            className="px-2 py-0.5 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            Lusa (09:00)
          </button>
          <button
            type="button"
            onClick={() => setQuickDate('nextWeek')}
            className="px-2 py-0.5 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium transition-colors"
          >
            +7 Hari
          </button>
        </div>

        {/* Side-by-Side: Compact Calendar (Left) + Custom Time Control (Right) */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          {/* Calendar (Left) */}
          <div className="border border-border/60 rounded-xl p-0.5 bg-card/40">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              className="p-1"
            />
          </div>

          {/* Time Picker Panel (Right) - 100% Custom, No Native OS Popup */}
          <div className="border border-border/60 rounded-xl p-2.5 bg-card/40 sm:w-40 flex flex-col justify-between space-y-2.5">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Pilih Jam</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                {[
                  { h: 9, m: 0, label: '09:00 Pagi' },
                  { h: 12, m: 0, label: '12:00 Siang' },
                  { h: 16, m: 0, label: '16:00 Sore' },
                  { h: 20, m: 0, label: '20:00 Malam' }
                ].map((item) => {
                  const isSelected = currentHour === item.h.toString().padStart(2, '0') && currentMinute === item.m.toString().padStart(2, '0');
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handlePresetSelect(item.h, item.m)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md font-medium transition-all text-left flex items-center justify-between',
                        isSelected
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'bg-secondary/60 hover:bg-secondary text-secondary-foreground'
                      )}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Time Selector (Hours & Minutes Dropdowns) */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Jam Kustom (WIB)
              </span>
              <div className="flex items-center gap-1">
                {/* Hours */}
                <Select value={currentHour} onValueChange={handleHourChange}>
                  <SelectTrigger className="h-8 text-xs font-mono rounded-lg px-2 bg-background flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 z-[80]">
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h} className="text-xs font-mono">
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="font-bold text-xs text-muted-foreground">:</span>

                {/* Minutes */}
                <Select value={currentMinute} onValueChange={handleMinuteChange}>
                  <SelectTrigger className="h-8 text-xs font-mono rounded-lg px-2 bg-background flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 z-[80]">
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs font-mono">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar - Always Visible */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="text-[11px] text-destructive hover:underline font-medium"
            >
              Hapus Tenggat
            </button>
          ) : (
            <span className="text-[11px] text-muted-foreground">Belum dipilih</span>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-7 px-3 text-xs rounded-lg font-semibold shadow-xs"
          >
            Terapkan
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
