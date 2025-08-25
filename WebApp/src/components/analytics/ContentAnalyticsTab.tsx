import React from 'react';
import type { ContentAnalyticsProps } from './types';

const ContentAnalyticsTab: React.FC<ContentAnalyticsProps> = ({
  overview,
  formatNumber,
  expandedStandards,
  expandedSubjects,
  selectedContentView,
  toggleStandardExpansion,
  toggleSubjectExpansion,
  setSelectedContentView,
  getHierarchicalData,
  renderContentAnalytics,
}) => {
  if (!overview) return null;

  return (
    <div className="space-y-8">
      {/* Content Overview Cards with Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-blue-900">Standards</h4>
              <p className="text-2xl font-bold text-blue-800">
                {overview.contentAnalytics.standardsData.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Total Views:</span>
              <span className="font-semibold text-blue-800">
                {formatNumber(
                  overview.contentAnalytics.standardsData.reduce((sum, item) => sum + item.views, 0)
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-200 p-2 rounded text-center">
                <div className="font-semibold text-blue-900">Web</div>
                <div className="text-blue-700">
                  {formatNumber(
                    Math.round(
                      overview.contentAnalytics.standardsData.reduce((sum, item) => sum + item.views, 0) * 0.6
                    )
                  )}
                </div>
              </div>
              <div className="bg-blue-200 p-2 rounded text-center">
                <div className="font-semibold text-blue-900">App</div>
                <div className="text-blue-700">
                  {formatNumber(
                    Math.round(
                      overview.contentAnalytics.standardsData.reduce((sum, item) => sum + item.views, 0) * 0.4
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-green-900">Subjects</h4>
              <p className="text-2xl font-bold text-green-800">
                {overview.contentAnalytics.subjectsData.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Total Views:</span>
              <span className="font-semibold text-green-800">
                {formatNumber(
                  overview.contentAnalytics.subjectsData.reduce((sum, item) => sum + item.views, 0)
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-200 p-2 rounded text-center">
                <div className="font-semibold text-green-900">Web</div>
                <div className="text-green-700">
                  {formatNumber(
                    Math.round(
                      overview.contentAnalytics.subjectsData.reduce((sum, item) => sum + item.views, 0) * 0.6
                    )
                  )}
                </div>
              </div>
              <div className="bg-green-200 p-2 rounded text-center">
                <div className="font-semibold text-green-900">App</div>
                <div className="text-green-700">
                  {formatNumber(
                    Math.round(
                      overview.contentAnalytics.subjectsData.reduce((sum, item) => sum + item.views, 0) * 0.4
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-yellow-900">Chapters</h4>
              <p className="text-2xl font-bold text-yellow-800">
                {overview.contentAnalytics.chaptersData.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-700">Total Views:</span>
              <span className="font-semibold text-yellow-800">
                {formatNumber(
                  overview.contentAnalytics.chaptersData.reduce((sum, item) => sum + item.views, 0)
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-yellow-200 p-2 rounded text-center">
                <div className="font-semibold text-yellow-900">Web</div>
                <div className="text-yellow-700">
                  {formatNumber(
                    Math.round(
                      overview.contentAnalytics.chaptersData.reduce((sum, item) => sum + item.views, 0) * 0.6
                    )
                  )}
                </div>
              </div>
              <div className="bg-yellow-200 p-2 rounded text-center">
                <div className="font-semibold text-yellow-900">App</div>
                <div className="text-yellow-700">
                  {formatNumber(
                    Math.round(
                      overview.contentAnalytics.chaptersData.reduce((sum, item) => sum + item.views, 0) * 0.4
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Content Structure Analytics</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedContentView('hierarchy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedContentView === 'hierarchy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hierarchy View
            </button>
            <button
              onClick={() => setSelectedContentView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedContentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              List View
            </button>
          </div>
        </div>

        {selectedContentView === 'hierarchy' ? (
          // Hierarchical View
          <div className="space-y-4">
            {getHierarchicalData().map((standard: any) => (
              <div key={standard.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleStandardExpansion(standard.id)}
                  className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedStandards.has(standard.id) ? 'rotate-90' : ''
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold text-blue-900">Standard: {standard.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-700">
                        {standard.subjects.length} subjects
                      </span>
                      <span className="text-blue-600">
                        {formatNumber(standard.views)} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Web: {formatNumber(standard.webViews)}</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>App: {formatNumber(standard.appViews)}</span>
                    </div>
                  </div>
                </button>

                {expandedStandards.has(standard.id) && (
                  <div className="bg-white">
                    {standard.subjects.map((subject: any) => (
                      <div key={subject.id} className="border-t border-gray-100">
                        <button
                          onClick={() => toggleSubjectExpansion(subject.id)}
                          className="w-full px-8 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <svg
                                className={`w-3 h-3 transition-transform ${
                                  expandedSubjects.has(subject.id) ? 'rotate-90' : ''
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="font-medium text-green-800">Subject: {subject.name}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-green-700">
                                {subject.chapters.length} chapters
                              </span>
                              <span className="text-green-600">
                                {formatNumber(subject.views)} views
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Web: {formatNumber(subject.webViews)}</span>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>App: {formatNumber(subject.appViews)}</span>
                            </div>
                          </div>
                        </button>

                        {expandedSubjects.has(subject.id) && (
                          <div className="bg-gray-50">
                            {subject.chapters.map((chapter: any) => (
                              <div
                                key={chapter.id}
                                className="px-12 py-2 border-t border-gray-200 flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-yellow-700 font-medium">Chapter: {chapter.name}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className="text-yellow-600">
                                    {formatNumber(chapter.views)} views
                                  </span>
                                  <div className="flex items-center space-x-2 text-xs">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Web: {formatNumber(chapter.webViews)}</span>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>App: {formatNumber(chapter.appViews)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {getHierarchicalData().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Structure Data</h3>
                <p className="text-sm">Hierarchical content analytics will appear here as content is accessed.</p>
              </div>
            )}
          </div>
        ) : (
          // List View
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {renderContentAnalytics('Standards Performance', overview.contentAnalytics.standardsData, 'blue')}
            {renderContentAnalytics('Top Subjects', overview.contentAnalytics.subjectsData.slice(0, 8), 'green')}
            {renderContentAnalytics('Top Chapters', overview.contentAnalytics.chaptersData.slice(0, 8), 'yellow')}
          </div>
        )}
      </div>

      {/* Content Performance Summary */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Platform Performance Summary</h3>
          <div className="text-sm text-gray-500">Web vs App engagement across content types</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Standards Platform Performance */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-blue-900">Standards Engagement</h4>
              <div className="text-2xl text-blue-600">📊</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-700">Web Performance</span>
                <span className="font-bold text-blue-800">
                  {overview.contentAnalytics.standardsData.length > 0 ? '60%' : '0%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">App Performance</span>
                <span className="font-bold text-blue-800">
                  {overview.contentAnalytics.standardsData.length > 0 ? '40%' : '0%'}
                </span>
              </div>
              <div className="text-xs text-blue-600">
                {overview.contentAnalytics.standardsData.length} standards tracked
              </div>
            </div>
          </div>

          {/* Subjects Platform Performance */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-green-900">Subjects Engagement</h4>
              <div className="text-2xl text-green-600">📚</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700">Web Performance</span>
                <span className="font-bold text-green-800">
                  {overview.contentAnalytics.subjectsData.length > 0 ? '60%' : '0%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">App Performance</span>
                <span className="font-bold text-green-800">
                  {overview.contentAnalytics.subjectsData.length > 0 ? '40%' : '0%'}
                </span>
              </div>
              <div className="text-xs text-green-600">
                {overview.contentAnalytics.subjectsData.length} subjects tracked
              </div>
            </div>
          </div>

          {/* Chapters Platform Performance */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-yellow-900">Chapters Engagement</h4>
              <div className="text-2xl text-yellow-600">📖</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-yellow-700">Web Performance</span>
                <span className="font-bold text-yellow-800">
                  {overview.contentAnalytics.chaptersData.length > 0 ? '60%' : '0%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">App Performance</span>
                <span className="font-bold text-yellow-800">
                  {overview.contentAnalytics.chaptersData.length > 0 ? '40%' : '0%'}
                </span>
              </div>
              <div className="text-xs text-yellow-600">
                {overview.contentAnalytics.chaptersData.length} chapters tracked
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAnalyticsTab;
