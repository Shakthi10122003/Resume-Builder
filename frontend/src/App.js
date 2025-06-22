// frontend/src/App.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'; // Added useMemo
// eslint-disable-next-line no-unused-vars
import html2canvas from 'html2canvas'; // html2canvas is used indirectly by jspdf.html method
import { jsPDF } from 'jspdf';
// Import Firebase modules
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
}
from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

// Your web app's Firebase configuration
// IMPORTANT: Ensure these values EXACTLY match your Firebase Project Settings > General > Your apps (select your web app).
const firebaseConfig = {
    apiKey: "AIzaSyAKDHqu6q2eai8pHlZWUQkrkIRGBDOETsE",
    authDomain: "resume-builder-64637.firebaseapp.com",
    projectId: "resume-builder-64637",
    storageBucket: "resume-builder-64637.firebaseapp.com",
    messagingSenderId: "198547180366",
    appId: "1:198547180366:web:ba2cab299a7d2c4f90ec1f",
    measurementId: "G-16ELKTQZNE"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const API_BASE_URL = 'http://localhost:5000'; // Replace with your backend URL if deployed

// Classic Template (formerly Blue Theme)
const ClassicTemplate = ({ resumeData, selectedColor }) => (
    <div className="bg-blue-50 p-8 rounded-xl shadow-md space-y-4 print:shadow-none">
        <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            @media print {
                html, body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box; /* Ensures padding/border are included in element's total width/height */
                    width: 210mm; /* A4 width */
                    height: 297mm; /* A4 height */
                    overflow: hidden;
                    font-family: 'Inter', sans-serif !important; /* Ensure font is applied for print */
                }
                .print\\:shadow-none { box-shadow: none !important; }
                /* Section header styles for print */
                .print-section-header {
                    font-size: 16pt !important;
                    padding-bottom: 3mm !important; /* Gap before the line in print */
                    margin-top: 5mm !important;
                    margin-bottom: 4mm !important; /* Space after the line in print */
                    border-bottom: 2px solid #000000 !important; /* Bold black line for print */
                }
                .print-h1 { font-size: 24pt !important; color: #000000 !important; font-weight: bold !important; } /* Black and bold heading for print */
                .print-h2 { font-size: 20pt !important; color: #000000 !important; font-weight: bold !important; } /* Black and bold heading for print */
                .print-h3 { font-size: 12pt !important; color: #000000 !important; font-weight: bold !important; } /* Black and bold heading for print */
                .print-p, .print-li {
                    font-size: 10pt !important;
                    line-height: 1.5 !important;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    color: #000000 !important; /* Ensure text is black for print */
                    font-weight: normal !important; /* Ensure normal font weight for body text in print */
                }
                .print-text-sm { font-size: 9pt !important; }
                .print-italic { font-style: italic !important; }
                .print-list-disc { list-style-type: disc !important; margin-left: 5mm !important; }
                .print-bg-white { background-color: #ffffff !important; } /* Ensure background is white for print */
            }
            `}
        </style>
        {/* Personal Details */}
        {(resumeData.personalDetails.name || resumeData.personalDetails.email || resumeData.personalDetails.phone || resumeData.personalDetails.linkedin || resumeData.personalDetails.github || resumeData.personalDetails.portfolio || resumeData.personalDetails.location || resumeData.personalDetails.title) && (
            <div className="text-center pb-6 mb-6 break-words print-bg-white">
                {resumeData.personalDetails.name && <h1 className="text-4xl font-bold text-black print-h1">{resumeData.personalDetails.name}</h1>}
                {resumeData.personalDetails.title && <p className="text-gray-700 print-p print-text-black mb-2">{resumeData.personalDetails.title}</p>}
                <p className="text-gray-600 print-p print-text-black">
                    {resumeData.personalDetails.email && <span className="break-words">{resumeData.personalDetails.email} | </span>}
                    {resumeData.personalDetails.phone && <span>{resumeData.personalDetails.phone}</span>}
                </p>
                <p className="text-gray-600 print-p print-text-black">
                    {resumeData.personalDetails.linkedin && (
                        <a href={resumeData.personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
                            {resumeData.personalDetails.linkedin}
                        </a>
                    )}
                    {/* Conditionally render separator only if GitHub exists and LinkedIn or Phone/Email exists */}
                    {resumeData.personalDetails.github && (resumeData.personalDetails.linkedin || resumeData.personalDetails.phone || resumeData.personalDetails.email) && <span className="mx-1">|</span>}
                    {resumeData.personalDetails.github && (
                        <a href={resumeData.personalDetails.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
                            {resumeData.personalDetails.github}
                        </a>
                    )}
                    {/* Conditionally render separator only if Portfolio exists and any preceding link exists */}
                    {resumeData.personalDetails.portfolio && (resumeData.personalDetails.linkedin || resumeData.personalDetails.github || resumeData.personalDetails.phone || resumeData.personalDetails.email) && <span className="mx-1">|</span>}
                    {resumeData.personalDetails.portfolio && (
                        <a href={resumeData.personalDetails.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
                            {resumeData.personalDetails.portfolio}
                        </a>
                    )}
                    {resumeData.personalDetails.location && <span className="ml-1">| {resumeData.personalDetails.location}</span>}
                </p>
            </div>
        )}

        {/* Summary */}
        {resumeData.summary && (
            <section className="print-bg-white">
                <h2 className="text-2xl font-bold border-b-2 border-black pb-3 mb-4 print-section-header print-h2" style={{ color: selectedColor || '#000000' }}>Summary</h2>
                <p className="text-gray-700 leading-relaxed break-words print-p print-text-black">{resumeData.summary}</p>
            </section>
        )}

        {/* Experience */}
        {resumeData.experience.some(exp => exp.title || exp.company || exp.location || exp.startDate || exp.endDate || (exp.description && exp.description.some(d => d))) && (
            <section className="print-bg-white">
                <h2 className="text-2xl font-bold border-b-2 border-black pb-3 mb-4 print-section-header print-h2" style={{ color: selectedColor || '#000000' }}>Experience</h2>
                {resumeData.experience.filter(exp => exp.title || exp.company || exp.location || exp.startDate || exp.endDate || (exp.description && exp.description.some(d => d))).map((exp) => (
                    <div key={exp.id} className="mb-4">
                        {(exp.title || exp.company) && <h3 className="text-lg font-semibold text-black break-words print-h3">{exp.title}{exp.title && exp.company && " - "}{exp.company}</h3>}
                        {(exp.location || exp.startDate || exp.endDate) && <p className="text-gray-600 text-sm italic break-words print-text-sm print-italic print-text-black">{exp.location}{exp.location && (exp.startDate || exp.endDate) && " | "}{exp.startDate}{exp.startDate && exp.endDate && " - "}{exp.endDate}</p>}
                        {exp.description && exp.description.some(d => d) && (
                            <ul className="list-disc list-inside text-gray-700 mt-1 print-list-disc print-p print-text-black">
                                {exp.description.filter(desc => desc).map((desc, descIndex) => {
                                    return <li key={descIndex} className="break-words">{desc}</li>;
                                })}
                            </ul>
                        )}
                    </div>
                ))}
            </section>
        )}

        {/* Education */}
        {resumeData.education.some(edu => edu.degree || edu.institution || edu.location || edu.graduationDate || edu.percentage || edu.gpa) && (
            <section className="print-bg-white">
                <h2 className="text-2xl font-bold border-b-2 border-black pb-3 mb-4 print-section-header print-h2" style={{ color: selectedColor || '#000000' }}>Education</h2>
                {resumeData.education.filter(edu => edu.degree || edu.institution || edu.location || edu.graduationDate || edu.percentage || edu.gpa).map((edu) => (
                    <div key={edu.id} className="mb-4">
                        {edu.degree && <h3 className="text-lg font-semibold text-black break-words print-h3">{edu.degree}</h3>}
                        {(edu.institution || edu.location) && <p className="text-gray-700 break-words print-p print-text-black">{edu.institution}{edu.institution && edu.location && ", "}{edu.location}</p>}
                        {(edu.graduationDate || edu.percentage || edu.gpa) && (
                            <p className="text-gray-600 text-sm italic break-words print-text-sm print-italic print-text-black">
                                {edu.graduationDate} {(edu.graduationDate && (edu.percentage || edu.gpa)) && `| `}
                                {edu.percentage && `Percentage: ${edu.percentage}`} {(edu.percentage && edu.gpa) && `| `}
                                {edu.gpa && `GPA: ${edu.gpa}`}
                            </p>
                        )}
                    </div>
                ))}
            </section>
        )}

        {/* Skills */}
        {resumeData.skills.some(skill => skill.trim()) && (
            <section className="print-bg-white">
                <h2 className="text-2xl font-bold border-b-2 border-black pb-3 mb-4 print-section-header print-h2" style={{ color: selectedColor || '#000000' }}>Skills</h2>
                <p className="text-gray-700 break-words print-p print-text-black">{resumeData.skills.filter(s => s.trim()).join(' | ')}</p>
            </section>
        )}

        {/* Projects */}
        {resumeData.projects.some(proj => proj.name || proj.description || proj.link) && (
            <section className="print-bg-white">
                <h2 className="text-2xl font-bold border-b-2 border-black pb-3 mb-4 print-section-header print-h2" style={{ color: selectedColor || '#000000' }}>Projects</h2>
                {resumeData.projects.filter(proj => proj.name || proj.description || proj.link).map((proj) => (
                    <div key={proj.id} className="mb-4">
                        {proj.name && <h3 className="text-lg font-semibold text-black break-words print-h3">{proj.name}</h3>}
                        {proj.description && <p className="text-gray-700 leading-relaxed break-words print-p print-text-black">{proj.description}</p>}
                        {proj.link && (
                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words print-p">
                                {proj.link}
                            </a>
                        )}
                    </div>
                ))}
            </section>
        )}

        {/* Certifications */}
        {resumeData.certifications.some(cert => cert.trim()) && (
            <section className="print-bg-white">
                <h2 className="text-2xl font-bold border-b-2 border-black pb-3 mb-4 print-section-header print-h2" style={{ color: selectedColor || '#000000' }}>Certifications</h2>
                <p className="text-gray-700 break-words print-p print-text-black">{resumeData.certifications.filter(c => c.trim()).join(' | ')}</p>
            </section>
        )}

        {/* Languages */}
        {resumeData.languages.some(lang => lang.trim()) && (
            <section className="print-bg-white">
                <h2 className="text-2xl font-bold border-b-2 border-black pb-3 mb-4 print-section-header print-h2" style={{ color: selectedColor || '#000000' }}>Languages</h2>
                <p className="text-sm text-gray-700 break-words print:text-[9.5pt]">{resumeData.languages.filter(l => l.trim()).join(', ')}</p>
            </section>
        )}
    </div>
);

// Modern Minimalist Template (Styled to match Sakthi's CV)
const ModernMinimalistTemplate = ({ resumeData, selectedColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-2 text-gray-800 font-serif">
        <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            @media print {
                html, body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box; /* Ensures padding/border are included in element's total width/height */
                    width: 210mm; /* A4 width */
                    height: 297mm; /* A4 height */
                    overflow: hidden;
                    font-family: 'Inter', sans-serif !important; /* Ensure font is applied for print */
                }
                .print\\:shadow-none { box-shadow: none !important; }
                /* Adjusted print font sizes and spacing for a more compact, professional look */
                .print\\:text-\\[9px\\] { font-size: 9px !important; }
                .print\\:text-\\[9.5pt\\] { font-size: 9.5pt !important; }
                .print\\:text-\\[11pt\\] { font-size: 11pt !important; }
                .print\\:text-\\[13pt\\] { font-size: 13pt !important; }
                .print\\:text-\\[20pt\\] { font-size: 20pt !important; }
                .print\\:leading-tight { line-height: 1.25 !important; }
                .print\\:gap-x-1 { column-gap: 4px !important; }
                .print\\:ml-2 { margin-left: 8px !important; }

                /* Specific adjustments for sections within modern template */
                .modern-resume-container {
                    padding: 10mm 15mm; /* More balanced padding for A4 */
                    font-size: 10pt; /* Overall base font size for print */
                    line-height: 1.3; /* Adjusted line height for print */
                }

                .modern-resume-container h1 {
                    font-size: 20pt; /* Name size */
                    margin-bottom: 2mm;
                    color: #000000 !important; /* Black heading for print */
                    font-weight: bold !important; /* Ensure bold for print */
                }

                .modern-resume-container .header-contact {
                    font-size: 9pt;
                    margin-bottom: 5mm;
                }

                .modern-resume-container section h2 {
                    font-size: 13pt; /* Section title size */
                    border-bottom: 2px solid #000000; /* Changed border color to black for print */
                    padding-bottom: 2mm; /* Increased padding-bottom for print */
                    margin-top: 5mm; /* Space before heading */
                    margin-bottom: 4mm; /* Increased margin-bottom for print */
                    color: #000000 !important; /* Black heading for print */
                    font-weight: bold !important; /* Ensure bold for print */
                }

                .modern-resume-container section p {
                    font-size: 9.5pt; /* Paragraph text size */
                    line-height: 1.3;
                    margin-bottom: 1.5mm; /* Slightly more space for paragraphs */
                    word-wrap: break-word; /* Ensure words break for long text */
                    overflow-wrap: break-word;
                    font-weight: normal !important; /* Ensure normal font weight for body text in print */
                }

                .modern-resume-container section h3 {
                    font-size: 11pt; /* Sub-heading size */
                    margin-bottom: 1mm;
                    color: #000000 !important; /* Black heading for print */
                    font-weight: bold !important; /* Ensure bold for print */
                }

                .modern-resume-container section ul {
                    margin-top: 0.5mm;
                    margin-left: 5mm; /* Adjust bullet indentation */
                }

                .modern-resume-container section ul li {
                    font-size: 9.5pt; /* Bullet point text size */
                    line-height: 1.3;
                    margin-bottom: 0.5mm;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    font-weight: normal !important; /* Ensure normal font weight for list items in print */
                }

                .modern-resume-container a {
                    font-size: 9pt; /* Link font size */
                }
            }
            `}
        </style>
        <div className="modern-resume-container">
            {/* Header Section */}
            {(resumeData.personalDetails.name || resumeData.personalDetails.email || resumeData.personalDetails.phone || resumeData.personalDetails.linkedin || resumeData.personalDetails.github || resumeData.personalDetails.portfolio || resumeData.personalDetails.location || resumeData.personalDetails.title) && (
                <div className="text-center pb-4 mb-4">
                    {resumeData.personalDetails.name && <h1 className="text-3xl font-bold text-black mb-0.5 leading-tight print:text-[20pt]">{resumeData.personalDetails.name}</h1>}
                    <div className="text-sm text-gray-700 flex flex-wrap justify-center gap-x-2 leading-tight header-contact print:text-[9pt] print:gap-x-1">
                        {resumeData.personalDetails.email && <span className="break-words">{resumeData.personalDetails.email} | </span>}
                        {resumeData.personalDetails.phone && <span>{resumeData.personalDetails.phone}</span>}
                        {resumeData.personalDetails.linkedin && (
                            <a href={resumeData.personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline break-words">
                                LinkedIn
                            </a>
                        )}
                        {resumeData.personalDetails.github && (resumeData.personalDetails.linkedin || resumeData.personalDetails.phone || resumeData.personalDetails.email) && <span className="mx-0.5">|</span>}
                        {resumeData.personalDetails.github && (
                            <a href={resumeData.personalDetails.github} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline break-words">
                                GitHub
                            </a>
                        )}
                        {resumeData.personalDetails.portfolio && (resumeData.personalDetails.linkedin || resumeData.personalDetails.github || resumeData.personalDetails.phone || resumeData.personalDetails.email) && <span className="mx-0.5">|</span>}
                        {resumeData.personalDetails.portfolio && (
                            <a href={resumeData.personalDetails.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline break-words">
                                Portfolio
                            </a>
                        )}
                        {resumeData.personalDetails.location && <span className="ml-0.5">| {resumeData.personalDetails.location}</span>}
                    </div>
                </div>
            )}

            {/* Summary */}
            {resumeData.summary && (
                <section className="w-full">
                    <h2 className="text-xl font-bold border-b-2 border-black pb-1.5 mb-3 uppercase pt-1 mt-6 print:text-[13pt]" style={{ color: selectedColor || '#000000' }}>Summary</h2>
                    <p className="text-sm text-gray-700 leading-snug break-words print:text-[9.5pt]">{resumeData.summary}</p>
                </section>
            )}

            {/* Experience */}
            {resumeData.experience.some(exp => exp.title || exp.company || exp.location || exp.startDate || exp.endDate || (exp.description && exp.description.some(d => d))) && (
                <section className="w-full">
                    <h2 className="text-xl font-bold border-b-2 border-black pb-1.5 mb-3 uppercase pt-1 mt-6 print:text-[13pt]" style={{ color: selectedColor || '#000000' }}>Experience</h2>
                    {resumeData.experience.filter(exp => exp.title || exp.company || exp.location || exp.startDate || exp.endDate || (exp.description && exp.description.some(d => d))).map((exp) => (
                        <div key={exp.id} className="mb-1">
                            {(exp.title || exp.company) && <h3 className="text-sm font-bold text-black break-words print:text-[11pt]">{exp.title}{exp.title && exp.company && " - "}{exp.company}</h3>}
                            {(exp.location || exp.startDate || exp.endDate) && <p className="text-xs text-gray-700 italic leading-snug break-words print:text-[9.5pt]">{exp.location}{exp.location && (exp.startDate || exp.endDate) && " | "}{exp.startDate}{exp.startDate && exp.endDate && " - "}{exp.endDate}</p>}
                            {exp.description && exp.description.some(d => d) && (
                                <ul className="list-disc list-inside text-gray-700 text-xs mt-0.5 pl-4 print:text-[9.5pt] print:ml-2">
                                    {exp.description.filter(desc => desc).map((desc, descIndex) => {
                                        return <li key={descIndex} className="break-words">{desc}</li>;
                                    })}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Education */}
            {resumeData.education.some(edu => edu.degree || edu.institution || edu.location || edu.graduationDate || edu.percentage || edu.gpa) && (
                <section className="w-full">
                    <h2 className="text-xl font-bold border-b-2 border-black pb-1.5 mb-3 uppercase pt-1 mt-6 print:text-[13pt]" style={{ color: selectedColor || '#000000' }}>Education</h2>
                    {resumeData.education.filter(edu => edu.degree || edu.institution || edu.location || edu.graduationDate || edu.percentage || edu.gpa).map((edu) => (
                        <div key={edu.id} className="mb-1">
                            {edu.degree && <h3 className="text-sm font-bold text-black break-words print:text-[11pt]">{edu.degree}</h3>}
                            {(edu.institution || edu.location) && <p className="text-xs text-gray-700 leading-snug break-words print:text-[9.5pt]">{edu.institution}{edu.institution && edu.location && ", "}{edu.location}</p>}
                            {(edu.graduationDate || edu.percentage || edu.gpa) && (
                                <p className="text-xs text-gray-600 italic break-words print:text-[9.5pt]">
                                    {edu.graduationDate} {(edu.graduationDate && (edu.percentage || edu.gpa)) && `| `}
                                    {edu.percentage && `Percentage: ${edu.percentage}`} {(edu.percentage && edu.gpa) && `| `}
                                    {edu.gpa && `GPA: ${edu.gpa}`}
                                </p>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Skills */}
            {resumeData.skills.some(skill => skill.trim()) && (
                <section className="w-full">
                    <h2 className="text-xl font-bold border-b-2 border-black pb-1.5 mb-3 uppercase pt-1 mt-6 print:text-[13pt]" style={{ color: selectedColor || '#000000' }}>Skills</h2>
                    <p className="text-sm text-gray-700 break-words print:text-[9.5pt]">{resumeData.skills.filter(s => s.trim()).join(' | ')}</p>
                </section>
            )}

            {/* Projects */}
            {resumeData.projects.some(proj => proj.name || proj.description || proj.link) && (
                <section className="w-full">
                    <h2 className="text-xl font-bold border-b-2 border-black pb-1.5 mb-3 uppercase pt-1 mt-6 print:text-[13pt]" style={{ color: selectedColor || '#000000' }}>Projects</h2>
                    {resumeData.projects.filter(proj => proj.name || proj.description || proj.link).map((proj) => (
                        <div key={proj.id} className="mb-1">
                            {proj.name && <h3 className="text-sm font-bold text-black break-words print:text-[11pt]">{proj.name}</h3>}
                            {proj.description && <p className="text-xs text-gray-700 leading-snug break-words print:text-[9.5pt]">{proj.description}</p>}
                            {proj.link && (
                                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline text-xs break-words print:text-[9pt]">
                                    {proj.link}
                                </a>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Certifications */}
            {resumeData.certifications.some(cert => cert.trim()) && (
                <section className="w-full">
                    <h2 className="text-xl font-bold border-b-2 border-black pb-1.5 mb-3 uppercase pt-1 mt-6 print:text-[13pt]" style={{ color: selectedColor || '#000000' }}>Certifications</h2>
                    <p className="text-sm text-gray-700 break-words print:text-[9.5pt]">{resumeData.certifications.filter(c => c.trim()).join(' | ')}</p>
                </section>
            )}

            {/* Languages */}
            {resumeData.languages.some(lang => lang.trim()) && (
                <section className="w-full">
                    <h2 className="text-xl font-bold border-b-2 border-black pb-1.5 mb-3 uppercase pt-1 mt-6 print:text-[13pt]" style={{ color: selectedColor || '#000000' }}>Languages</h2>
                    <p className="text-sm text-gray-700 break-words print:text-[9.5pt]">{resumeData.languages.filter(l => l.trim()).join(', ')}</p>
                </section>
            )}
        </div>
    </div>
);

// Profile Template Component (now Beam Template)
const BeamTemplate = ({ resumeData, selectedColor }) => (
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-xl overflow-hidden min-h-[1123px] max-w-[794px] mx-auto text-gray-800 print:shadow-none print:max-w-none print:min-h-a4 print:w-a4 print:h-a4">
        <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            @media print {
                html, body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    width: 210mm; /* A4 width */
                    height: 297mm; /* A4 height */
                    overflow: hidden;
                    font-family: 'Inter', sans-serif !important;
                    color: #000;
                }
                .print\\:shadow-none { box-shadow: none !important; }
                .print\\:max-w-none { max-width: none !important; }
                .print\\:min-h-a4 { min-height: 297mm !important; }
                .print\\:w-a4 { width: 210mm !important; }
                .print\\:h-a4 { height: 297mm !important; }

                .print-profile-sidebar {
                    width: 60mm !important; /* Approx 1/4 of A4 */
                    padding: 10mm !important;
                    box-sizing: border-box;
                }
                .print-profile-main-content {
                    width: 150mm !important; /* Approx 3/4 of A4 */
                    padding: 10mm !important;
                    box-sizing: border-box;
                }

                .profile-print-h1 { font-size: 20pt !important; margin-bottom: 2pt !important; color: #000000 !important; }
                .profile-print-h2 { font-size: 11pt !important; margin-bottom: 5pt !important; color: #000000 !important; }
                .profile-print-h3 { font-size: 10pt !important; margin-bottom: 3pt !important; color: #000000 !important; }
                .profile-print-h4 { font-size: 9pt !important; margin-bottom: 2pt !important; color: #000000 !important; }

                .profile-print-p, .profile-print-li, .profile-print-text-sm {
                    font-size: 8pt !important;
                    line-height: 1.4 !important;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    color: #000000 !important;
                }
                .profile-print-list-disc { list-style-type: disc !important; margin-left: 3mm !important; }
                .profile-print-list-decimal { list-style-type: decimal !important; margin-left: 3mm !important; }

                .profile-print-section-divider {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.4) !important;
                    margin-bottom: 8pt !important;
                }
                .profile-print-main-divider {
                    border-bottom: 1px solid #e0e0e0 !important;
                    margin-bottom: 8pt !important;
                }
            }
            `}
        </style>
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 bg-[#112d4e] text-white p-8 space-y-6 flex flex-col justify-start items-center print-profile-sidebar">
            {/* Profile Image */}
            {resumeData.personalDetails.profileImage && (
                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    <img
                        src={resumeData.personalDetails.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/128x128/eeeeee/333333?text=Error"; }}
                    />
                </div>
            )}

            {/* Contact */}
            {(resumeData.personalDetails.phone || resumeData.personalDetails.email || resumeData.personalDetails.location || resumeData.personalDetails.portfolio) && (
                <div className="w-full text-center md:text-left">
                    <h3 className="text-xl font-semibold mb-2 print:text-[12pt]" style={{ color: selectedColor === '#112d4e' ? '#FFFFFF' : (selectedColor || '#FFFFFF') }}>CONTACT</h3>
                    <div className="h-0.5 bg-white bg-opacity-40 w-full mb-4 print-profile-section-divider"></div>
                    {resumeData.personalDetails.phone && <p className="text-sm mb-1 break-words print:text-[9pt]">{resumeData.personalDetails.phone}</p>}
                    {resumeData.personalDetails.email && <p className="text-sm mb-1 break-words print:text-[9pt]">{resumeData.personalDetails.email}</p>}
                    {resumeData.personalDetails.location && <p className="text-sm mb-1 break-words print:text-[9pt]">{resumeData.personalDetails.location}</p>}
                    {resumeData.personalDetails.portfolio && (
                        <p className="text-sm break-words print:text-[9pt]">
                            <a href={resumeData.personalDetails.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:underline">
                                {resumeData.personalDetails.portfolio}
                            </a>
                        </p>
                    )}
                </div>
            )}

            {/* Education */}
            {resumeData.education.some(edu => edu.degree || edu.institution || edu.location || edu.graduationDate || edu.percentage || edu.gpa) && (
                <div className="w-full text-center md:text-left">
                    <h3 className="text-xl font-semibold mb-2 print:text-[12pt]" style={{ color: selectedColor === '#112d4e' ? '#FFFFFF' : (selectedColor || '#FFFFFF') }}>EDUCATION</h3>
                    <div className="h-0.5 bg-white bg-opacity-40 w-full mb-4 print-profile-section-divider"></div>
                    {resumeData.education.filter(edu => edu.degree || edu.institution || edu.location || edu.graduationDate || edu.percentage || edu.gpa).map((edu, index) => (
                        <div key={index} className="mb-3">
                            {edu.graduationDate && <p className="text-sm font-semibold print:text-[9pt]">{edu.graduationDate}</p>}
                            {edu.institution && <p className="text-base font-bold print:text-[10pt]">{edu.institution}</p>}
                            {edu.degree && <p className="text-sm break-words print:text-[9pt]">{edu.degree}</p>}
                            {edu.percentage && <p className="text-sm break-words print:text-[9pt]">Percentage: {edu.percentage}</p>}
                            {edu.gpa && <p className="text-sm break-words print:text-[9pt]">GPA: {edu.gpa}</p>}
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {resumeData.skills.some(skill => skill.trim()) && (
                <div className="w-full text-center md:text-left">
                    <h3 className="text-xl font-semibold mb-2 print:text-[12pt]" style={{ color: selectedColor === '#112d4e' ? '#FFFFFF' : (selectedColor || '#FFFFFF') }}>SKILLS</h3>
                    <div className="h-0.5 bg-white bg-opacity-40 w-full mb-4 print-profile-section-divider"></div>
                    <ul className="list-none text-sm space-y-1 pl-0 break-words print:text-[9pt]">
                        {resumeData.skills.filter(s => s.trim()).map((skill, index) => (
                            <li key={index}>&bull; {skill}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Languages */}
            {resumeData.languages.some(lang => lang.trim()) && (
                <div className="w-full text-center md:text-left">
                    <h3 className="text-xl font-semibold mb-2 print:text-[12pt]" style={{ color: selectedColor === '#112d4e' ? '#FFFFFF' : (selectedColor || '#FFFFFF') }}>LANGUAGES</h3>
                    <div className="h-0.5 bg-white bg-opacity-40 w-full mb-4 print-profile-section-divider"></div>
                    <ul className="list-none text-sm space-y-1 pl-0 break-words print:text-[9pt]">
                        {resumeData.languages.filter(l => l.trim()).map((lang, index) => (
                            <li key={index}>&bull; {lang}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        {/* Right Main Content */}
        <div className="w-full md:w-2/3 p-8 space-y-6 print-profile-main-content">
            {/* Name and Title */}
            {(resumeData.personalDetails.name || resumeData.personalDetails.title) && (
                <div className="pb-6 border-b border-gray-300 mb-6 print-profile-main-divider">
                    {resumeData.personalDetails.name && <h1 className="text-4xl font-extrabold uppercase mb-1 print-profile-h1" style={{ color: selectedColor || '#000000' }}>{resumeData.personalDetails.name}</h1>}
                    {resumeData.personalDetails.title && <p className="text-xl font-semibold text-gray-600 uppercase print-profile-h2">{resumeData.personalDetails.title}</p>}
                </div>
            )}

            {/* Profile / Summary */}
            {resumeData.summary && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 uppercase print-profile-h3" style={{ color: selectedColor || '#000000' }}>PROFILE</h2>
                    <p className="text-gray-700 leading-relaxed break-words print-profile-p">{resumeData.summary}</p>
                </section>
            )}

            {/* Work Experience */}
            {resumeData.experience.some(exp => exp.title || exp.company || exp.location || exp.startDate || exp.endDate || (exp.description && exp.description.some(d => d))) && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 uppercase print-profile-h3" style={{ color: selectedColor || '#000000' }}>WORK EXPERIENCE</h2>
                    {resumeData.experience.filter(exp => exp.title || exp.company || exp.location || exp.startDate || exp.endDate || (exp.description && exp.description.some(d => d))).map((exp, index) => (
                        <div key={index} className="mb-4">
                            {(exp.title || exp.company) && <h3 className="text-lg font-semibold text-gray-800 break-words print-profile-h4">{exp.company}{exp.company && exp.title && " - "}{exp.title}</h3>}
                            {(exp.startDate || exp.endDate || exp.location) && <p className="text-sm italic text-gray-600 mb-2 break-words print-profile-text-sm">{exp.startDate}{exp.startDate && exp.endDate && " - "}{exp.endDate}{exp.location && ` | ${exp.location}`}</p>}
                            {exp.description && exp.description.some(d => d) && (
                                <ul className="list-disc list-inside text-gray-700 space-y-1 pl-4 break-words print-profile-list-disc">
                                    {exp.description.filter(desc => desc).map((desc, descIndex) => (
                                        <li key={descIndex}>{desc}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Projects */}
            {resumeData.projects.some(proj => proj.name || proj.description || proj.link) && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 uppercase print-profile-h3" style={{ color: selectedColor || '#000000' }}>PROJECTS</h2>
                    {resumeData.projects.filter(proj => proj.name || proj.description || proj.link).map((proj, index) => (
                        <div key={index} className="mb-4">
                            {proj.name && <h3 className="text-lg font-semibold text-gray-800 break-words print-profile-h4">{proj.name}</h3>}
                            {proj.link && (
                                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline text-sm break-words print-profile-text-sm">
                                    (Link)
                                </a>
                            )}
                            {proj.description && <p className="text-gray-700 leading-relaxed break-words print-profile-p">{proj.description}</p>}
                        </div>
                    ))}
                </section>
            )}

            {/* Certifications - Can be merged or added separately */}
            {resumeData.certifications.some(cert => cert.trim()) && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 uppercase print-profile-h3" style={{ color: selectedColor || '#000000' }}>CERTIFICATIONS</h2>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 break-words print-profile-list-disc">
                        {resumeData.certifications.filter(c => c.trim()).map((cert, index) => (
                            <li key={index}>{cert}</li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    </div>
);

// Professional Template Component (formerly Student Template)
const ProfessionalTemplate = ({ resumeData, selectedColor }) => (
    <div className="bg-white p-8 rounded-xl shadow-md space-y-4 font-inter text-gray-800 print:shadow-none print:p-6 print:w-a4 print:h-a4 print:overflow-hidden">
        <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            @media print {
                html, body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    width: 210mm; /* A4 width */
                    height: 297mm; /* A4 height */
                    overflow: hidden;
                    font-family: 'Inter', sans-serif !important;
                    color: #000;
                }
                .print\\:shadow-none { box-shadow: none !important; }
                .print\\:p-6 { padding: 15mm !important; }
                .print\\:w-a4 { width: 210mm !important; }
                .print\\:h-a4 { height: 297mm !important; }
                .print\\:overflow-hidden { overflow: hidden !important; }

                .student-print-h1 { font-size: 24pt !important; margin-bottom: 2pt !important; color: #000000 !important; }
                .student-print-h2 { font-size: 16pt !important; border-bottom: 1.5pt solid #4a4a4a !important; padding-bottom: 4pt !important; margin-top: 16pt !important; margin-bottom: 8pt !important; color: #000000 !important; }
                .student-print-h3 { font-size: 12pt !important; margin-bottom: 3pt !important; color: #000000 !important; }
                .student-print-p, .student-print-li {
                    font-size: 10pt !important;
                    line-height: 1.5 !important;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    color: #000000 !important;
                }
                .student-print-list-disc { list-style-type: disc !important; margin-left: 5mm !important; }
                .student-print-text-blue { color: #0000FF !important; } /* Ensure blue for print */
                .student-print-text-gray-600 { color: #4a4a4a !important; }
            }
            `}
        </style>
        {/* Header */}
        {(resumeData.personalDetails.name || resumeData.personalDetails.title || resumeData.personalDetails.email || resumeData.personalDetails.phone || resumeData.personalDetails.location) && (
            <div className="text-center mb-6">
                {resumeData.personalDetails.name && <h1 className="text-4xl font-extrabold text-gray-900 mb-1 student-print-h1">{resumeData.personalDetails.name}</h1>}
                {resumeData.personalDetails.title && <p className="text-xl font-semibold text-gray-700 mb-2 student-print-h2">{resumeData.personalDetails.title}</p>}
                {(resumeData.personalDetails.email || resumeData.personalDetails.phone || resumeData.personalDetails.location) && (
                    <p className="text-md text-gray-600 student-print-text-gray-600">
                        {resumeData.personalDetails.email && <span className="mr-4 break-words">{resumeData.personalDetails.email}</span>}
                        {resumeData.personalDetails.phone && <span className="mr-4 break-words">{resumeData.personalDetails.phone}</span>}
                        {resumeData.personalDetails.location && <span className="break-words">{resumeData.personalDetails.location}</span>}
                    </p>
                )}
            </div>
        )}

        {/* Work Experience */}
        {resumeData.experience.some(exp => exp.title || exp.company || exp.location || exp.startDate || exp.endDate || (exp.description && exp.description.some(d => d))) && (
            <section className="mb-6">
                <h2 className="text-2xl font-bold border-b-2 pb-2 mb-4 uppercase student-print-h2 student-print-text-blue" style={{ color: selectedColor || '#000000', borderColor: selectedColor || '#000000' }}>WORK EXPERIENCE</h2>
                {resumeData.experience.filter(exp => exp.title || exp.company || exp.location || exp.startDate || exp.endDate || (exp.description && exp.description.some(d => d))).map((exp, index) => (
                    <div key={index} className="mb-4">
                        <div className="flex justify-between items-baseline">
                            {(exp.title || exp.company) && <h3 className="text-lg font-bold text-gray-900 student-print-h3">{exp.title}{exp.title && exp.company && " - "}{exp.company}</h3>}
                            {exp.endDate && <span className="text-sm text-gray-600 student-print-text-gray-600">{exp.endDate}</span>}
                        </div>
                        {exp.location && <p className="text-sm italic text-gray-600 mb-2 student-print-text-gray-600">{exp.location}</p>}
                        {exp.description && exp.description.some(d => d) && (
                            <ul className="list-disc list-inside text-gray-700 space-y-1 pl-4 student-print-list-disc student-print-p">
                                {exp.description.filter(desc => desc).map((desc, descIndex) => (
                                    <li key={descIndex}>{desc}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </section>
        )}

        {/* Projects */}
        {resumeData.projects.some(proj => proj.name || proj.description || proj.link) && (
            <section className="mb-6">
                <h2 className="text-2xl font-bold border-b-2 pb-2 mb-4 uppercase student-print-h2 student-print-text-blue" style={{ color: selectedColor || '#000000', borderColor: selectedColor || '#000000' }}>PROJECTS</h2>
                {resumeData.projects.filter(proj => proj.name || proj.description || proj.link).map((proj, index) => (
                    <div key={index} className="mb-4">
                        <div className="flex justify-between items-baseline">
                            {proj.name && <h3 className="text-lg font-bold text-gray-900 student-print-h3">{proj.name}</h3>}
                            {proj.link && (proj.link.includes('20')) ? <span className="text-sm text-gray-600 student-print-text-gray-600">{proj.link.match(/20\d{2}/)[0]}</span> : null}
                        </div>
                        {proj.description && <p className="text-gray-700 leading-relaxed student-print-p">{proj.description}</p>}
                    </div>
                ))}
            </section>
        )}

        {/* Education */}
        {resumeData.education.some(edu => edu.degree || edu.institution || edu.location || edu.graduationDate || edu.percentage || edu.gpa) && (
            <section className="mb-6">
                <h2 className="text-2xl font-bold border-b-2 pb-2 mb-4 uppercase student-print-h2 student-print-text-blue" style={{ color: selectedColor || '#000000', borderColor: selectedColor || '#000000' }}>EDUCATION</h2>
                {resumeData.education.filter(edu => edu.degree || edu.institution || edu.location || edu.graduationDate || edu.percentage || edu.gpa).map((edu, index) => (
                    <div key={index} className="mb-4">
                        <div className="flex justify-between items-baseline">
                            {edu.institution && <h3 className="text-lg font-bold text-gray-900 student-print-h3">{edu.institution}</h3>}
                            {edu.graduationDate && <span className="text-sm text-gray-600 student-print-text-gray-600">{edu.graduationDate}</span>}
                        </div>
                        {(edu.degree || edu.location || edu.percentage || edu.gpa) && (
                            <p className="text-md text-gray-700 student-print-p">
                                {edu.degree}{edu.degree && edu.location && `, ${edu.location}`}
                                {edu.percentage && <span className="ml-2">| Percentage: {edu.percentage}</span>}
                                {edu.gpa && <span className="ml-2">| GPA: {edu.gpa}</span>}
                            </p>
                        )}
                    </div>
                ))}
            </section>
        )}

        {/* Skills */}
        {resumeData.skills.some(skill => skill.trim()) && (
            <section>
                <h2 className="text-2xl font-bold border-b-2 pb-2 mb-4 uppercase student-print-h2 student-print-text-blue" style={{ color: selectedColor || '#000000', borderColor: selectedColor || '#000000' }}>SKILLS</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 pl-4 student-print-list-disc student-print-p">
                    {resumeData.skills.filter(s => s.trim()).map((skill, index) => (
                        <li key={index}>{skill}</li>
                    ))}
                </ul>
            </section>
        )}

        {/* Certifications */}
        {resumeData.certifications.some(cert => cert.trim()) && (
            <section>
                <h2 className="text-2xl font-bold border-b-2 pb-2 mb-4 uppercase student-print-h2 student-print-text-blue" style={{ color: selectedColor || '#000000', borderColor: selectedColor || '#000000' }}>CERTIFICATIONS</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 pl-4 student-print-list-disc student-print-p">
                    {resumeData.certifications.filter(c => c.trim()).map((cert, index) => (
                        <li key={index}>{cert}</li>
                    ))}
                </ul>
            </section>
        )}

        {/* Languages */}
        {resumeData.languages.some(lang => lang.trim()) && (
            <section>
                <h2 className="text-2xl font-bold border-b-2 pb-2 mb-4 uppercase student-print-h2 student-print-text-blue" style={{ color: selectedColor || '#000000', borderColor: selectedColor || '#000000' }}>LANGUAGES</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 pl-4 student-print-list-disc student-print-p">
                    {resumeData.languages.filter(l => l.trim()).map((lang, index) => (
                        <li key={index}>{lang}</li>
                    ))}
                </ul>
            </section>
        )}
    </div>
);


// Map of available templates
const TEMPLATES = {
    'classic': ClassicTemplate,
    'modern': ModernMinimalistTemplate,
    'beam': BeamTemplate,
    'professional': ProfessionalTemplate,
};

// Main ResumePreview component that renders the selected template
const ResumePreview = ({ resumeData, resumePreviewRef, selectedTemplate, selectedColor }) => {
    const SelectedTemplateComponent = TEMPLATES[selectedTemplate];

    return (
        <div
            ref={resumePreviewRef}
            id="print-area"
            style={{
                width: '100%',
                maxWidth: '794px',
                minHeight: '1123px',
                backgroundColor: 'transparent',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                fontFamily: "'Inter', sans-serif",
                margin: 'auto',
                color: '#111827',
            }}
        >
            <div className="resume-container">
                {SelectedTemplateComponent ? (
                    <SelectedTemplateComponent resumeData={resumeData} selectedColor={selectedColor} />
                ) : (
                    <p className="text-center text-gray-500">Select a template to preview your resume.</p>
                )}
            </div>
        </div>
    );
};


function App() {
    const resumePreviewRef = useRef(null);
    // eslint-disable-next-line no-unused-vars
    const reportPreviewRef = useRef(null);

    // State to manage Firebase user
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true); // New state for initial auth loading
    const [loadingSave, setLoadingSave] = useState(false); // Declare loadingSave state


    // User ID is now derived from Firebase user.uid
    // eslint-disable-next-line no-unused-vars
    const userId = user ? user.uid : 'anonymous'; // Use 'anonymous' or a temporary ID for unauthenticated state

    // Default empty state for resume data. This will be the starting point for every new session.
    // Wrapped in useMemo to prevent unnecessary recreation
    const emptyResumeData = useMemo(() => ({
        personalDetails: {
            name: '',
            email: '',
            phone: '',
            linkedin: '',
            github: '',
            portfolio: '',
            location: '',
            title: '',
            profileImage: '',
        },
        summary: '',
        experience: [{ id: uuidv4(), title: '', company: '', location: '', startDate: '', endDate: '', description: [''] }],
        education: [{ id: uuidv4(), degree: '', institution: '', location: '', graduationDate: '', gpa: '', percentage: '' }],
        skills: [''],
        projects: [{ id: uuidv4(), name: '', description: '', link: '' }],
        certifications: [''],
        languages: [''],
    }), []); // Empty dependency array ensures it's created once


    const [resumeData, setResumeData] = useState(emptyResumeData);
    const [userResumes, setUserResumes] = useState([]); // To store a list of user's saved resumes
    const [editingResumeId, setEditingResumeId] = useState(null); // To track which resume is being edited

    const [aiSuggestions, setAiSuggestions] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [showAiModal, setShowAiModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [activeSection, setActiveSection] = useState('personalDetails');
    const [selectedColor, setSelectedColor] = useState('#000000'); // Default to black

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');


    // Function to fetch all resumes for a given user ID
    // Wrapped in useCallback to prevent unnecessary re-creation and potential effect re-runs
    const fetchUserResumes = useCallback(async (currentUserId) => {
        try {
            const idToken = await auth.currentUser.getIdToken(); // Get Firebase ID token
            const response = await fetch(`${API_BASE_URL}/api/resumes/${currentUserId}`, {
                headers: {
                    'Authorization': `Bearer ${idToken}` // Send token in header
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserResumes(data.resumes || []); // Backend should return an array of resumes
                if (data.resumes && data.resumes.length > 0) {
                    // Automatically load the first resume if found
                    const firstResume = data.resumes[0];
                    setResumeData(addIdsToFetchedData(firstResume.resumeData));
                    setEditingResumeId(firstResume._id); // Assuming _id from MongoDB
                } else {
                    setResumeData(emptyResumeData);
                    setEditingResumeId(null);
                }
            } else if (response.status === 404) {
                console.log("No resumes found for this user.");
                setUserResumes([]);
                setResumeData(emptyResumeData);
                setEditingResumeId(null);
            } else {
                console.error("Failed to fetch user resumes:", response.statusText);
                setAuthError("Failed to load your resumes.");
            }
        } catch (error) {
            console.error("Error fetching user resumes:", error);
            setAuthError("An error occurred while loading resumes.");
        }
    }, [emptyResumeData]); // Removed 'auth' dependency, emptyResumeData is now stable

    // Firebase Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
            if (currentUser) {
                // If user logs in, fetch their resumes
                await fetchUserResumes(currentUser.uid);
            } else {
                // If user logs out, clear resumes and reset to empty form
                setUserResumes([]);
                setResumeData(emptyResumeData);
                setEditingResumeId(null);
            }
        });
        return () => unsubscribe(); // Cleanup subscription
    }, [fetchUserResumes, emptyResumeData]); // emptyResumeData is now stable

    const handleSignUp = async () => {
        setAuthError('');
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // User automatically logged in after signup, onAuthStateChanged will handle resume fetching
        } catch (error) {
            setAuthError(error.message);
            console.error("Error signing up:", error);
        }
    };

    const handleSignIn = async () => {
        setAuthError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // User automatically logged in, onAuthStateChanged will handle resume fetching
        } catch (error) {
            setAuthError(error.message);
            console.error("Error signing in:", error);
        }
    };

    const handleGoogleSignIn = async () => {
        setAuthError('');
        try {
            await signInWithPopup(auth, googleProvider);
            // User automatically logged in, onAuthStateChanged will handle resume fetching
        } catch (error) {
            setAuthError(error.message);
            console.error("Error with Google Sign-In:", error);
        }
    };

    const handleSignOut = async () => {
        setAuthError('');
        try {
            await signOut(auth);
            // User state will be cleared by onAuthStateChanged listener
        } catch (error) {
            setAuthError(error.message);
            console.error("Error signing out:", error);
        }
    };

    // Helper to add unique IDs to items from fetched data and ensure at least one empty item
    const addIdsToFetchedData = (data) => {
        const withIds = structuredClone(data); // Deep clone incoming data first

        // Ensure experience always has at least at least one item
        if (!withIds.experience || withIds.experience.length === 0) {
            withIds.experience = [{ id: uuidv4(), title: '', company: '', location: '', startDate: '', endDate: '', description: [''] }];
        } else {
            // If data exists, ensure IDs and default descriptions
            withIds.experience = withIds.experience.map(item => ({ ...item, id: item.id || uuidv4(), description: item.description || [''] }));
        }

        // Ensure education always has at least one item
        if (!withIds.education || withIds.education.length === 0) {
            withIds.education = [{ id: uuidv4(), degree: '', institution: '', location: '', graduationDate: '', gpa: '', percentage: '' }];
        } else {
            withIds.education = withIds.education.map(item => ({ ...item, id: item.id || uuidv4(), gpa: item.gpa || '', percentage: item.percentage || '' }));
        }

        // Ensure projects always has at least one item
        if (!withIds.projects || withIds.projects.length === 0) {
            withIds.projects = [{ id: uuidv4(), name: '', description: '', link: '' }];
        } else {
            withIds.projects = withIds.projects.map(item => ({ ...item, id: item.id || uuidv4() }));
        }

        // For simple string arrays, ensure they are arrays and have at least one empty string if empty
        withIds.skills = withIds.skills && withIds.skills.length > 0 ? withIds.skills : [''];
        withIds.certifications = withIds.certifications && withIds.certifications.length > 0 ? withIds.certifications : [''];
        withIds.languages = withIds.languages && withIds.languages.length > 0 ? withIds.languages : [''];

        return withIds;
    };

    // Refactored handleChange for more robust state updates using item IDs
    const handleChange = (e, section, idOrIndex, field, subIndex = null) => {
        setResumeData(prevData => {
            const newData = structuredClone(prevData); // Deep copy for immutability
            const { name, value } = e.target;

            if (section === 'personalDetails') {
                if (name === 'profileImage') {
                    // Handle file input for profile image
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            newData.personalDetails.profileImage = reader.result; // Store as base64
                            setResumeData(newData); // Set state inside the reader onload
                        };
                        reader.readAsDataURL(file);
                    } else {
                        newData.personalDetails.profileImage = '';
                    }
                } else {
                    newData.personalDetails[name] = value;
                }
            } else if (section === 'summary') {
                newData.summary = value;
            } else if (Array.isArray(newData[section])) {
                if (['experience', 'education', 'projects'].includes(section)) {
                    // Map over the array to create a new array with the updated item
                    newData[section] = newData[section].map(item => {
                        if (item.id === idOrIndex) {
                            // If it's the item to update, create a NEW item object
                            if (field === 'description' && subIndex !== null) {
                                // If updating a description bullet, create a new description array too
                                return {
                                    ...item,
                                    description: (item.description || []).map((desc, i) =>
                                        i === subIndex ? value : desc
                                    )
                                };
                            } else {
                                // Otherwise, update the specific field in the item
                                return { ...item, [field]: value };
                            }
                        }
                        return item; // Return unchanged items as is
                    });
                } else {
                    // For simple string arrays (skills, certifications, languages)
                    // Create a new array to ensure immutability
                    newData[section] = newData[section].map((item, i) =>
                        i === idOrIndex ? value : item
                    );
                }
            }
            return newData;
        });
    };

    const addField = (section, itemUniqueId = null, nestedField = null) => {
        setResumeData(prevData => {
            const newData = structuredClone(prevData);

            if (section === 'experience') {
                newData.experience.push({ id: uuidv4(), title: '', company: '', location: '', startDate: '', endDate: '', description: [''] });
            } else if (section === 'education') {
                newData.education.push({ id: uuidv4(), degree: '', institution: '', location: '', graduationDate: '', gpa: '', percentage: '' });
            } else if (section === 'skills' || section === 'certifications' || section === 'languages') {
                newData[section].push('');
            } else if (section === 'projects') {
                newData.projects.push({ id: uuidv4(), name: '', description: '', link: '' });
            } else if (nestedField === 'description' && itemUniqueId !== null) {
                const experienceItem = newData.experience.find(item => item.id === itemUniqueId);
                if (experienceItem) {
                    if (!experienceItem.description) {
                        experienceItem.description = [];
                    }
                    experienceItem.description.push('');
                }
            }
            return newData;
        });
    };

    const removeField = (section, idOrIndex, nestedField = null, subIndex = null) => {
        setResumeData(prevData => {
            const newData = structuredClone(prevData);

            if (nestedField === 'description' && subIndex !== null) {
                const experienceItem = newData.experience.find(item => item.id === idOrIndex);
                if (experienceItem && experienceItem.description) {
                    experienceItem.description = experienceItem.description.filter((_, i) => i !== subIndex);
                    if (experienceItem.description.length === 0) {
                        experienceItem.description.push('');
                    }
                }
            } else {
                if (['experience', 'education', 'projects'].includes(section)) {
                    newData[section] = newData[section].filter(item => item.id !== idOrIndex);
                } else {
                    newData[section] = newData[section].filter((_, i) => i !== idOrIndex);
                }

                if (newData[section].length === 0) {
                    if (section === 'experience') newData[section].push({ id: uuidv4(), title: '', company: '', location: '', startDate: '', endDate: '', description: [''] });
                    else if (section === 'education') newData[section].push({ id: uuidv4(), degree: '', institution: '', location: '', graduationDate: '', gpa: '', percentage: '' });
                    else if (section === 'projects') newData[section].push({ id: uuidv4(), name: '', description: '', link: '' });
                    else if (section === 'skills' || section === 'certifications' || section === 'languages') newData[section].push('');
                }
            }
            return newData;
        });
    };

    const handleClearCurrentResume = () => {
        setResumeData(emptyResumeData);
        setEditingResumeId(null);
        setSaveMessage('Current resume cleared. Start a new one!');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    // Modified handleSaveResume to handle creation and update based on editingResumeId
    const handleSaveResume = async () => {
        if (!user) {
            setSaveMessage('Please sign in to save your resume.');
            return;
        }

        setLoadingSave(true);
        setSaveMessage('');
        try {
            const idToken = await auth.currentUser.getIdToken(); // Get current user's ID token
            const url = `${API_BASE_URL}/api/resumes`;
            const method = 'POST'; // Always POST, backend will handle upsert

            const payload = {
                userId: user.uid,
                resumeData: resumeData,
                _id: editingResumeId // Include _id if editing an existing resume
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}` // Send token
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.ok) {
                setSaveMessage(data.message);
                if (data.resume && !editingResumeId) { // If new resume was created
                    setEditingResumeId(data.resume._id); // Set the new resume's ID
                }
                // Re-fetch user resumes to update the list
                await fetchUserResumes(user.uid);
            } else {
                setSaveMessage(`Error: ${data.message || 'Failed to save resume'}`);
            }
        } catch (error) {
            console.error('Error saving resume:', error);
            setSaveMessage('An error occurred while saving.');
        } finally {
            setLoadingSave(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const handleDeleteResume = async (resumeIdToDelete) => {
        if (!user) {
            setSaveMessage('Please sign in to delete resumes.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this resume?')) {
            return; // Exit if user cancels
        }

        setLoadingSave(true);
        setSaveMessage('');
        try {
            const idToken = await auth.currentUser.getIdToken();
            const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSaveMessage(data.message);
                if (editingResumeId === resumeIdToDelete) {
                    setResumeData(emptyResumeData); // Clear builder if current resume deleted
                    setEditingResumeId(null);
                }
                await fetchUserResumes(user.uid); // Refresh list
            } else {
                setSaveMessage(`Error: ${data.message || 'Failed to delete resume'}`);
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
            setSaveMessage('An error occurred while deleting.');
        } finally {
            setLoadingSave(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };


    const handleLoadResume = (resumeToLoad) => {
        setResumeData(addIdsToFetchedData(resumeToLoad.resumeData));
        setEditingResumeId(resumeToLoad._id);
        setActiveSection('personalDetails'); // Go to first section after loading
        setSaveMessage(`Resume "${resumeToLoad.resumeData.personalDetails.name || 'Untitled'}" loaded.`);
        setTimeout(() => setSaveMessage(''), 3000);
    };


    const handleDownloadPdf = async () => {
        if (resumePreviewRef.current) {
            const element = resumePreviewRef.current; // The HTML element containing the resume

            const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' for A4 size

            // Use the html method to convert HTML content to PDF
            // This method is designed to preserve text, structure, and clickable links.
            pdf.html(element, {
                callback: function (doc) {
                    // Save the PDF after the HTML content has been rendered
                    doc.save('resume.pdf');
                },
                x: 10, // Left margin in mm
                y: 10, // Top margin in mm
                html2canvas: {
                    scale: 0.7, // Adjust scale to fit the content well within the PDF page
                               // A lower scale makes the content smaller, fitting more.
                               // Experiment with this value (e.g., 0.6 to 0.9) if content is cut off.
                    logging: true, // Enable logging for debugging html2canvas rendering
                    useCORS: true, // Important for images loaded from different origins (like profile image placeholder)
                },
                // The margin option can also be used, or rely on x, y, and html2canvas scaling.
                // When using margin, x and y might be implicitly adjusted.
                margin: [10, 10, 10, 10], // Top, Right, Bottom, Left margins in mm
                autoPaging: 'slice', // Automatically slice content across multiple pages if it overflows
                // pagebreak: { mode: ['css', 'legacy'] }, // Optional: Control page breaks more precisely if needed
            });
        }
    };

    const handleGetAiSuggestions = async () => {
        if (!user) {
            setShowAiModal(true);
            setAiSuggestions('Please sign in to use AI suggestions.');
            return;
        }

        setLoadingAI(true);
        setAiSuggestions('');
        setShowAiModal(true);

        try {
            const resumeText = formatResumeDataForAI(resumeData);
            const idToken = await auth.currentUser.getIdToken(); // Get Firebase ID token

            const response = await fetch(`${API_BASE_URL}/api/ai-suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}` // Send token
                },
                body: JSON.stringify({ resumeText }),
            });
            const data = await response.json();
            if (response.ok) {
                setAiSuggestions(data.suggestions);
            } else {
                setAiSuggestions(`Error: ${data.message || 'Failed to get AI suggestions'}`);
            }
        } catch (error) {
            console.error('Error fetching AI suggestions:', error);
            setAiSuggestions('An error occurred while fetching AI suggestions.');
        } finally {
            setLoadingAI(false);
        }
    };

    const formatResumeDataForAI = (data) => {
        let text = 'Resume Content:\n\n';

        text += 'Personal Details:\n';
        for (const key in data.personalDetails) {
            if (data.personalDetails[key]) {
                text += `  ${key.charAt(0).toUpperCase() + key.slice(1)}: ${data.personalDetails[key]}\n`;
            }
        }
        text += '\n';

        if (data.summary) {
            text += 'Summary:\n';
            text += `  ${data.summary}\n\n`;
        }

        if (data.experience.some(exp => exp.title || exp.company || (exp.description && exp.description.some(d => d))) ){
            text += 'Experience:\n';
            data.experience.forEach(exp => {
                text += `  - ${exp.title || 'N/A'} at ${exp.company || 'N/A'} (${exp.startDate || 'N/A'} - ${exp.endDate || 'N/A'})\n`;
                exp.description.forEach(desc => {
                    if (desc) text += `    - ${desc}\n`;
                });
            });
            text += '\n';
        }

        if (data.education.some(edu => edu.degree || edu.institution)) {
            text += 'Education:\n';
            data.education.forEach(edu => {
                text += `  - ${edu.degree || 'N/A'} from ${edu.institution || 'N/A'} (${edu.graduationDate || 'N/A'})\n`;
            });
            text += '\n';
        }

        if (data.skills.some(skill => skill)) {
            text += 'Skills:\n';
            text += `  ${data.skills.filter(s => s).join(', ')}\n\n`;
        }

        if (data.projects.some(proj => proj.name)) {
            text += 'Projects:\n';
            data.projects.forEach(proj => {
                text += `  - ${proj.name || 'N/A'}: ${proj.description || 'N/A'}\n`;
            });
            text += '\n';
        }

        if (data.certifications.some(cert => cert)) {
            text += 'Certifications:\n';
            text += `  ${data.certifications.filter(c => c).join(', ')}\n\n`;
        }

        if (data.languages.some(lang => lang)) {
            text += 'Languages:\n';
            text += `  ${data.languages.filter(l => l).join(', ')}\n\n`;
        }

        return text;
    };

    // AI Suggestions Modal
    const AISuggestionsModal = ({ suggestions, loading, onClose }) => {
        // Split suggestions by newline and filter out empty lines
        const suggestionLines = suggestions
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Suggestions for Your Resume</h2>
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="ml-3 text-lg text-gray-700">Generating suggestions...</p>
                        </div>
                    ) : (
                        <div className="prose max-w-none">
                            {suggestionLines.length > 0 ? (
                                <ul className="list-disc list-inside text-gray-700 space-y-2">
                                    {suggestionLines.map((line, index) => (
                                        <li key={index} className="break-words">{line.replace(/^- /, '')}</li> // Remove leading dash/bullet if present
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-700">No suggestions available. Please ensure your resume has content.</p>
                            )}
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="mt-6 w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    const colors = [
        '#4285F4', // Google Blue
        '#2C3E50', // Dark Slate Gray (Professional Grey)
        '#1A5276', // Dark Cerulean (Deep Blue)
        '#5D6D7E', // Cadet Grey (Medium Grey)
        '#2ECC71', // Emerald (Professional Green)
        '#E74C3C', // Alizarin (Muted Red)
        '#8E44AD', // Amethyst (Professional Purple)
        '#D35400', // Pumpkin (Muted Orange)
        '#7F8C8D', // Asbestos (Light Grey/Blue)
        '#34495E', // Wet Asphalt (Dark Blue-Grey)
        '#16A085', // Turquoise (Vibrant Green-Blue)
    ];

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-3 text-xl text-gray-700">Loading authentication...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4"
                 style={{
                     backgroundImage: `url("/bg.jpeg")`, // Using PUBLIC_URL for public assets
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     backgroundRepeat: 'no-repeat'
                 }}
            >
                <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-md w-full max-w-md backdrop-filter backdrop-blur-sm">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In / Sign Up</h2>
                    {authError && <p className="text-red-500 text-center mb-4">{authError}</p>}
                    <input
                        type="email"
                        id="email" // Added id
                        name="email" // Added name
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        type="password"
                        id="password" // Added id
                        name="password" // Added name
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md mb-6 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        onClick={handleSignIn}
                        className="w-full bg-blue-700 text-white p-3 rounded-md hover:bg-blue-800 transition duration-200 mb-4 shadow-lg transform hover:scale-105"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={handleSignUp}
                        className="w-full bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-200 mb-6 shadow-lg transform hover:scale-105"
                    >
                        Sign Up
                    </button>
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-600">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full bg-red-700 text-white p-3 rounded-md hover:bg-red-800 transition duration-200 flex items-center justify-center shadow-lg transform hover:scale-105"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5 mr-2" />
                        Sign In with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="font-inter min-h-screen p-4 sm:p-8 relative"
             style={{
                 backgroundImage: `url("/bg.jpeg")`, // Added background image for main page
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat',
                 backgroundAttachment: 'fixed', // Keeps background fixed during scroll
             }}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900">Smart Resume Builder</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-lg text-gray-700">Welcome, {user.email || user.displayName}!</span>
                        <button
                            onClick={handleSignOut}
                            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
                {authError && <p className="text-red-500 text-center mb-4">{authError}</p>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {/* Input Form Column */}
                    <div>
                        <div className="p-6 bg-white rounded-xl shadow-md space-y-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Resume Details</h2>

                            {/* Resume Management */}
                            <div className="mb-6 border-b pb-4 border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-700 mb-3">Your Resumes</h3>
                                {userResumes.length === 0 ? (
                                    <p className="text-gray-600 mb-4">You have no saved resumes. Start by filling the form and clicking "Save Resume".</p>
                                ) : (
                                    <div className="space-y-3">
                                        {userResumes.map(res => (
                                            <div key={res._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md shadow-sm">
                                                <span className="font-medium text-gray-800 flex-1 truncate mr-2">
                                                    {res.resumeData.personalDetails.name || 'Untitled Resume'}
                                                </span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleLoadResume(res)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition duration-200"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteResume(res._id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition duration-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 flex gap-4">
                                    <button onClick={handleSaveResume}
                                        className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
                                        disabled={loadingSave}
                                    >
                                        {loadingSave ? (
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            editingResumeId ? 'Update Current Resume' : 'Save New Resume'
                                        )}
                                    </button>
                                    <button
                                        onClick={handleClearCurrentResume}
                                        className="flex-1 bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition duration-200 shadow-md"
                                    >
                                        Start New Resume
                                    </button>
                                </div>
                            </div>
                            {saveMessage && (
                                <p className="mt-2 text-center text-sm font-medium text-gray-700">{saveMessage}</p>
                            )}

                            {/* Section navigation buttons */}
                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                <button onClick={() => setActiveSection('personalDetails')} className={`px-4 py-2 rounded-md transition duration-200 ${activeSection === 'personalDetails' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                    Personal Info
                                </button>
                                <button onClick={() => setActiveSection('experience')} className={`px-4 py-2 rounded-md transition duration-200 ${activeSection === 'experience' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                    Experience
                                </button>
                                <button onClick={() => setActiveSection('education')} className={`px-4 py-2 rounded-md transition duration-200 ${activeSection === 'education' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                    Education
                                </button>
                                <button onClick={() => setActiveSection('skills')} className={`px-4 py-2 rounded-md transition duration-200 ${activeSection === 'skills' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                    Skills
                                </button>
                                <button onClick={() => setActiveSection('projects')} className={`px-4 py-2 rounded-md transition duration-200 ${activeSection === 'projects' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                    Projects
                                </button>
                                <button onClick={() => setActiveSection('certifications')} className={`px-4 py-2 rounded-md transition duration-200 ${activeSection === 'certifications' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                    Certifications
                                </button>
                                <button onClick={() => setActiveSection('languages')} className={`px-4 py-2 rounded-md transition duration-200 ${activeSection === 'languages' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                                    Languages
                                </button>
                            </div>

                            {/* Conditional Rendering for Sections */}
                            {activeSection === 'personalDetails' && (
                                <section id="personal-details-section">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Personal Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <input
                                                type="text"
                                                name="name"
                                                id="personal-name" // Added id
                                                placeholder="Name"
                                                value={resumeData.personalDetails.name || ''}
                                                onChange={(e) => handleChange(e, 'personalDetails')}
                                                maxLength={100}
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="text-xs text-gray-500 mt-1">Max 100 characters</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <input
                                                type="text"
                                                name="title"
                                                id="personal-title" // Added id
                                                placeholder="Job Title / Designation"
                                                value={resumeData.personalDetails.title || ''}
                                                onChange={(e) => handleChange(e, 'personalDetails')}
                                                maxLength={100}
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="text-xs text-gray-500 mt-1">Max 100 characters</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <input
                                                type="email"
                                                name="email"
                                                id="personal-email" // Added id
                                                placeholder="Email"
                                                value={resumeData.personalDetails.email || ''}
                                                onChange={(e) => handleChange(e, 'personalDetails')}
                                                maxLength={100}
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="text-xs text-gray-500 mt-1">Max 100 characters</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="personal-phone" // Added id
                                                placeholder="Phone"
                                                value={resumeData.personalDetails.phone || ''}
                                                onChange={(e) => handleChange(e, 'personalDetails')}
                                                maxLength={20}
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="text-xs text-gray-500 mt-1">Max 20 characters</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <input
                                                type="url"
                                                name="linkedin"
                                                id="personal-linkedin" // Added id
                                                placeholder="LinkedIn Profile URL"
                                                value={resumeData.personalDetails.linkedin || ''}
                                                onChange={(e) => handleChange(e, 'personalDetails')}
                                                maxLength={200}
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="text-xs text-gray-500 mt-1">Max 200 characters</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <input
                                                type="url"
                                                name="github"
                                                id="personal-github" // Added id
                                                placeholder="GitHub Profile URL"
                                                value={resumeData.personalDetails.github || ''}
                                                onChange={(e) => handleChange(e, 'personalDetails')}
                                                maxLength={200}
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="text-xs text-gray-500 mt-1">Max 200 characters</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <input
                                                type="url"
                                                name="portfolio"
                                                id="personal-portfolio" // Added id
                                                placeholder="Portfolio Website URL"
                                                value={resumeData.personalDetails.portfolio || ''}
                                                onChange={(e) => handleChange(e, 'personalDetails')}
                                                maxLength={200}
                                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-border-blue-500"
                                            />
                                            <span className="text-xs text-gray-500 mt-1">Max 200 characters</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                                            <input
                                                type="file"
                                                id="profileImage"
                                                name="profileImage"
                                                accept="image/*"
                                                onChange={(e) => handleChange(e, 'personalDetails')}
                                                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {resumeData.personalDetails.profileImage && (
                                                <img src={resumeData.personalDetails.profileImage} alt="Profile Preview" className="mt-2 h-20 w-20 object-cover rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-col">
                                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Summary</h3>
                                        <textarea
                                            name="summary"
                                            id="summary-text" // Added id
                                            placeholder="A concise summary of your professional background and goals. (Recommended: 3-5 sentences)"
                                            value={resumeData.summary || ''}
                                            onChange={(e) => handleChange(e, 'summary')}
                                            maxLength={500}
                                            rows="4"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        ></textarea>
                                        <span className="text-xs text-gray-500 mt-1">Max 500 characters</span>
                                    </div>
                                </section>
                            )}

                            {activeSection === 'experience' && (
                                <section id="experience-section">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Experience</h3>
                                    {resumeData.experience.map((exp) => (
                                        <div key={exp.id} className="border p-4 rounded-md mb-4 relative">
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="text"
                                                    name="title"
                                                    id={`exp-title-${exp.id}`} // Added dynamic id
                                                    placeholder="Job Title"
                                                    value={exp.title || ''}
                                                    onChange={(e) => handleChange(e, 'experience', exp.id, 'title')}
                                                    maxLength={100}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 100 characters</span>
                                            </div>
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="text"
                                                    name="company"
                                                    id={`exp-company-${exp.id}`} // Added dynamic id
                                                    placeholder="Company"
                                                    value={exp.company || ''}
                                                    onChange={(e) => handleChange(e, 'experience', exp.id, 'company')}
                                                    maxLength={100}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 100 characters</span>
                                            </div>
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="text"
                                                    name="location"
                                                    id={`exp-location-${exp.id}`} // Added dynamic id
                                                    placeholder="Location"
                                                    value={exp.location || ''}
                                                    onChange={(e) => handleChange(e, 'experience', exp.id, 'location')}
                                                    maxLength={100}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 100 characters</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div className="flex flex-col">
                                                    <input
                                                        type="text"
                                                        name="startDate"
                                                        id={`exp-startDate-${exp.id}`} // Added dynamic id
                                                        placeholder="Start Date (e.g., Jan 2020)"
                                                        value={exp.startDate || ''}
                                                        onChange={(e) => handleChange(e, 'experience', exp.id, 'startDate')}
                                                        maxLength={20}
                                                        className="p-2 border border-gray-300 rounded-md"
                                                    />
                                                    <span className="text-xs text-gray-500 mt-1">Max 20 characters</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <input
                                                        type="text"
                                                        name="endDate"
                                                        id={`exp-endDate-${exp.id}`} // Added dynamic id
                                                        placeholder="End Date (e.g., Dec 2022 or Present)"
                                                        value={exp.endDate || ''}
                                                        onChange={(e) => handleChange(e, 'experience', exp.id, 'endDate')}
                                                        maxLength={20}
                                                    className="p-2 border border-gray-300 rounded-md"
                                                    />
                                                    <span className="text-xs text-gray-500 mt-1">Max 20 characters</span>
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                <p className="text-sm font-medium text-gray-700 mb-1">Responsibilities & Achievements (Max 150 characters per bullet):</p>
                                                {exp.description.map((desc, descIndex) => (
                                                    <div key={descIndex} className="flex items-center mb-1">
                                                        <textarea
                                                            placeholder="Responsibility or Achievement"
                                                            id={`exp-desc-${exp.id}-${descIndex}`} // Added dynamic id
                                                            name={`exp-desc-${exp.id}-${descIndex}`} // Added dynamic name
                                                            value={desc || ''}
                                                            onChange={(e) => handleChange(e, 'experience', exp.id, 'description', descIndex)}
                                                            maxLength={150}
                                                            rows="1"
                                                            className="flex-grow p-2 border border-gray-300 rounded-md mr-2"
                                                        ></textarea>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeField('experience', exp.id, 'description', descIndex)}
                                                            className="text-red-500 hover:text-red-700 text-lg"
                                                            title="Remove bullet point"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addField('experience', exp.id, 'description')}
                                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    Add Responsibility
                                                </button>
                                            </div>
                                            {resumeData.experience.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('experience', exp.id)}
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
                                                    title="Remove Experience"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addField('experience')}
                                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                                    >
                                        Add Experience
                                    </button>
                                </section>
                            )}

                            {activeSection === 'education' && (
                                <section id="education-section">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Education</h3>
                                    {resumeData.education.map((edu) => (
                                        <div key={edu.id} className="border p-4 rounded-md mb-4 relative">
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="text"
                                                    name="degree"
                                                    id={`edu-degree-${edu.id}`} // Added dynamic id
                                                    placeholder="Degree/Field of Study"
                                                    value={edu.degree || ''}
                                                    onChange={(e) => handleChange(e, 'education', edu.id, 'degree')}
                                                    maxLength={100}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 100 characters</span>
                                            </div>
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="text"
                                                    name="institution"
                                                    id={`edu-institution-${edu.id}`} // Added dynamic id
                                                    placeholder="Institution"
                                                    value={edu.institution || ''}
                                                    onChange={(e) => handleChange(e, 'education', edu.id, 'institution')}
                                                    maxLength={100}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 100 characters</span>
                                            </div>
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="text"
                                                    name="location"
                                                    id={`edu-location-${edu.id}`} // Added dynamic id
                                                    placeholder="Location"
                                                    value={edu.location || ''}
                                                    onChange={(e) => handleChange(e, 'education', edu.id, 'location')}
                                                    maxLength={100}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 100 characters</span>
                                            </div>
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="text"
                                                    name="graduationDate"
                                                    id={`edu-graduationDate-${edu.id}`} // Added dynamic id
                                                    placeholder="Graduation Date (e.g., May 2024)"
                                                    value={edu.graduationDate || ''}
                                                    onChange={(e) => handleChange(e, 'education', edu.id, 'graduationDate')}
                                                    maxLength={20}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 20 characters</span>
                                            </div>
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="text"
                                                    name="gpa"
                                                    id={`edu-gpa-${edu.id}`} // Added dynamic id
                                                    placeholder="GPA (e.g., 3.8/4.0)"
                                                    value={edu.gpa || ''}
                                                    onChange={(e) => handleChange(e, 'education', edu.id, 'gpa')}
                                                    maxLength={10}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 10 characters</span>
                                            </div>
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="text"
                                                    name="percentage"
                                                    id={`edu-percentage-${edu.id}`} // Added dynamic id
                                                    placeholder="Percentage (e.g., 90%)"
                                                    value={edu.percentage || ''}
                                                    onChange={(e) => handleChange(e, 'education', edu.id, 'percentage')}
                                                    maxLength={10}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 10 characters</span>
                                            </div>
                                            {resumeData.education.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('education', edu.id)}
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
                                                    title="Remove Education"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addField('education')}
                                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                                    >
                                        Add Education
                                    </button>
                                </section>
                            )}

                            {activeSection === 'skills' && (
                                <section id="skills-section">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Skills</h3>
                                    {resumeData.skills.map((skill, index) => (
                                        <div key={index} className="flex items-center mb-2">
                                            <input
                                                type="text"
                                                id={`skill-${index}`} // Added dynamic id
                                                name={`skill-${index}`} // Added dynamic name
                                                placeholder="Skill (e.g., JavaScript, React, Node.js)"
                                                value={skill || ''}
                                                onChange={(e) => handleChange(e, 'skills', index)}
                                                maxLength={50}
                                                className="flex-grow p-2 border border-gray-300 rounded-md mr-2"
                                            />
                                            {resumeData.skills.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('skills', index)}
                                                    className="text-red-500 hover:text-red-700 text-lg"
                                                    title="Remove Skill"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addField('skills')}
                                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                                    >
                                        Add Skill
                                    </button>
                                </section>
                            )}

                            {activeSection === 'projects' && (
                                <section id="projects-section">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Projects</h3>
                                    {resumeData.projects.map((proj) => (
                                        <div key={proj.id} className="border p-4 rounded-md mb-4 relative">
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id={`proj-name-${proj.id}`} // Added dynamic id
                                                    placeholder="Project Name"
                                                    value={proj.name || ''}
                                                    onChange={(e) => handleChange(e, 'projects', proj.id, 'name')}
                                                    maxLength={100}
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 100 characters</span>
                                            </div>
                                            <div className="flex flex-col mb-2">
                                                <textarea
                                                    name="description"
                                                    id={`proj-desc-${proj.id}`} // Added dynamic id
                                                    placeholder="Brief description of the project and your role/contributions. (Max 250 characters)"
                                                    value={proj.description || ''}
                                                    onChange={(e) => handleChange(e, 'projects', proj.id, 'description')}
                                                    maxLength={250}
                                                    rows="2"
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                ></textarea>
                                                <span className="text-xs text-gray-500 mt-1">Max 250 characters</span>
                                            </div>
                                            <div className="flex flex-col mb-2">
                                                <input
                                                    type="url"
                                                    name="link"
                                                    id={`proj-link-${proj.id}`} // Added dynamic id
                                                    placeholder="Project Link (Optional)"
                                                    value={proj.link || ''}
                                                    onChange={(e) => handleChange(e, 'projects', proj.id, 'link')}
                                                    maxLength={200}
                                                    className="p-2 border border-gray-300 rounded-md"
                                                />
                                                <span className="text-xs text-gray-500 mt-1">Max 200 characters</span>
                                            </div>
                                            {resumeData.projects.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('projects', proj.id)}
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
                                                    title="Remove Project"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addField('projects')}
                                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                                    >
                                        Add Project
                                    </button>
                                </section>
                            )}

                            {activeSection === 'certifications' && (
                                <section id="certifications-section">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Certifications</h3>
                                    {resumeData.certifications.map((cert, index) => (
                                        <div key={index} className="flex items-center mb-2">
                                            <input
                                                type="text"
                                                id={`cert-${index}`} // Added dynamic id
                                                name={`cert-${index}`} // Added dynamic name
                                                placeholder="Certification Name"
                                                value={cert || ''}
                                                onChange={(e) => handleChange(e, 'certifications', index)}
                                                maxLength={100}
                                                className="flex-grow p-2 border border-gray-300 rounded-md mr-2"
                                            />
                                            {resumeData.certifications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('certifications', index)}
                                                    className="text-red-500 hover:text-red-700 text-lg"
                                                    title="Remove Certification"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addField('certifications')}
                                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                                    >
                                        Add Certification
                                    </button>
                                </section>
                            )}

                            {activeSection === 'languages' && (
                                <section id="languages-section">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Languages</h3>
                                    {resumeData.languages.map((lang, index) => (
                                        <div key={index} className="flex items-center mb-2">
                                            <input
                                                type="text"
                                                id={`lang-${index}`} // Added dynamic id
                                                name={`lang-${index}`} // Added dynamic name
                                                placeholder="Language (e.g., English, Spanish)"
                                                value={lang || ''}
                                                onChange={(e) => handleChange(e, 'languages', index)}
                                                maxLength={50}
                                                className="flex-grow p-2 border border-gray-300 rounded-md mr-2"
                                            />
                                            {resumeData.languages.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField('languages', index)}
                                                    className="text-red-500 hover:text-red-700 text-lg"
                                                    title="Remove Language"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addField('languages')}
                                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
                                    >
                                        Add Language
                                    </button>
                                </section>
                            )}
                            {/* Clear All Data button is now only for current resume, not deleting user data */}
                        </div>
                    </div>

                    {/* Preview and Actions Column */}
                    <div className="space-y-6">
                        <div className="mb-4 p-4 bg-white rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Choose Template:</h3>
                            <div className="flex gap-4 flex-wrap">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio"
                                        name="template"
                                        value="classic"
                                        checked={selectedTemplate === 'classic'}
                                        onChange={() => setSelectedTemplate('classic')}
                                    />
                                    <span className="ml-2 text-gray-700">Classic</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio"
                                        name="template"
                                        value="modern"
                                        checked={selectedTemplate === 'modern'}
                                        onChange={() => setSelectedTemplate('modern')}
                                    />
                                    <span className="ml-2 text-gray-700">Modern Minimalist</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio"
                                        name="template"
                                        value="beam"
                                        checked={selectedTemplate === 'beam'}
                                        onChange={() => setSelectedTemplate('beam')}
                                    />
                                    <span className="ml-2 text-gray-700">Beam</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio"
                                        name="template"
                                        value="professional"
                                        checked={selectedTemplate === 'professional'}
                                        onChange={() => setSelectedTemplate('professional')}
                                    />
                                    <span className="ml-2 text-gray-700">Professional</span>
                                </label>
                            </div>
                        </div>

                        {/* Color selection */}
                        <div className="mb-4 p-4 bg-white rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Choose Heading Color:</h3>
                            <div className="flex gap-4 flex-wrap justify-center">
                                {/* Default Color Button */}
                                <button
                                    onClick={() => setSelectedColor('#000000')}
                                    className={`px-4 py-2 rounded-md transition duration-200 ${selectedColor === '#000000' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                                >
                                    Default (Black)
                                </button>
                                {colors.map((colorOption) => (
                                    <label key={colorOption} className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            className="hidden"
                                            name="headingColor"
                                            value={colorOption}
                                            checked={selectedColor === colorOption}
                                            onChange={() => setSelectedColor(selectedOption => selectedOption === colorOption ? '#000000' : colorOption)} // Toggle logic
                                        />
                                        <span
                                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition duration-200"
                                            style={{ backgroundColor: colorOption, borderColor: selectedColor === colorOption ? '#3B82F6' : '#E5E7EB' }}
                                            title={colorOption}
                                        >
                                            {selectedColor === colorOption && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            )}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Export and AI buttons */}
                        <div className="flex flex-col gap-4 items-center">
                            <button
                                onClick={handleDownloadPdf}
                                className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition duration-200 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                            >
                                Export Resume to PDF
                            </button>
                            <button
                                onClick={handleGetAiSuggestions}
                                className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition duration-200 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                                disabled={loadingAI || !user} // Disable if not logged in
                            >
                                {loadingAI ? 'Getting Suggestions...' : 'Get AI Suggestions'}
                            </button>
                        </div>
                        <ResumePreview resumeData={resumeData} resumePreviewRef={resumePreviewRef} selectedTemplate={selectedTemplate} selectedColor={selectedColor} />
                    </div>
                </div>
                {showAiModal && (
                    <AISuggestionsModal
                        suggestions={aiSuggestions}
                        loading={loadingAI}
                        onClose={() => setShowAiModal(false)}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
