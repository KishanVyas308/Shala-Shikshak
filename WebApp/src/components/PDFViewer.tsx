import React, { useEffect, useCallback } from 'react';

interface PDFViewerProps {
    fileurl: string;
}

class PDFErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('PDF Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF લોડ કરવામાં સમસ્યા</h3>
                        <p className="text-gray-600 text-sm mb-4 max-w-sm mx-auto leading-relaxed">
                            આ દસ્તાવેજ લોડ કરવામાં તકનીકી સમસ્યા આવી રહી છે. કૃપા કરીને પાછળથી પ્રયાસ કરો.
                        </p>
                        <div className="space-y-2">
                            <button 
                                onClick={() => this.setState({ hasError: false })}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                ફરીથી પ્રયાસ કરો
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileurl }) => {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    // Check if URL is a Google Drive link or doesn't end with .pdf
    const isGoogleDriveUrl = (url: string) => {
        return !url.endsWith('.pdf') || url.includes('drive.google.com') || url.includes('docs.google.com');
    };

    // Convert Google Drive URL to viewer format
    const getViewerUrl = (url: string) => {
        if (isGoogleDriveUrl(url)) {
            // If it's already a drive link, extract file ID and use viewer
            if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
                const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
                if (fileIdMatch) {
                    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                }
                // If already in preview format, use as is
                if (url.includes('/preview')) {
                    return url;
                }
                return `${url}/preview`;
            } else {
                // Assume it's a file ID for Google Drive
                return `https://drive.google.com/file/d/${url}/preview`;
            }
        } else {
            // Regular PDF URL - use PDF.js viewer
            return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
        }
    };

    const viewerUrl = getViewerUrl(fileurl);
    const isDriveViewer = isGoogleDriveUrl(fileurl);

    // Web-based security measures (equivalent to React Native screen capture protection)
    useEffect(() => {
        // Disable right-click context menu
        const disableContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Disable common keyboard shortcuts for saving/printing
        const disableShortcuts = (e: KeyboardEvent) => {
            // Disable Ctrl+S (Save), Ctrl+P (Print), F12 (DevTools), Ctrl+Shift+I (DevTools)
            if (
                (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
                (e.ctrlKey && (e.key === 'p' || e.key === 'P')) ||
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
                (e.ctrlKey && (e.key === 'u' || e.key === 'U')) // View source
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Disable text selection
        const disableSelection = (e: Event) => {
            e.preventDefault();
            return false;
        };

        // Disable drag and drop
        const disableDragDrop = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        // Add event listeners
        document.addEventListener('contextmenu', disableContextMenu);
        document.addEventListener('keydown', disableShortcuts);
        document.addEventListener('selectstart', disableSelection);
        document.addEventListener('dragstart', disableDragDrop);

        // Cleanup function
        return () => {
            document.removeEventListener('contextmenu', disableContextMenu);
            document.removeEventListener('keydown', disableShortcuts);
            document.removeEventListener('selectstart', disableSelection);
            document.removeEventListener('dragstart', disableDragDrop);
        };
    }, []);

    // Focus/blur security (similar to React Native useFocusEffect)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Page is hidden/minimized - could add additional security measures
                console.warn('PDF viewer is hidden - potential security risk');
            } else {
                // Page is visible again - re-enable protection
                console.log('PDF viewer is visible again');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Inject JavaScript to hide download buttons after iframe loads
    const handleIframeLoad = useCallback(() => {
        if (iframeRef.current) {
            try {
                const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
                if (iframeDoc) {
                    // Inject CSS to hide download and print buttons
                    const style = iframeDoc.createElement('style');
                    
                    if (isDriveViewer) {
                        // Google Drive specific styles
                        style.textContent = `
                            /* Hide Google Drive download and sharing buttons */
                            [data-tooltip*="Download"],
                            [data-tooltip*="Print"], 
                            [aria-label*="Download"],
                            [aria-label*="Print"],
                            [aria-label*="Share"],
                            [role="button"][aria-label*="Download"],
                            [role="button"][aria-label*="Print"],
                            [role="button"][aria-label*="Share"],
                            .ndfHFb-c4YZDc-Wrql6b,
                            .ndfHFb-c4YZDc-to915-LgbsSe,
                            .a-s-fa-Ha-pa {
                                display: none !important;
                            }
                            
                            /* Security: Disable text selection */
                            * {
                                -webkit-user-select: none !important;
                                -moz-user-select: none !important;
                                -ms-user-select: none !important;
                                user-select: none !important;
                                -webkit-touch-callout: none !important;
                            }
                            
                            /* Disable right-click context menu */
                            body {
                                -webkit-touch-callout: none;
                                -webkit-user-select: none;
                                -khtml-user-select: none;
                                -moz-user-select: none;
                                -ms-user-select: none;
                                user-select: none;
                            }
                        `;
                    } else {
                        // PDF.js specific styles
                        style.textContent = `
                            /* Hide download button and other controls */
                            #toolbarViewerRight,
                            #download,
                            #print,
                            #openFile,
                            .toolbarButton[title*="Download"],
                            .toolbarButton[title*="Print"],
                            .toolbarButton[title*="Save"],
                            button[title*="Download"],
                            button[title*="Print"],
                            button[title*="Save"] {
                                display: none !important;
                            }
                            
                            /* Security: Disable text selection */
                            * {
                                -webkit-user-select: none !important;
                                -moz-user-select: none !important;
                                -ms-user-select: none !important;
                                user-select: none !important;
                                -webkit-touch-callout: none !important;
                            }
                            
                            /* Disable right-click context menu */
                            body {
                                -webkit-touch-callout: none;
                                -webkit-user-select: none;
                                -khtml-user-select: none;
                                -moz-user-select: none;
                                -ms-user-select: none;
                                user-select: none;
                            }
                        `;
                    }
                    
                    iframeDoc.head.appendChild(style);

                    // Also try to hide buttons with JavaScript
                    setTimeout(() => {
                        if (isDriveViewer) {
                            // Google Drive elements to hide
                            const driveElementsToHide = [
                                '[data-tooltip*="Download"]',
                                '[data-tooltip*="Print"]', 
                                '[aria-label*="Download"]',
                                '[aria-label*="Print"]',
                                '[aria-label*="Share"]',
                                '[role="button"][aria-label*="Download"]',
                                '[role="button"][aria-label*="Print"]',
                                '[role="button"][aria-label*="Share"]'
                            ];

                            driveElementsToHide.forEach(selector => {
                                const elements = iframeDoc.querySelectorAll(selector);
                                elements.forEach(el => {
                                    (el as HTMLElement).style.display = 'none';
                                });
                            });
                        } else {
                            // PDF.js elements to hide
                            const elementsToHide = [
                                '#toolbarViewerRight',
                                '#download',
                                '#print',
                                '#openFile',
                                'button[title*="Download"]',
                                'button[title*="Print"]',
                                'button[title*="Save"]'
                            ];

                            elementsToHide.forEach(selector => {
                                const elements = iframeDoc.querySelectorAll(selector);
                                elements.forEach(el => {
                                    (el as HTMLElement).style.display = 'none';
                                });
                            });
                        }
                    }, isDriveViewer ? 2000 : 1000); // Longer timeout for Google Drive
                }
            } catch (error) {
                // Cross-origin restrictions might prevent this
                console.warn('Could not inject styles into iframe:', error);
            }
        }
    }, [isDriveViewer]);

    // Add security styles for the container
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            /* Security: Disable text selection and right-click */
            .pdf-viewer-container {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                -webkit-touch-callout: none;
                -webkit-tap-highlight-color: transparent;
            }
            
            /* Disable highlighting and selection */
            .pdf-viewer-container * {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
            }
            
            /* Hide scrollbars for cleaner look */
            .pdf-viewer-iframe::-webkit-scrollbar {
                width: 8px;
            }
            
            .pdf-viewer-iframe::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
            
            .pdf-viewer-iframe::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 4px;
            }
            
            .pdf-viewer-iframe::-webkit-scrollbar-thumb:hover {
                background: #a1a1a1;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    console.log('PDFViewer fileurl:', fileurl);

    // Ensure fileurl is a string
    if (!fileurl || typeof fileurl !== 'string') {
        return (
            <PDFErrorBoundary>
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">અમાન્ય PDF લિંક</h3>
                        <p className="text-gray-600 text-sm">આ PDF લિંક યોગ્ય ફોર્મેટમાં નથી</p>
                    </div>
                </div>
            </PDFErrorBoundary>
        );
    }

    return (
        <PDFErrorBoundary>
            <div 
                className="pdf-viewer-container"
                style={{ 
                    height: '100%', 
                    width: '100%',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Enhanced loading overlay */}
                <div 
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 z-10 rounded-xl"
                    style={{ 
                        transition: 'opacity 0.3s ease-in-out'
                    }}
                >
                    <div className="text-center p-6">
                        <div className="relative mb-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-blue-700 mb-2">
                            {isDriveViewer ? 'Google Drive દસ્તાવેજ લોડ થઈ રહ્યો છે...' : 'PDF લોડ થઈ રહ્યું છે...'}
                        </h3>
                        <p className="text-blue-600 text-sm">કૃપા કરીને થોડી રાહ જુઓ</p>
                        <div className="mt-4 w-48 bg-blue-200 rounded-full h-2 mx-auto">
                            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>

                <iframe
                    ref={iframeRef}
                    className="pdf-viewer-iframe"
                    src={viewerUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        outline: 'none'
                    }}
                    onLoad={() => {
                        // Hide loading overlay
                        const loadingOverlay = document.querySelector('.pdf-viewer-container .absolute');
                        if (loadingOverlay) {
                            (loadingOverlay as HTMLElement).style.opacity = '0';
                            setTimeout(() => {
                                (loadingOverlay as HTMLElement).style.display = 'none';
                            }, 300);
                        }
                        handleIframeLoad();
                    }}
                    title="PDF Viewer"
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        </PDFErrorBoundary>
    );
};

export default PDFViewer;
