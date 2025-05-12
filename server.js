// server.js
console.log('Starting server...');
import express from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import cors from 'cors'; // Import cors

const app = express();

// Enable CORS for all routes and origins
app.use(cors());

const upload = multer({ dest: 'uploads/' });

// Ensure the 'uploads' directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.post('/compress', upload.single('pdf'), (req, res) => {
    if (!req.file) {
        console.error('No file uploaded.');
        return res.status(400).send('No file uploaded.');
    }

    let originalInputPath = path.resolve(req.file.path); // Keep track of multer's original path
    let inputPath = originalInputPath; // This path might be modified if renamed

    // Ensure the input file has a .pdf extension for Ghostscript
    // Multer doesn't add original extension by default
    const originalExtension = path.extname(req.file.originalname).toLowerCase();
    if (originalExtension !== '.pdf') {
        console.warn(`Uploaded file "${req.file.originalname}" is not a PDF based on extension. Attempting to process anyway if it was uploaded without one.`);
        // If you strictly want to only allow .pdf, you could error out here.
        // For this example, we'll assume Ghostscript might handle it or it's a PDF without the right extension.
        // Better: Rename to ensure Ghostscript sees it as .pdf
        const tempPdfPath = originalInputPath + '.pdf';
        try {
            fs.renameSync(originalInputPath, tempPdfPath);
            inputPath = tempPdfPath; // Use the new path
            console.log('Renamed input file to include .pdf extension:', inputPath);
        } catch (err) {
            console.error('Failed to rename input file to add .pdf extension:', err);
            // Clean up original multer file
            if (fs.existsSync(originalInputPath)) {
                fs.unlinkSync(originalInputPath);
            }
            return res.status(500).send('Error preparing file for compression.');
        }
    } else if (path.extname(inputPath).toLowerCase() !== '.pdf') {
        // This case handles if multer saved it without an extension but original name had one
        const tempPdfPathWithOriginalExt = inputPath + originalExtension;
         try {
            fs.renameSync(inputPath, tempPdfPathWithOriginalExt);
            inputPath = tempPdfPathWithOriginalExt;
            console.log('Applied original .pdf extension to multer temp file:', inputPath);
        } catch (err) {
            console.error('Failed to rename input file with original extension:', err);
            if (fs.existsSync(originalInputPath)) { // originalInputPath is multer's temp name
                fs.unlinkSync(originalInputPath);
            }
            return res.status(500).send('Error preparing file for compression (renaming).');
        }
    }


    // Sanitize filename for output
    const sanitizedBaseName = path.basename(req.file.originalname, path.extname(req.file.originalname)).replace(/[^a-zA-Z0-9.-]/g, '_');
    const outputFileName = `compressed-${sanitizedBaseName}.pdf`;
    const outputPath = path.resolve(outputFileName); // Save to root, or a 'compressed_output' dir

    console.log('Received file:', req.file.originalname);
    console.log('Processing input path:', inputPath);
    console.log('Intended output path:', outputPath);

    // Escape file paths for the command line (wrapping in double quotes is generally best for exec)
    // Node's exec on Windows often handles spaces in paths well if quoted.
    // For backslashes, they are path separators on Windows.
    const escapedInputPath = `"${inputPath}"`;
    const escapedOutputPath = `"${outputPath}"`;

    // Ensure Ghostscript executable is correct for your environment (gswin64c for 64-bit Windows)
    const gsExecutable = 'gswin64c'; // or 'gs' for Linux/macOS (ensure it's in PATH)
    const gsCommand = `${gsExecutable} -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${escapedOutputPath} ${escapedInputPath}`;
    console.log('Executing Ghostscript command:', gsCommand);

    exec(gsCommand, (error, stdout, stderr) => {
        // Always try to clean up the (potentially renamed) input file
        if (fs.existsSync(inputPath)) {
            try {
                fs.unlinkSync(inputPath);
                console.log('Cleaned up input file:', inputPath);
            } catch (e) {
                console.error('Error cleaning up input file:', inputPath, e);
            }
        }
        // If the original multer path is different (due to renaming), try to clean it too (though renameSync moves it)
        if (inputPath !== originalInputPath && fs.existsSync(originalInputPath)) {
             try {
                fs.unlinkSync(originalInputPath);
                console.log('Cleaned up original multer file (if different):', originalInputPath);
            } catch (e) {
                console.error('Error cleaning up original multer file:', originalInputPath, e);
            }
        }


        if (error) {
            console.error('Compression error:', error);
            console.error('Ghostscript stderr:', stderr);
            return res.status(500).send(`Error compressing PDF: ${stderr || error.message}`);
        }

        console.log('Ghostscript stdout:', stdout);
        if (stderr) { // Ghostscript sometimes outputs informational messages to stderr
            console.log('Ghostscript stderr (possibly informational):', stderr);
        }

        try {
            const outputSize = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
            console.log(`Output file size: ${outputSize} bytes`);

            if (outputSize === 0) {
                console.error('Output file was created but is empty.');
                 if (fs.existsSync(outputPath)) { // Clean up empty output file
                    fs.unlinkSync(outputPath);
                }
                return res.status(500).send('PDF compression resulted in an empty file.');
            }
        } catch (e) {
            console.error('Error retrieving output file size or file does not exist:', e);
             if (fs.existsSync(outputPath)) { // Clean up if exists but error occurred
                fs.unlinkSync(outputPath);
            }
            return res.status(500).send('PDF compression failed: output file issue.');
        }

        res.download(outputPath, outputFileName, (downloadErr) => {
            if (downloadErr) {
                if (downloadErr.code === 'ECONNABORTED') {
                    console.log('Download aborted by client.');
                } else {
                    console.error('Download error:', downloadErr);
                }
            }
            // Clean up the compressed output file after download attempt
            if (fs.existsSync(outputPath)) {
                try {
                    fs.unlinkSync(outputPath);
                    console.log('Cleaned up output file:', outputPath);
                } catch (cleanupError) {
                    console.error('Error cleaning up output file:', outputPath, cleanupError);
                }
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));