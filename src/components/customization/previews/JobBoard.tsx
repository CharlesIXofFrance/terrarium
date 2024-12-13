import React from 'react';
import { JobBoard as LiveJobBoard } from '../../../pages/member/JobBoard';

interface JobBoardPreviewProps {
  styles: any;
  mode: string;
}

export function JobBoard() {
  return <LiveJobBoard />;
}