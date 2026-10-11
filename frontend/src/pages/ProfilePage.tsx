import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateUser } from '../store/authSlice';
import { Review } from '../types';
import { ShieldCheck, User as UserIcon, Mail, Phone, MapPin, Star, Edit, Check, Loader2 } from 'lucide-react';
import api from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [university, setUniversity] = useState(user?.university || '');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      api.get(`/reviews/seller/${user.id}`)
        .then(res => setReviews(res.data.data || []))
        .catch(() => {});
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.put('/auth/profile', {
        full_name: fullName,
        phone,
        bio,
        university
      });

      dispatch(updateUser(res.data.data));
      setIsEditing(false);
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-6 shadow-subtle relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user?.full_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                {user?.full_name}
                {user?.verification_status === 'VERIFIED' && (
                  <span title="Verified Student">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500">{user?.email}</p>
              
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {user?.rating_avg || '5.0'} ({user?.rating_count || 0} reviews)
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${user?.verification_status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {user?.verification_status === 'VERIFIED' ? '✓ Student Verified' : '● Verification Pending'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 w-fit"
          >
            <Edit className="w-4 h-4" /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
            {message}
          </div>
        )}

        {/* Profile Info Form / View */}
        {isEditing ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Campus / University</label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Student Bio</label>
              <textarea
                rows={3}
                placeholder="Share your major, graduation year, and preferred meetup locations..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Profile
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-xs pt-4 border-t border-slate-100">
            <p className="text-slate-600 leading-relaxed italic">
              "{user?.bio || 'No student bio provided yet.'}"
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>{user?.university}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-600" />
                <span>{user?.phone || 'No phone added'}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Seller Reviews Received */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4 shadow-subtle">
        <h3 className="text-base font-extrabold text-slate-900">Trading Feedback & Reviews</h3>
        
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400">No trading feedback received yet.</p>
        ) : (
          <div className="space-y-3 divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={rev.reviewer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="" className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-bold text-slate-800">{rev.reviewer_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
