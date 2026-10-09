"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  Pill, 
  Clock, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Loader2,
  X
} from "lucide-react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

/**
 * Patient Medicine Reminders Page
 */
export default function RemindersPage() {
  const { data: session } = useSession();
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState({
    medicine_name: "",
    dosage: "",
    frequency: "once",
    start_date: "",
    end_date: "",
    reminder_times: ["08:00"]
  });

  const fetchReminders = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    setLoading(true);
    try {
      const response = await api.get(`/reminders/patient/${userId}`);
      setReminders(response.data.data);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [session]);

  const handleSearchMedicine = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      // Calling the Python microservice (via Next.js API or direct if accessible)
      const response = await api.get(`/medicine/search?name=${query}`);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error("Medicine search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/reminders", {
        ...formData,
        reminder_times_json: formData.reminder_times
      });
      setShowAddModal(false);
      fetchReminders();
      // Reset form
    } catch (error) {
      alert("Failed to create reminder.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this reminder?")) return;
    try {
      await api.delete(`/reminders/${id}`);
      fetchReminders();
    } catch (error) {
      alert("Failed to delete reminder.");
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Medicine Reminders</h1>
          <p className="text-slate-500 mt-1">Never miss a dose again. Set up SMS and email alerts.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      ) : reminders.length === 0 ? (
        <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <Pill className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Reminders Set</h3>
          <p className="text-slate-500 max-w-xs mt-2 mb-8">
            Start adding your daily medications to get timely reminders via SMS and email.
          </p>
          <Button variant="outline" onClick={() => setShowAddModal(true)}>
            Add Your First Medication
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {reminders.map((rem) => (
              <motion.div
                key={rem.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-slate-200 hover:border-blue-200 transition-all group h-full flex flex-col">
                  <CardContent className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Pill className="w-6 h-6" />
                      </div>
                      <Badge className={rem.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                        {rem.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{rem.medicine_name}</h3>
                    <p className="text-sm text-slate-500 mb-6">{rem.dosage} • {rem.frequency} daily</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{rem.start_date} to {rem.end_date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <div className="flex flex-wrap gap-1">
                          {rem.reminder_times_json?.map((t: string) => (
                            <span key={t} className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 border-t border-slate-50 flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(rem.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                      Edit
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal (Simplified) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Add Reminder</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddReminder} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Medicine Name</label>
                  <div className="relative">
                    <Input 
                      placeholder="Search or enter name..." 
                      value={formData.medicine_name}
                      onChange={(e) => {
                        setFormData({...formData, medicine_name: e.target.value});
                        handleSearchMedicine(e.target.value);
                      }}
                      required
                    />
                    {searching && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-blue-500" />}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map(res => (
                        <div 
                          key={res.brand_name} 
                          className="p-3 hover:bg-slate-50 cursor-pointer text-sm"
                          onClick={() => {
                            setFormData({...formData, medicine_name: res.brand_name});
                            setSearchResults([]);
                          }}
                        >
                          <p className="font-bold">{res.brand_name}</p>
                          <p className="text-xs text-slate-500">{res.generic_name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Dosage</label>
                    <Input 
                      placeholder="e.g. 500mg" 
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Frequency</label>
                    <select 
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    >
                      <option value="once">Once Daily</option>
                      <option value="twice">Twice Daily</option>
                      <option value="thrice">Thrice Daily</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Start Date</label>
                    <Input 
                      type="date" 
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">End Date</label>
                    <Input 
                      type="date" 
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Reminder Times</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.reminder_times.map((time, idx) => (
                      <Input 
                        key={idx}
                        type="time" 
                        className="w-32"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...formData.reminder_times];
                          newTimes[idx] = e.target.value;
                          setFormData({...formData, reminder_times: newTimes});
                        }}
                      />
                    ))}
                    {formData.reminder_times.length < 3 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-10"
                        onClick={() => setFormData({...formData, reminder_times: [...formData.reminder_times, "12:00"]})}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg rounded-2xl shadow-xl shadow-blue-500/20">
                  Save Reminder
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
