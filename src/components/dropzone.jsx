import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const MyDropzone = ( onFileRead ) => {
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const text = reader.result;
        if (onFileRead) {
          onFileRead.onFileRead(text);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex h-screen w-full h-full" {...getRootProps()}>
      <input {...getInputProps()} />
      <p className='m-auto'>Drop CSV here</p>
    </div>
  );
};

export default MyDropzone;
