import React from 'react';
import { useAtom } from 'jotai';
import { currentCommunityAtom } from '@/lib/stores/community';

export function MemberFooter() {
  const [currentCommunity] = useAtom(currentCommunityAtom);
  const primaryColor = currentCommunity?.primaryColor || '#E86C3A';

  return (
    <footer
      className="bg-gray-50 border-t border-gray-200 text-white w-full"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="px-4 text-center max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          We increase female presence in the fintech sector
        </h2>
        <p className="text-lg mb-8">Come join us too</p>
        <div className="text-xl font-medium">Women in Fintech</div>
      </div>
    </footer>
  );
}
