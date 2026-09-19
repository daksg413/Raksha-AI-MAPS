import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Bell, 
  CheckCircle2, 
  Lock, 
  Trash2, 
  X, 
  Send,
  Sparkles
} from 'lucide-react';
import { TrustedContact } from '../types';

interface TrustedCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: TrustedContact[];
  onAddContact: (contact: Omit<TrustedContact, 'id'>) => void;
  onRemoveContact: (id: string) => void;
  onToggleNotification: (id: string) => void;
  onTestCheckIn: (contactName: string) => void;
}

export const TrustedCircleModal: React.FC<TrustedCircleModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onAddContact,
  onRemoveContact,
  onToggleNotification,
  onTestCheckIn,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [phone, setPhone] = useState('');
  const [testSentTo, setTestSentTo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddContact({
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      notifyOnArrival: true,
    });

    setName('');
    setPhone('');
    setShowAddForm(false);
  };

  const handleTriggerTest = (contact: TrustedContact) => {
    onTestCheckIn(contact.name);
    setTestSentTo(contact.name);
    setTimeout(() => {
      setTestSentTo(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              Trusted Circle & Silent Check-In
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
                {contacts.length}/5 Designated
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Automatic, quiet arrival notifications without intrusive 24/7 GPS tracking
            </p>
          </div>
        </div>

        {/* Minimum Necessary Information Principle Card */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sky-300">Built on Privacy-First Architecture:</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              RAKSHA never broadcasts continuous live tracking. It quietly sends one single arrival ping when you safely reach your destination: <em>"Daksh has reached Navrangpura safely."</em>
            </p>
          </div>
        </div>

        {/* Test Alert Banner */}
        {testSentTo && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Simulated arrival check-in sent to <strong>{testSentTo}</strong>!</span>
          </div>
        )}

        {/* Contact List */}
        <div className="space-y-2.5 mb-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-200">
                    {contact.name}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {contact.relationship}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {contact.phone}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle Auto Check-In */}
                <button
                  onClick={() => onToggleNotification(contact.id)}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                    contact.notifyOnArrival
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                  title="Toggle Auto Arrival Notification"
                >
                  <Bell className="w-4 h-4" />
                </button>

                {/* Test Ping */}
                <button
                  onClick={() => handleTriggerTest(contact)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1 border border-slate-700"
                  title="Test Arrival Message"
                >
                  <Send className="w-3 h-3 text-sky-400" />
                  <span className="hidden sm:inline">Test Ping</span>
                </button>

                {/* Delete */}
                <button
                  onClick={() => onRemoveContact(contact.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Remove from Trusted Circle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Contact Button / Form */}
        {contacts.length < 5 && (
          <div>
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-800/40 transition-all"
              >
                <UserPlus className="w-4 h-4 text-sky-400" />
                <span>Add Trusted Contact ({5 - contacts.length} slots remaining)</span>
              </button>
            ) : (
              <form onSubmit={handleCreate} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">New Trusted Contact</span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name (e.g., Mom)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Spouse/Partner">Spouse/Partner</option>
                    <option value="Friend/Roommate">Friend/Roommate</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                <input
                  type="tel"
                  placeholder="Mobile Number (+91 98765 43210)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Save to Trusted Circle
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
