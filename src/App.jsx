// App.js
import { useState } from 'react';

export default function App() {
  const [file, setFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedFile, setCompressedFile] = useState(null);
  const [progress, setProgress] = useState(0); // Simple 0 to 100 progress
  const [error, setError] = useState('');

  const handleUpload = (e) => {
    const selectedFile = e.target.files[0];
    setError(''); // Clear previous errors
    setCompressedFile(null); // Clear previous compression results
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      setFile(null);
      alert('Please upload a valid PDF file.');
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    setCompressedFile(null);
    setError('');
    setProgress(0); // Indicate start of process

    const formData = new FormData();
    formData.append('pdf', file);

    // Simulate some progress for UI feedback, actual progress is harder
    const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
    }, 200);


    try {
      const response = await fetch('http://localhost:3000/compress', { // Ensure this matches your backend URL
        method: 'POST',
        body: formData,
        // Note: 'Content-Type': 'multipart/form-data' is set automatically by browser for FormData
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const blob = await response.blob();
        const compressedURL = URL.createObjectURL(blob);

        setCompressedFile({
          name: `compressed_${file.name}`, // Or use content-disposition header if backend sets it
          size: blob.size,
          url: compressedURL,
          originalSize: file.size,
          compressionRatio: blob.size / file.size,
        });
        setProgress(100); // Indicate completion
      } else {
        const errorText = await response.text();
        console.error('Failed to compress PDF:', response.status, errorText);
        setError(`Failed to compress the PDF: ${errorText || response.statusText}. Please try again.`);
        setProgress(0);
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Error during compression:', err);
      setError(`An error occurred: ${err.message}. Check the console and server logs.`);
      setProgress(0);
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedFile) return;
    const link = document.createElement('a');
    link.href = compressedFile.url;
    link.download = compressedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Optional: Revoke the object URL after some time if not needed anymore
    // setTimeout(() => URL.revokeObjectURL(compressedFile.url), 60 * 1000);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 text-white flex flex-col items-center py-10">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500">
          Ultimate PDF Compressor
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-gray-200">
          Compress your PDF files with our efficient algorithm - free and easy to use!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <label className="cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-cyan-500/25">
            <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
            {file ? "Change PDF" : "Upload PDF"}
          </label>
          {file && !isCompressing && (
            <button
              onClick={handleCompress}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-green-500/25"
            >
              Compress Now
            </button>
          )}
        </div>
      </header>

      {/* File Info & Progress Section */}
      <section className="container mx-auto px-4 py-8 max-w-3xl w-full">
        {error && (
            <div className="bg-red-500/30 border border-red-400 text-red-100 p-4 rounded-xl mb-8 shadow-lg">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p>{error}</p>
            </div>
        )}

        {file && (
          <div className="bg-black/30 backdrop-blur-sm border border-white/20 p-6 rounded-xl mb-8 shadow-lg transform transition-all hover:scale-[1.01]">
            <h2 className="text-xl font-semibold mb-2">Uploaded File</h2>
            <div className="flex items-center gap-3 mb-2">
              <span className="truncate">{file.name}</span>
            </div>
            <p className="text-sm text-gray-300">Size: {formatSize(file.size)}</p>
          </div>
        )}

        {isCompressing && (
          <div className="bg-black/30 backdrop-blur-sm border border-white/20 p-6 rounded-xl mb-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Optimizing Your PDF...</h2>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-150" // Adjusted duration
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-gray-300">{progress === 100 ? "Finalizing..." : `Processing... ${progress}%`}</p>
          </div>
        )}

        {compressedFile && !isCompressing && (
          <div className="bg-black/30 backdrop-blur-sm border border-white/20 p-6 rounded-xl mb-8 shadow-lg transform transition-all hover:scale-[1.01]">
            <h2 className="text-xl font-semibold mb-2">Compression Complete!</h2>
            <div className="flex items-center gap-3 mb-2">
              <span className="truncate">{compressedFile.name}</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-300">Original: {formatSize(compressedFile.originalSize)}</p>
              <p className="text-sm text-gray-300">Compressed: {formatSize(compressedFile.size)}</p>
              <p className="text-sm text-green-400 font-medium">
                Size reduced by {Math.round((1 - compressedFile.compressionRatio) * 100)}%
              </p>
            </div>
            <button
              onClick={downloadCompressed}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-cyan-500/25"
            >
              Download Compressed PDF
            </button>
          </div>
        )}
      </section>
    </div>
  );
}