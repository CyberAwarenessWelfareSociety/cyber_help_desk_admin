// ViewKYC.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import styles from "@/pages/APIKey/ApiKey.module.css";

const ViewKYC = ({ request, onClose }) => {
  const Field = ({ label, value }) => (
    <div className="grid grid-cols-4 gap-4 py-2">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="col-span-3 text-gray-800">{value || "—"}</span>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${styles.card} sm:max-w-[700px] max-h-[85vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-2xl">KYC Verification Request</DialogTitle>
          <div className="text-sm text-gray-500">Request ID: {request.requestId}</div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Personal Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <Field label="Name" value={request.name} />
              <Field label="Father's Name" value={request.fatherName} />
              <Field label="Date of Birth" value={request.dob} />
              <Field label="Gender" value={request.gender} />
              <Field label="Mobile" value={request.mobile} />
              <Field label="Email" value={request.email} />
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <Field label="Address" value={request.address} />
              <Field label="City" value={request.city} />
              <Field label="Pincode" value={request.pincode} />
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Business Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <Field label="Business Name" value={request.businessName} />
              <Field label="Business Address" value={request.businessAddress} />
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">Verification Purpose</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-800">{request.kyc_verification_purpose}</p>
            </div>
          </section>

          {request.remarks && (
            <section>
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Special Remarks</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-gray-800 italic">"{request.remarks}"</p>
              </div>
            </section>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              request.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
              request.status === "COMPLETED" ? "bg-green-100 text-green-800" :
              "bg-red-100 text-red-800"
            }`}>
              {request.status}
            </span>
            <span className="text-sm text-gray-500">
              Created: {new Date(request.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewKYC;