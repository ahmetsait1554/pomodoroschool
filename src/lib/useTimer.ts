import { useCallback, useEffect, useRef, useState } from 'react';
import type { TimerMode } from './supabase';
import { MODE_LABELS, POMODORO_BEFORE_LONG_BREAK } from './constants';
import { audioEngine } from './audio';

type TimerOptions = {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationEnabled: boolean;
  onComplete?: (info: { mode: TimerMode; durationSeconds: number; taskTitle: string }) => void;
};

export type TimerState = {
  mode: TimerMode;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  completedWorkSessions: number;
  currentTask: string;
};

export function useTimer(options: TimerOptions) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [secondsLeft, setSecondsLeft] = useState(options.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const intervalRef = useRef<number | null>(null);
  const currentTaskRef = useRef('');
  currentTaskRef.current = currentTask;

  const totalSeconds = (mode === 'work' ? options.workDuration : mode === 'short_break' ? options.shortBreakDuration : options.longBreakDuration) * 60;

  const getDurationForMode = useCallback((m: TimerMode) => {
    return (m === 'work' ? options.workDuration : m === 'short_break' ? options.shortBreakDuration : options.longBreakDuration) * 60;
  }, [options.workDuration, options.shortBreakDuration, options.longBreakDuration]);

  const notify = useCallback((title: string, body: string) => {
    if (options.notificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' });
    }
  }, [options.notificationEnabled]);

  const onSessionComplete = useCallback(() => {
    if (options.soundEnabled) audioEngine.playChime();
    setIsRunning(false);

    const completedMode = mode;
    const completedDuration = getDurationForMode(completedMode);
    const taskTitle = currentTaskRef.current;
    if (options.onComplete) {
      options.onComplete({ mode: completedMode, durationSeconds: completedDuration, taskTitle });
    }

    if (completedMode === 'work') {
      const newCount = completedWorkSessions + 1;
      setCompletedWorkSessions(newCount);
      const nextMode: TimerMode = newCount % POMODORO_BEFORE_LONG_BREAK === 0 ? 'long_break' : 'short_break';
      setMode(nextMode);
      setSecondsLeft(getDurationForMode(nextMode));
      notify('Pomodoro School', `${MODE_LABELS.work} tamamlandı! ${MODE_LABELS[nextMode]} zamanı.`);
      if (options.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 500);
      }
    } else {
      setMode('work');
      setSecondsLeft(getDurationForMode('work'));
      notify('Pomodoro School', `Mola bitti. ${MODE_LABELS.work} zamanı!`);
      if (options.autoStartPomodoros) {
        setTimeout(() => setIsRunning(true), 500);
      }
    }
  }, [mode, completedWorkSessions, options, getDurationForMode, notify]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            onSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onSessionComplete]);

  const start = useCallback(() => {
    setIsRunning(true);
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(getDurationForMode(mode));
  }, [mode, getDurationForMode]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setSecondsLeft(getDurationForMode(newMode));
  }, [getDurationForMode]);

  const skipToNext = useCallback(() => {
    onSessionComplete();
  }, [onSessionComplete]);

  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(getDurationForMode(mode));
    }
  }, [options.workDuration, options.shortBreakDuration, options.longBreakDuration, mode, getDurationForMode, isRunning]);

  return {
    mode,
    secondsLeft,
    totalSeconds,
    isRunning,
    completedWorkSessions,
    currentTask,
    setCurrentTask,
    start,
    pause,
    reset,
    switchMode,
    skipToNext,
    setCompletedWorkSessions,
  };
}
