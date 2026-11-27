'use client';

import dynamic from 'next/dynamic';
import { useMode } from '@/app/context/ModeContext';

const RecruitmentView = dynamic(() => import('./RecruitmentView'), { ssr: false });

export default function RecruitmentSlot() {
  const { mode } = useMode();
  return mode === 'ia' ? <RecruitmentView /> : null;
}
