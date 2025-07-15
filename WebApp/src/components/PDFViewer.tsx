import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onClose }) => {
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = `${title}.pdf`;
    link.click();
  };

  const handleOpenInNewTab = () => {
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 truncate">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download size={20} />
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="p-4 h-[calc(90vh-80px)]">
          <iframe
            src={fullUrl}
            className="w-full h-full border-0 rounded-lg"
            title={title}
          />
        </div>
      </div>
    </div>
  );
};
