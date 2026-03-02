import { describe, it, expect } from 'vitest';
import { timeEntryService, TimeEntry } from './timeEntryService';

describe('timeEntryService', () => {
  describe('calculateDailyHours', () => {
    it('deve retornar "-" se não houver entradas', () => {
      expect(timeEntryService.calculateDailyHours([])).toBe('-');
    });

    it('deve calcular horas corretamente para um turno simples', () => {
      const entries: TimeEntry[] = [
        { id: '1', type: 'in', timestamp: '2024-01-01T09:00:00Z' },
        { id: '2', type: 'out', timestamp: '2024-01-01T18:00:00Z' },
      ];
      // 9h de trabalho
      expect(timeEntryService.calculateDailyHours(entries)).toBe('9h 0m');
    });

    it('deve descontar o intervalo de almoço', () => {
      const entries: TimeEntry[] = [
        { id: '1', type: 'in', timestamp: '2024-01-01T09:00:00Z' },
        { id: '2', type: 'lunch_start', timestamp: '2024-01-01T12:00:00Z' }, // 3h trabalhadas
        { id: '3', type: 'lunch_end', timestamp: '2024-01-01T13:00:00Z' },   // 1h almoço
        { id: '4', type: 'out', timestamp: '2024-01-01T18:00:00Z' },         // +5h trabalhadas
      ];
      // Total 8h
      expect(timeEntryService.calculateDailyHours(entries)).toBe('8h 0m');
    });

    it('deve ignorar entradas incompletas (sem par de fechamento)', () => {
      const entries: TimeEntry[] = [
        { id: '1', type: 'in', timestamp: '2024-01-01T09:00:00Z' },
      ];
      // Não fechou o par, então 0h contabilizadas
      expect(timeEntryService.calculateDailyHours(entries)).toBe('-');
    });
  });

  describe('getLastStatus (Transições de Estado)', () => {
    it('deve retornar "not_started" se não houver entradas', () => {
      expect(timeEntryService.getLastStatus([])).toBe('not_started');
    });

    it('deve retornar "working" após bater ponto de entrada', () => {
      const entries: TimeEntry[] = [
        { id: '1', type: 'in', timestamp: '2024-01-01T09:00:00Z' },
      ];
      expect(timeEntryService.getLastStatus(entries)).toBe('working');
    });

    it('deve retornar "lunch" após saída para almoço', () => {
      const entries: TimeEntry[] = [
        { id: '1', type: 'in', timestamp: '2024-01-01T09:00:00Z' },
        { id: '2', type: 'lunch_start', timestamp: '2024-01-01T12:00:00Z' },
      ];
      expect(timeEntryService.getLastStatus(entries)).toBe('lunch');
    });

    it('deve retornar "working" após volta do almoço', () => {
      const entries: TimeEntry[] = [
        { id: '1', type: 'in', timestamp: '2024-01-01T09:00:00Z' },
        { id: '2', type: 'lunch_start', timestamp: '2024-01-01T12:00:00Z' },
        { id: '3', type: 'lunch_end', timestamp: '2024-01-01T13:00:00Z' },
      ];
      expect(timeEntryService.getLastStatus(entries)).toBe('working');
    });

    it('deve retornar "finished" após saída final', () => {
      const entries: TimeEntry[] = [
        { id: '1', type: 'in', timestamp: '2024-01-01T09:00:00Z' },
        { id: '2', type: 'out', timestamp: '2024-01-01T18:00:00Z' },
      ];
      expect(timeEntryService.getLastStatus(entries)).toBe('finished');
    });
  });
});
