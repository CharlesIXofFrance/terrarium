import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Monitor, 
  Smartphone, 
  Maximize2, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  Palette, 
  Type, 
  Layout, 
  Moon,
  Grid
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StyleEditor } from '../../components/customization/StyleEditor';
import { PagePreview } from '../../components/customization/PagePreview';
import { useStyles } from '../../lib/hooks/useStyles';

type PreviewMode = 'desktop' | 'mobile' | 'fullscreen';
type PageType = 'navigation' | 'member-hub' | 'job-board' | 'job-listing' | 'member-profile' | 'live-feed';
type TestUserType = 'member' | 'employer' | 'admin';

const sections = [
  { id: 'colors', name: 'Global Colors', icon: Palette },
  { id: 'typography', name: 'Typography', icon: Type },
  { id: 'layout', name: 'Layout', icon: Grid },
  { id: 'components', name: 'Components', icon: Layout },
  { id: 'effects', name: 'Effects', icon: Moon },
];

export function CustomizationPortal() {
  const { styles, updateStyles } = useStyles();
  const [currentPage, setCurrentPage] = useState<PageType>('member-hub');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTestUser, setCurrentTestUser] = useState<TestUserType>('member');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleStyleChange = (category: string, property: string, value: any) => {
    updateStyles(category, property, value);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className={`h-5 w-5 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value as PageType)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="member-hub">Member Hub</option>
              <option value="job-board">Job Board</option>
              <option value="job-listing">Job Listing</option>
              <option value="member-profile">Member Profile</option>
              <option value="live-feed">Live Feed</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Preview Controls */}
            <div className="flex items-center space-x-4 mr-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{isPreviewMode ? 'Exit Preview' : 'Preview as User'}</span>
              </Button>
              
              {isPreviewMode && (
                <select
                  value={currentTestUser}
                  onChange={(e) => setCurrentTestUser(e.target.value as TestUserType)}
                  className="h-9 rounded-lg border-gray-300 text-sm"
                >
                  <option value="member">Test Member</option>
                  <option value="employer">Test Employer</option>
                  <option value="admin">Test Admin</option>
                </select>
              )}
            </div>

            {/* Device Preview Controls */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded ${
                  previewMode === 'desktop' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded ${
                  previewMode === 'mobile' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewMode('fullscreen')}
                className={`p-1.5 rounded ${
                  previewMode === 'fullscreen' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            <Button>Publish Changes</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!isPreviewMode && (
          <>
            {/* Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-1 rounded-r-lg shadow-md z-10"
            >
              {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>

            {/* Settings Sidebar */}
            <div
              className={`bg-white border-r border-gray-200 transition-all duration-300 ${
                !isSidebarOpen ? 'w-0' :
                isSidebarCollapsed ? 'w-16' : 'w-80'
              } ${!isSidebarOpen ? 'pointer-events-none' : ''}`}
            >
              {isSidebarOpen && (
                <div className="p-4">
                  {isSidebarCollapsed ? (
                    <div className="space-y-6">
                      {sections.map((section) => {
                        const Icon = section.icon;
                        const isExpanded = expandedSection === section.id;
                        
                        return (
                          <div
                            key={section.id}
                            className={`relative group ${isExpanded ? 'text-indigo-600' : 'text-gray-400'}`}
                          >
                            <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-lg ${
                              isExpanded ? 'bg-indigo-50' : 'hover:bg-gray-100'
                            }`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {section.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <StyleEditor
                      styles={styles}
                      onChange={handleStyleChange}
                      expandedSection={expandedSection}
                      setExpandedSection={setExpandedSection}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Preview */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <PagePreview
                pageId={currentPage}
                styles={styles}
                mode={previewMode}
                testUser={{
                  name: 'Clara Johnson',
                  role: currentTestUser,
                  profileComplete: 70,
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}