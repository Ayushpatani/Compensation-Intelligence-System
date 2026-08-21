'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Landmark, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SubmitSalary() {
  const router = useRouter();
  
  // Form state
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [base, setBase] = useState('');
  const [stock, setStock] = useState('');
  const [bonus, setBonus] = useState('');
  const [location, setLocation] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [yearsAtCompany, setYearsAtCompany] = useState('');

  // Status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setGeneralError('');

    // Pre-validation
    const fieldErrors: Record<string, string> = {};
    if (!company) fieldErrors.company = 'Company name is required';
    if (!title) fieldErrors.title = 'Job title is required';
    if (!level) fieldErrors.level = 'Level is required';
    if (!base || isNaN(Number(base)) || Number(base) < 0) {
      fieldErrors.base = 'Base salary must be a positive number';
    }
    if (stock && (isNaN(Number(stock)) || Number(stock) < 0)) {
      fieldErrors.stock = 'Stock must be a positive number';
    }
    if (bonus && (isNaN(Number(bonus)) || Number(bonus) < 0)) {
      fieldErrors.bonus = 'Bonus must be a positive number';
    }
    if (!location) fieldErrors.location = 'Location is required';
    if (!yearsOfExperience || isNaN(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0) {
      fieldErrors.yearsOfExperience = 'Experience must be a positive number';
    }
    if (yearsAtCompany && (isNaN(Number(yearsAtCompany)) || Number(yearsAtCompany) < 0)) {
      fieldErrors.yearsAtCompany = 'Years at company must be a positive number';
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        company,
        title,
        level,
        base: Number(base),
        stock: stock ? Number(stock) : 0,
        bonus: bonus ? Number(bonus) : 0,
        location,
        yearsOfExperience: Number(yearsOfExperience),
        yearsAtCompany: yearsAtCompany ? Number(yearsAtCompany) : null,
      };

      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.status === 201) {
        setSubmitSuccess(true);
      } else if (res.status === 409) {
        setGeneralError('Duplicate entry detected. This exact salary record has already been submitted.');
      } else if (res.status === 400 && result.details) {
        // Zod validation errors returned from server
        const serverErrors: Record<string, string> = {};
        Object.keys(result.details).forEach((key) => {
          serverErrors[key] = result.details[key][0];
        });
        setErrors(serverErrors);
      } else {
        setGeneralError(result.error || 'Failed to submit compensation record.');
      }
    } catch (err: any) {
      setGeneralError('Network error. Failed to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCompany('');
    setTitle('');
    setLevel('');
    setBase('');
    setStock('');
    setBonus('');
    setLocation('');
    setYearsOfExperience('');
    setYearsAtCompany('');
    setSubmitSuccess(false);
    setErrors({});
    setGeneralError('');
  };

  if (submitSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Submission Successful!</h1>
          <p className="text-gray-400 text-sm">
            Thank you for contributing anonymously. Your submission helps improve salary transparency for everyone!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <button
            onClick={handleResetForm}
            className="px-6 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Submit Another Record
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 transition-all text-center"
          >
            Go to Salaries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 max-w-2xl space-y-6">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to salaries</span>
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Landmark className="h-6 w-6 text-emerald-500" />
          <span>Anonymous Salary Submission</span>
        </h1>
        <p className="text-xs text-gray-500">
          Share your compensation details to contribute to the open developer database. All fields are kept secure.
        </p>
      </div>

      {generalError && (
        <div className="bg-red-950/30 border border-red-900/30 text-red-400 rounded-lg p-4 text-sm flex items-start space-x-2.5">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 space-y-6">
        
        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Name</label>
            <input
              type="text"
              placeholder="E.g., Google, Meta"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={`w-full bg-gray-950 border ${errors.company ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500`}
            />
            {errors.company && <p className="text-xs text-red-500 font-semibold">{errors.company}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Title</label>
            <input
              type="text"
              placeholder="E.g., Software Engineer, Product Manager"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full bg-gray-950 border ${errors.title ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500`}
            />
            {errors.title && <p className="text-xs text-red-500 font-semibold">{errors.title}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Level / Grade</label>
            <input
              type="text"
              placeholder="E.g., L4, E5, Senior"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={`w-full bg-gray-950 border ${errors.level ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500`}
            />
            {errors.level && <p className="text-xs text-red-500 font-semibold">{errors.level}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</label>
            <input
              type="text"
              placeholder="E.g., San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full bg-gray-950 border ${errors.location ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500`}
            />
            {errors.location && <p className="text-xs text-red-500 font-semibold">{errors.location}</p>}
          </div>
        </div>

        {/* Compensation breakdown */}
        <div className="pt-4 border-t border-gray-800 space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Compensation Structure (USD / Year)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Base Salary</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-gray-500">$</span>
                <input
                  type="text"
                  placeholder="120000"
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  className={`w-full bg-gray-950 border ${errors.base ? 'border-red-500' : 'border-gray-800'} rounded-lg pl-7 pr-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500`}
                />
              </div>
              {errors.base && <p className="text-xs text-red-500 font-semibold">{errors.base}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Stock / Equity (per year)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-gray-500">$</span>
                <input
                  type="text"
                  placeholder="30000"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className={`w-full bg-gray-950 border ${errors.stock ? 'border-red-500' : 'border-gray-800'} rounded-lg pl-7 pr-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500`}
                />
              </div>
              {errors.stock && <p className="text-xs text-red-500 font-semibold">{errors.stock}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Annual Bonus</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-gray-500">$</span>
                <input
                  type="text"
                  placeholder="15000"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  className={`w-full bg-gray-950 border ${errors.bonus ? 'border-red-500' : 'border-gray-800'} rounded-lg pl-7 pr-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500`}
                />
              </div>
              {errors.bonus && <p className="text-xs text-red-500 font-semibold">{errors.bonus}</p>}
            </div>
          </div>
        </div>

        {/* Experience fields */}
        <div className="pt-4 border-t border-gray-800 space-y-4">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Experience</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Years of Total Experience</label>
              <input
                type="text"
                placeholder="E.g., 5"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className={`w-full bg-gray-950 border ${errors.yearsOfExperience ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500`}
              />
              {errors.yearsOfExperience && <p className="text-xs text-red-500 font-semibold">{errors.yearsOfExperience}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Years at this Company</label>
              <input
                type="text"
                placeholder="E.g., 2"
                value={yearsAtCompany}
                onChange={(e) => setYearsAtCompany(e.target.value)}
                className={`w-full bg-gray-950 border ${errors.yearsAtCompany ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500`}
              />
              {errors.yearsAtCompany && <p className="text-xs text-red-500 font-semibold">{errors.yearsAtCompany}</p>}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center space-x-2 rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white shadow transition-all hover:bg-emerald-500 hover:shadow-emerald-950/20 active:scale-98 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Submitting to Database...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Record</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
