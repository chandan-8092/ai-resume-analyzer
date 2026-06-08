import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts raw text from a PDF file buffer.
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
export const parsePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF resume.');
  }
};

/**
 * Extracts raw text from a DOCX file buffer.
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
export const parseDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to extract text from DOCX resume.');
  }
};

/**
 * Main parse route router helper
 * @param {Buffer} buffer 
 * @param {string} mimeType 
 * @returns {Promise<string>}
 */
export const parseResumeText = async (buffer, mimeType) => {
  if (mimeType === 'application/pdf') {
    return await parsePDF(buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return await parseDOCX(buffer);
  } else {
    throw new Error('Unsupported file format. Please upload PDF or DOCX.');
  }
};
