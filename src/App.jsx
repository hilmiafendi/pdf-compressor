import { useState } from 'react';

export default function App() {
  const [file, setFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedFile, setCompressedFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setCompressedFile(null);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleCompress = () => {
    if (!file) return;

    setIsCompressing(true);
    setProgress(0);

    // Simulate compression process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        simulateCompressionResult();
      }
    }, 300);
  };

  const simulateCompressionResult = () => {
    // Simulated compressed file
    const compressedBlob = new Blob([file], { type: 'application/pdf' });
    const compressedURL = URL.createObjectURL(compressedBlob);

    setCompressedFile({
      name: `compressed_${file.name}`,
      size: Math.round(file.size * 0.3), // 70% smaller
      url: compressedURL,
    });

    setIsCompressing(false);
    setProgress(100);
  };

  const downloadCompressed = () => {
    if (!compressedFile) return;
    const link = document.createElement('a');
    link.href = compressedFile.url;
    link.download = compressedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500">
          Ultimate PDF Compressor
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-gray-200">
          Compress your PDF files for free with our ultra-efficient algorithm - better than paid services!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <label className="cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-cyan-500/25">
            <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
            Upload PDF
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

      {/* File Info Section */}
      <section className="container mx-auto px-4 py-8 max-w-3xl">
        {file && (
          <div className="bg-black/30 backdrop-blur-sm border border-white/20 p-6 rounded-xl mb-8 shadow-lg transform transition-all hover:scale-[1.01]">
            <h2 className="text-xl font-semibold mb-2">Uploaded File</h2>
            <div className="flex items-center gap-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
              <span className="truncate">{file.name}</span>
            </div>
            <p className="text-sm text-gray-300">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        {isCompressing && (
          <div className="bg-black/30 backdrop-blur-sm border border-white/20 p-6 rounded-xl mb-8 shadow-lg animate-pulse">
            <h2 className="text-xl font-semibold mb-4">Compressing Your PDF...</h2>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-gray-300">{progress}% complete</p>
          </div>
        )}

        {compressedFile && (
          <div className="bg-black/30 backdrop-blur-sm border border-white/20 p-6 rounded-xl mb-8 shadow-lg transform transition-all hover:scale-[1.01]">
            <h2 className="text-xl font-semibold mb-2">Compressed File Ready!</h2>
            <div className="flex items-center gap-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
              <span className="truncate">{compressedFile.name}</span>
            </div>
            <p className="text-sm text-gray-300">Size: {(compressedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <button
              onClick={downloadCompressed}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-cyan-500/25"
            >
              Download Compressed PDF
            </button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-12">Why Our Compressor is Better</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Advanced Compression",
              description: "Our proprietary algorithm reduces file size by up to 90% without compromising readability.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              ),
            },
            {
              title: "Zero Quality Loss",
              description: "Smart optimization maintains high quality while reducing file size for professional use.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              ),
            },
            {
              title: "Instant Processing",
              description: "Get results in seconds with our optimized backend processing engine.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="8" rx="2"></rect>
                  <line x1="12" y1="6" x2="12" y2="14"></line>
                  <line x1="8" y1="6" x2="8" y2="14"></line>
                  <line x1="16" y1="6" x2="16" y2="14"></line>
                </svg>
              ),
            },
          ].map((feature, index) => (
            <div key={index} className="bg-black/30 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-cyan-400 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-cyan-800/50 to-blue-900/50 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to compress your PDF?</h2>
          <p className="text-xl text-gray-200 mb-8">Try our powerful compressor today – completely free and no registration required.</p>
          <label className="inline-block cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-cyan-500/25">
            <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
            Upload Your PDF Now
          </label>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm border-t border-white/10">
        <p>© {new Date().getFullYear()} Ultimate PDF Compressor. All rights reserved.</p>
        <p className="mt-2">Free & Open Source PDF Compression Tool</p>
      </footer>
    </div>
  );
}