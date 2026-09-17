// EditKYC.jsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import api from "@/Utils/api";
import styles from "@/pages/APIKey/ApiKey.module.css";

const EditKYC = ({ request, onClose, onSave }) => {
  const [form, setForm] = useState({
    status: request.status || "PENDING",
    remarks: request.remarks || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/update-client_kyc_request/${request.id}`, form);
      toast.success("KYC request updated successfully");
      onSave();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${styles.card} sm:max-w-[620px] p-6`}>
        <DialogHeader className="border-b border-gray-200 pb-4 mb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Update KYC Verification Request
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Request ID: <span className="font-mono font-semibold">{request.requestId}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Status Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              Status <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.status}
              onValueChange={(val) => setForm(prev => ({ ...prev, status: val }))}
              disabled={loading}
            >
              <SelectTrigger 
                className="w-full h-12 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-gray-400"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <SelectItem value="PENDING" className="py-3 hover:bg-gray-50 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Pending
                  </span>
                </SelectItem>
                <SelectItem value="COMPLETED" className="py-3 hover:bg-gray-50 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Completed
                  </span>
                </SelectItem>
                <SelectItem value="INSUFFICIENCY" className="py-3 hover:bg-gray-50 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    insufficiency
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Admin Remarks */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              Admin Remarks <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <Textarea
              value={form.remarks}
              onChange={(e) => setForm(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Add internal notes, verification findings, or follow-up actions..."
              rows={5}
              disabled={loading}
              className="resize-none rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-base leading-relaxed placeholder-gray-400"
              style={{
                fontFamily: "'Inter', sans-serif",
                padding: "12px 14px",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="min-w-[100px] h-11 font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[140px] h-11 font-semibold bg-blue-600 hover:bg-blue-700  shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                "Update Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditKYC;