import { Moon, Milk, Baby, CalendarDays, Heart, Droplets } from 'lucide-react';

export const TOPICS = [
  { key: 'sleep',       Icon: Moon,         iconCls: 'bg-twilight-indigo-100 text-twilight-indigo-600' },
  { key: 'feeding',     Icon: Milk,         iconCls: 'bg-light-apricot-100 text-light-apricot-600' },
  { key: 'diapers',     Icon: Droplets,     iconCls: 'bg-warm-brown-100 text-warm-brown-500' },
  { key: 'development', Icon: Baby,         iconCls: 'bg-emerald-100 text-emerald-600' },
  { key: 'routines',    Icon: CalendarDays, iconCls: 'bg-blue-grey-100 text-blue-grey-600' },
  { key: 'health',      Icon: Heart,        iconCls: 'bg-rose-100 text-rose-500' },
];

export const SCREEN_HOME   = 0;
export const SCREEN_TOPIC  = 1;
export const SCREEN_ANSWER = 2;
