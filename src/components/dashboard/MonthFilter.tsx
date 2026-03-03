import * as React from "react"
import { format, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface MonthFilterProps {
  date: Date
  setDate: (date: Date) => void
  className?: string
}

export function MonthFilter({ date, setDate, className }: MonthFilterProps) {
  const nextMonth = () => setDate(addMonths(date, 1))
  const prevMonth = () => setDate(subMonths(date, 1))

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button variant="outline" size="icon" onClick={prevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal capitalize",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione o mês</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(d)}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
      <Button variant="outline" size="icon" onClick={nextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
