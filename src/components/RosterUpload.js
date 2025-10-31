import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowRight,
  Users
} from 'lucide-react';

// Required fields for student roster (outside component to prevent re-creation)
const requiredFields = [
  { key: 'firstName', label: 'Student First Name', required: true },
  { key: 'lastName', label: 'Student Last Name', required: true },
  { key: 'studentEmail', label: 'Student Email', required: false },
  { key: 'studentPhone', label: 'Student Phone', required: false },
  { key: 'parentFirstName', label: 'Parent First Name', required: false },
  { key: 'parentLastName', label: 'Parent Last Name', required: false },
  { key: 'parentEmail', label: 'Parent Email', required: true },
  { key: 'parentPhone', label: 'Parent Phone', required: false },
  { key: 'goal', label: 'Fundraising Goal ($)', required: false }
];

const RosterUpload = ({ team, program, onClose, onUploadComplete }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map Columns, 3: Preview, 4: Confirm
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          alert('The CSV file is empty or invalid.');
          return;
        }

        setHeaders(results.meta.fields || []);
        setCsvData(results.data);

        // Auto-map columns based on header names (case-insensitive partial match)
        const autoMapping = {};
        const normalizedHeaders = results.meta.fields.map(h => h.toLowerCase().trim());

        requiredFields.forEach(field => {
          // Try to find matching column
          const matchIndex = normalizedHeaders.findIndex(header => {
            if (field.key === 'firstName') return (header.includes('first') && header.includes('student')) || header === 'firstname' || header === 'first name';
            if (field.key === 'lastName') return (header.includes('last') && header.includes('student')) || header === 'lastname' || header === 'last name';
            if (field.key === 'studentEmail') return header.includes('student') && header.includes('email');
            if (field.key === 'studentPhone') return header.includes('student') && header.includes('phone');
            if (field.key === 'parentFirstName') return header.includes('parent') && header.includes('first');
            if (field.key === 'parentLastName') return header.includes('parent') && header.includes('last');
            if (field.key === 'parentEmail') return header.includes('parent') && header.includes('email');
            if (field.key === 'parentPhone') return header.includes('parent') && header.includes('phone');
            if (field.key === 'goal') return header.includes('goal') || header.includes('amount');
            return false;
          });

          if (matchIndex !== -1) {
            autoMapping[field.key] = results.meta.fields[matchIndex];
          }
        });

        setColumnMapping(autoMapping);
        setStep(2);
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
      }
    });
  }, []);

  const validateData = useCallback(() => {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const seenEmails = new Set();

    csvData.forEach((row, index) => {
      const rowNum = index + 2; // +2 because index starts at 0 and we skip header row

      // Check required fields
      const firstName = row[columnMapping.firstName];
      const lastName = row[columnMapping.lastName];
      const parentEmail = row[columnMapping.parentEmail];

      if (!firstName || firstName.trim() === '') {
        errors.push(`Row ${rowNum}: Student First Name is required`);
      }

      if (!lastName || lastName.trim() === '') {
        errors.push(`Row ${rowNum}: Student Last Name is required`);
      }

      if (!parentEmail || parentEmail.trim() === '') {
        errors.push(`Row ${rowNum}: Parent Email is required`);
      } else if (!emailRegex.test(parentEmail.trim())) {
        errors.push(`Row ${rowNum}: Invalid Parent Email format`);
      } else {
        // Check for duplicate emails
        const normalizedEmail = parentEmail.toLowerCase().trim();
        if (seenEmails.has(normalizedEmail)) {
          errors.push(`Row ${rowNum}: Duplicate Parent Email (${parentEmail})`);
        }
        seenEmails.add(normalizedEmail);
      }

      // Validate student email if provided
      const studentEmail = row[columnMapping.studentEmail];
      if (studentEmail && studentEmail.trim() !== '' && !emailRegex.test(studentEmail.trim())) {
        errors.push(`Row ${rowNum}: Invalid Student Email format`);
      }

      // Validate goal if provided
      const goal = row[columnMapping.goal];
      if (goal && goal.trim() !== '') {
        const goalNum = parseFloat(goal);
        if (isNaN(goalNum) || goalNum < 0) {
          errors.push(`Row ${rowNum}: Invalid Goal amount (must be a positive number)`);
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [csvData, columnMapping]);

  const handleColumnMappingChange = (fieldKey, columnName) => {
    setColumnMapping(prev => ({
      ...prev,
      [fieldKey]: columnName
    }));
  };

  const handleNext = () => {
    if (step === 2) {
      // Check if all required fields are mapped
      const missingRequired = requiredFields
        .filter(f => f.required && !columnMapping[f.key])
        .map(f => f.label);

      if (missingRequired.length > 0) {
        alert(`Please map the following required fields: ${missingRequired.join(', ')}`);
        return;
      }

      // Validate data
      if (!validateData()) {
        setStep(3); // Go to validation errors page
        return;
      }

      setStep(3);
    } else if (step === 3) {
      handleUpload();
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      // Transform CSV data to student objects
      const students = csvData.map(row => ({
        firstName: row[columnMapping.firstName]?.trim() || '',
        lastName: row[columnMapping.lastName]?.trim() || '',
        studentEmail: row[columnMapping.studentEmail]?.trim() || '',
        studentPhone: row[columnMapping.studentPhone]?.trim() || '',
        parentFirstName: row[columnMapping.parentFirstName]?.trim() || '',
        parentLastName: row[columnMapping.parentLastName]?.trim() || '',
        parentEmail: row[columnMapping.parentEmail]?.trim() || '',
        parentPhone: row[columnMapping.parentPhone]?.trim() || '',
        goal: row[columnMapping.goal] ? parseFloat(row[columnMapping.goal]) : 500, // Default $500
        team,
        program
      }));

      // Call Google Apps Script endpoint
      const response = await fetch(process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulkAddStudents',
          students
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`Successfully added ${result.count} students to ${team}!`);
        onUploadComplete();
        onClose();
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading roster:', error);
      alert(`Error uploading roster: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['Student First Name', 'Student Last Name', 'Student Email', 'Student Phone', 'Parent First Name', 'Parent Last Name', 'Parent Email', 'Parent Phone', 'Fundraising Goal'],
      ['John', 'Smith', 'john.smith@email.com', '(555) 123-4567', 'Jane', 'Smith', 'jane.smith@email.com', '(555) 123-4568', '500'],
      ['Sarah', 'Johnson', 'sarah.j@email.com', '(555) 234-5678', 'Mike', 'Johnson', 'mike.j@email.com', '(555) 234-5679', '750']
    ];

    const csv = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roster_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-black text-white">Upload Team Roster</h2>
                <p className="text-cyan-100">{team} - {program}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                  step >= stepNum ? 'bg-white text-cyan-600' : 'bg-cyan-700 text-white'
                }`}>
                  {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > stepNum ? 'bg-white' : 'bg-cyan-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: File Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload CSV File</h3>
                <p className="text-gray-600">Upload a CSV file containing your team roster</p>
              </div>

              <div className="border-2 border-dashed border-cyan-300 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Click to upload CSV file
                  </p>
                  <p className="text-sm text-gray-600">
                    or drag and drop your file here
                  </p>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Don't have a roster file yet?</p>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      Download CSV Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Map CSV Columns</h3>
                <p className="text-gray-600">
                  Match your CSV columns to the required fields
                </p>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-cyan-900">
                  <strong>File:</strong> {file?.name} ({csvData.length} rows)
                </p>
              </div>

              <div className="space-y-3">
                {requiredFields.map(field => (
                  <div key={field.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="font-semibold text-gray-900">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <select
                        value={columnMapping[field.key] || ''}
                        onChange={(e) => handleColumnMappingChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="">-- Select Column --</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Next: Preview
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Validate */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Preview & Confirm</h3>
                <p className="text-gray-600">
                  Review the data before uploading
                </p>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 mb-2">
                        {validationErrors.length} Validation Error{validationErrors.length !== 1 ? 's' : ''}
                      </p>
                      <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                        {validationErrors.slice(0, 10).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {validationErrors.length > 10 && (
                          <li className="font-semibold">... and {validationErrors.length - 10} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {validationErrors.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-900">
                      All data validated successfully! Ready to upload {csvData.length} students.
                    </p>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">#</th>
                        <th className="px-3 py-2 text-left font-semibold">Student Name</th>
                        <th className="px-3 py-2 text-left font-semibold">Parent Email</th>
                        <th className="px-3 py-2 text-left font-semibold">Goal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2">
                            {row[columnMapping.firstName]} {row[columnMapping.lastName]}
                          </td>
                          <td className="px-3 py-2">{row[columnMapping.parentEmail]}</td>
                          <td className="px-3 py-2">
                            ${row[columnMapping.goal] || '500'}
                          </td>
                        </tr>
                      ))}
                      {csvData.length > 10 && (
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td colSpan="4" className="px-3 py-2 text-center text-gray-600">
                            ... and {csvData.length - 10} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={isUploading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={validationErrors.length > 0 || isUploading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Upload {csvData.length} Students
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RosterUpload;
