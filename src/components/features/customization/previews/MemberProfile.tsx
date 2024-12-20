import React from 'react';
import { useStyles } from '../../../lib/hooks/useStyles';
import { MemberProfile as LiveMemberProfile } from '../../../pages/member/MemberProfile';

interface MemberProfilePreviewProps {
  styles: any;
  mode: string;
}

export function MemberProfile({ styles }: MemberProfilePreviewProps) {
  const { getFont } = useStyles();

  // Apply custom styles
  const customStyles = {
    ...styles,
    typography: {
      ...styles.typography,
      headingFont: getFont(styles.typography.headingFont),
      bodyFont: getFont(styles.typography.bodyFont),
    },
  };

  return <LiveMemberProfile styles={customStyles} />;
}
