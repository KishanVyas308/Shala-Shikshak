// Core viewer
import { Viewer, ScrollMode } from '@react-pdf-viewer/core';

// Plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import { Worker } from '@react-pdf-viewer/core';
import React from 'react';
import { Maximize } from 'lucide-react';

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
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Handle fullscreen functionality
    const toggleFullscreen = React.useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                console.log('Entered fullscreen mode');
            }).catch((err) => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                console.log('Exited fullscreen mode');
            }).catch((err) => {
                console.error('Error attempting to exit fullscreen:', err);
            });
        }
    }, []);

    // Add mobile-friendly styles
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile-friendly PDF viewer styles */
            .rpv-core__viewer {
                font-size: 14px;
            }
            
            /* Make toolbar buttons smaller and consistent */
            .rpv-toolbar__button {
                min-width: 24px !important;
                min-height: 24px !important;
                padding: 2px !important;
                margin: 1px !important;
                font-size: 10px !important;
            }
            
            /* Make zoom dropdown smaller */
            .rpv-zoom__popover-target button {
                min-width: 40px !important;
                min-height: 24px !important;
                font-size: 10px !important;
                padding: 2px 4px !important;
            }
            
            /* Fullscreen button styling */
            .rpv-full-screen__button {
                min-width: 24px !important;
                min-height: 24px !important;
                padding: 2px !important;
                font-size: 10px !important;
            }
            
            /* Responsive toolbar */
            @media (max-width: 768px) {
                .rpv-toolbar {
                    padding: 2px !important;
                }
                
                .rpv-toolbar__button {
                    min-width: 26px !important;
                    min-height: 26px !important;
                    margin: 1px !important;
                    font-size: 10px !important;
                }
                
                .rpv-zoom__popover-target button {
                    min-width: 42px !important;
                    min-height: 26px !important;
                    font-size: 10px !important;
                }
                
                .rpv-full-screen__button {
                    min-width: 26px !important;
                    min-height: 26px !important;
                    font-size: 10px !important;
                }
            }
            
            /* Hide scrollbars in fullscreen for cleaner look */
            .rpv-core__doc::-webkit-scrollbar {
                width: 8px;
            }
            
            .rpv-core__doc::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
            
            .rpv-core__doc::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 4px;
            }
            
            .rpv-core__doc::-webkit-scrollbar-thumb:hover {
                background: #a1a1a1;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Create new plugin instances
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        // Hide sidebar
        sidebarTabs: () => [],
        // Configure toolbar to show only essential items
        renderToolbar: (Toolbar: any) => (
            <Toolbar>
                {(slots: any) => {
                    const {
                        // Zoom controls
                        ZoomIn,
                        ZoomOut,
                        Zoom,
                    } = slots;
                    return (
                        <div
                            style={{
                                alignItems: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '2px 4px',
                                backgroundColor: '#f8f9fa',
                                borderBottom: '1px solid #dee2e6',
                                gap: '4px',
                                flexWrap: 'wrap',
                                minHeight: '38px',
                            }}
                        >
                            {/* Zoom controls */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '2px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                padding: '1px',
                                border: '1px solid #dee2e6',
                                justifyContent: 'center',
                            }}>
                                <ZoomOut size={12} />
                                <Zoom size={12} />
                                <ZoomIn size={12} />
                            </div>
                            
                            {/* Custom Fullscreen control */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                padding: '1px',
                                border: '1px solid #dee2e6'
                            }}>
                                <button
                                    onClick={toggleFullscreen}
                                    style={{
                                        minWidth: '24px',
                                        minHeight: '24px',
                                        padding: '2px',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                    }}
                                    title="Toggle Fullscreen"
                                >
                                    <Maximize size={12} />
                                </button>
                            </div>
                        </div>
                    );
                }}
            </Toolbar>
        ),
    });
    console.log('PDFViewer fileurl:', fileurl);

    // Ensure fileurl is a string
    if (!fileurl || typeof fileurl !== 'string') {
        return (
            <div className="flex items-center justify-center h-full bg-gray-100">
                <p className="text-gray-500">Invalid PDF URL</p>
            </div>
        );
    }

    return (
        <PDFErrorBoundary>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <div 
                    ref={containerRef}
                    style={{ 
                        height: '100%', 
                        width: '100%',
                        touchAction: 'pan-x pan-y pinch-zoom', // Enable mobile gestures
                        overflow: 'hidden'
                    }}
                >
                    <Viewer
                        fileUrl={fileurl}
                        plugins={[
                            defaultLayoutPluginInstance,
                        ]}
                        defaultScale={1.0} // Start with fit-to-width on mobile
                        scrollMode={ScrollMode.Vertical}
                    />
                </div>
            </Worker>
        </PDFErrorBoundary>
    );
};

export default PDFViewer;
