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
                <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">PDF લોડ કરવામાં સમસ્યા</p>
                        <p className="text-gray-500 text-sm">કૃપા કરીને પાછળથી પ્રયાસ કરો</p>
                        <button 
                            onClick={() => this.setState({ hasError: false })}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                            ફરીથી પ્રયાસ કરો
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileurl }) => {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

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
                    iframeDoc.head.appendChild(style);

                    // Also try to hide buttons with JavaScript
                    setTimeout(() => {
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
                    }, 1000);
                }
            } catch (error) {
                // Cross-origin restrictions might prevent this
                console.warn('Could not inject styles into iframe:', error);
            }
        }
    }, []);

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
                <div className="flex items-center justify-center h-full bg-gray-100">
                    <p className="text-gray-500">PDF URL અમાન્ય છે</p>
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
                {/* Loading overlay */}
                <div 
                    className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"
                    style={{ 
                        transition: 'opacity 0.3s ease-in-out'
                    }}
                >
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-600">PDF લોડ થઈ રહ્યું છે...</p>
                    </div>
                </div>

                <iframe
                    ref={iframeRef}
                    className="pdf-viewer-iframe"
                    src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileurl)}`}
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
