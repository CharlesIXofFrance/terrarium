import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MemberHub } from '@/components/features/member-hub/MemberHub';
import { JobBoard } from '@/pages/member/JobBoard';
import { Events } from '@/pages/member/Events';
import { Feed } from '@/pages/member/Feed';
import { MemberProfile } from '@/pages/member/MemberProfile';
import { MemberLayout } from '@/components/features/members/MemberLayout';

interface PagePreviewProps {
  pageId: string;
  styles: any;
  mode: 'desktop' | 'mobile' | 'tablet';
  testUser?: {
    name: string;
    role: string;
    profileComplete: number;
    avatar: string;
    mentoring?: boolean;
    coaching?: boolean;
  };
}

export function PagePreview({
  pageId,
  styles,
  mode,
  testUser,
}: PagePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  const mockUser = testUser || {
    name: 'Clara Johnson',
    role: 'member',
    profileComplete: 70,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    mentoring: true,
    coaching: true,
  };

  const getComponent = () => {
    switch (pageId) {
      case 'member-hub':
        return <MemberHub styles={styles} testUser={mockUser} />;
      case 'job-board':
        return <JobBoard />;
      case 'events':
        return <Events />;
      case 'live-feed':
        return <Feed />;
      case 'member-profile':
        return <MemberProfile />;
      default:
        return <div>Preview not available</div>;
    }
  };

  const viewportStyle = {
    mobile: {
      width: 375,
      height: 667,
    },
    tablet: {
      width: 768,
      height: 1024,
    },
    desktop: {
      width: '100%',
      height: '100vh',
    },
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = async () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Create a new div for mounting
      const root = iframeDoc.getElementById('preview-root');
      if (!root) return;

      // Add base styles
      const baseStyle = iframeDoc.createElement('style');
      baseStyle.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500&display=swap');
        
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          font-family: 'Roboto', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        #preview-root {
          height: 100%;
          min-height: ${mode === 'desktop' ? '100vh' : '100%'};
          display: flex;
          flex-direction: column;
        }
        
        * {
          box-sizing: border-box;
        }
      `;
      iframeDoc.head.appendChild(baseStyle);

      // Copy all stylesheets
      const styles = Array.from(document.styleSheets);
      for (const styleSheet of styles) {
        try {
          if (styleSheet.href) {
            // External stylesheet
            const link = iframeDoc.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            await new Promise((resolve, reject) => {
              link.onload = resolve;
              link.onerror = reject;
              iframeDoc.head.appendChild(link);
            });
          } else {
            // Inline stylesheet
            const style = iframeDoc.createElement('style');
            Array.from(styleSheet.cssRules).forEach(rule => {
              style.textContent += rule.cssText + '\n';
            });
            iframeDoc.head.appendChild(style);
          }
        } catch (e) {
          console.warn('Could not copy stylesheet', e);
        }
      }

      // Set mount node after styles are loaded
      setMountNode(root);
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [mode]);

  return (
    <div 
      className="relative bg-gray-50 w-full flex justify-center"
      style={{
        height: mode === 'desktop' ? '100vh' : 'auto',
        minHeight: mode === 'desktop' ? '100vh' : 'auto',
      }}
    >
      <div 
        className="preview-container"
        style={{
          width: mode === 'desktop' ? '100%' : `${viewportStyle[mode].width}px`,
          height: mode === 'desktop' ? '100vh' : `${viewportStyle[mode].height}px`,
          overflow: 'hidden',
          border: mode !== 'desktop' ? '1px solid #e5e7eb' : 'none',
          borderRadius: mode !== 'desktop' ? '8px' : '0',
          boxShadow: mode !== 'desktop' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          style={{
            height: mode === 'desktop' ? '100vh' : '100%',
          }}
          srcDoc={`
            <!DOCTYPE html>
            <html style="height: 100%;">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="${mode === 'desktop' ? 'width=device-width, initial-scale=1.0' : `width=${viewportStyle[mode].width}`}" />
              </head>
              <body style="height: ${mode === 'desktop' ? '100vh' : '100%'}; margin: 0;">
                <div id="preview-root" style="height: ${mode === 'desktop' ? '100vh' : '100%'};"></div>
              </body>
            </html>
          `}
          frameBorder="0"
        />
        {mountNode && createPortal(
          <MemberLayout mode={mode} isPreview={true}>
            {getComponent()}
          </MemberLayout>,
          mountNode
        )}
      </div>
    </div>
  );
}
