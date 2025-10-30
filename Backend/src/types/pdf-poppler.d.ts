declare module 'pdf-poppler' {
  export interface ConvertOptions {
    format: 'jpeg' | 'png' | 'tiff' | 'ps' | 'eps' | 'svg';
    out_dir?: string;
    out_prefix?: string;
    page?: number | null;
    first_page?: number;
    last_page?: number;
    scale?: number;
    crop_h?: number;
    crop_w?: number;
    crop_x?: number;
    crop_y?: number;
    mono?: boolean;
    gray?: boolean;
    antialias?: boolean;
    jpeg_quality?: number;
    png_compression?: number;
    tiff_compression?: 'none' | 'packbits' | 'jpeg' | 'lzw' | 'deflate';
    separator?: string;
    print_version?: boolean;
    info?: boolean;
    poppler_path?: string;
  }

  export interface PDFInfo {
    creator: string;
    producer: string;
    creationDate: string;
    modificationDate: string;
    pages: number;
    title: string;
    subject: string;
    author: string;
    keywords: string;
    encrypted: boolean;
    printable: boolean;
    copyable: boolean;
    changeable: boolean;
    annotatable: boolean;
    forms: boolean;
    javascript: boolean;
    pdf_version: string;
    page_size: string;
    page_rot: string;
    file_size: string;
    optimized: boolean;
    tagged: boolean;
    suspects: boolean;
    linearized: boolean;
    user_properties: boolean;
    metadata: boolean;
  }

  export interface ConvertResult {
    page: number;
    name: string;
    path: string;
  }

  export function convert(file: string, options: ConvertOptions): Promise<ConvertResult[]>;
  export function info(file: string): Promise<PDFInfo>;
}
