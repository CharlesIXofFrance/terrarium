import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  onChange: (file: File | null) => void;
  helpText?: string;
  previewUrl?: string;
  imageClassName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  onChange,
  helpText = 'PNG, JPG, GIF, SVG up to 10MB',
  previewUrl,
  imageClassName = 'h-20 w-20 object-contain rounded border border-gray-200',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange(file);
  };

  if (previewUrl) {
    return (
      <div
        onClick={handleClick}
        className="relative group cursor-pointer inline-block"
      >
        <img src={previewUrl} alt="Preview" className={imageClassName} />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
          <span className="text-white text-sm">Change</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept={accept}
          onChange={handleChange}
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400 transition-colors"
    >
      <div className="space-y-1 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="flex text-sm text-gray-600">
          <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
            <span>Upload a file</span>
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept={accept}
              onChange={handleChange}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">{helpText}</p>
      </div>
    </div>
  );
};
