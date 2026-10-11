import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchMe } from '../store/authSlice';
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const StudentVerificationPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const [studentIdNum, setStudentIdNum] = useState(user?.student_id_number || '');
  const [university, setUniversity] = useState(user?.university || 'State University');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('student_id_number', studentIdNum);
    formData.append('university', university);
    if (selectedFile) {
      formData.append('student_card', selectedFile);
    }

    try {
      await api.post('/auth/verify-student', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(fetchMe());
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.verification_status === 'VERIFIED') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Student Account Verified!</h2>
          <p className="text-xs text-slate-500">You hold a verified badge on CampusMart. You can list items, message buyers, and trade freely.</p>
        </div>
        <button
          onClick={() => navigate('/marketplace')}
          className="px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Explore Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-elevated space-y-6">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Verify Student Identity</h1>
            <p className="text-xs text-slate-500">Upload your student ID card or campus credential</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold">Verification Request Received!</h3>
            <p className="text-xs text-emerald-700">Campus administration will review your student ID photo shortly. Status updated to PENDING.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-5 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl"
            >
              Continue to Marketplace
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">University / Campus</label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Student ID Number</label>
              <input
                type="text"
                required
                placeholder="STU-1042"
                value={studentIdNum}
                onChange={(e) => setStudentIdNum(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Upload Student ID Photo</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-40 object-contain mx-auto rounded-lg shadow-sm" />
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-700">Click or drag student ID card image</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, or WEBP up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Verification Request'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
