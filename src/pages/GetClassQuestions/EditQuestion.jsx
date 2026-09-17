// src/pages/class-questions/classquestions/EditQuestion.jsx
import modalStyles from "./Modal.module.css";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect, use } from "react";
import toast from "react-hot-toast";
import api from "@/Utils/api";

export default function EditQuestion({ question, onClose, onSuccess, classes,class_id }) {
  const [form, setForm] = useState({
    class_id: question?.class_id || "",
    question: question?.question || "",
    option_a: question?.option_a || "",
    option_b: question?.option_b || "",
    option_c: question?.option_c || "",
    option_d: question?.option_d || "",
    correct_answer: question?.correct_answer || "",
  });
useEffect(() => {
    if (class_id) {
      setForm((prev) => ({ ...prev, class_id }));
    }
  }, [class_id]);
  const [errors, setErrors] = useState({});

  // Optional: Sync if question prop changes (rare but safe)
  useEffect(() => {
    if (question) {
      setForm({
        class_id: question.class_id || "",
        question: question.question || "",
        option_a: question.option_a || "",
        option_b: question.option_b || "",
        option_c: question.option_c || "",
        option_d: question.option_d || "",
        correct_answer: question.correct_answer || "",
      });
      setErrors({});
    }
  }, [question]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    // Clear correct answer error when changing related fields
    if (
      (name.startsWith("option_") || name === "correct_answer") &&
      errors.correct_answer
    ) {
      setErrors((prev) => ({ ...prev, correct_answer: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.class_id) {
      newErrors.class_id = "Please select a class.";
    }

    if (!form.question.trim()) {
      newErrors.question = "Question is required.";
    }

    // At least 2 options filled
    const filledOptions = [
      form.option_a,
      form.option_b,
      form.option_c,
      form.option_d,
    ].filter((opt) => opt.trim() !== "");

    if (filledOptions.length < 2) {
      newErrors.options = "At least 2 options must be provided.";
    }

    // If correct_answer is selected, the corresponding option must exist
    if (form.correct_answer) {
      const correctOptionText = form[form.correct_answer];
      if (!correctOptionText || !correctOptionText.trim()) {
        newErrors.correct_answer = `Option ${form.correct_answer
          .replace("option_", "")
          .toUpperCase()} cannot be empty if selected as correct.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    toast.loading("Updating question...");

    try {
      const payload = {
        class_id: form.class_id,
        question: form.question.trim(),
        option_a: form.option_a.trim() || null,
        option_b: form.option_b.trim() || null,
        option_c: form.option_c.trim() || null,
        option_d: form.option_d.trim() || null,
        correct_answer: form.correct_answer || null,
      };

      await api.put(`/questions/${question.id}`, payload);

      toast.dismiss();
      toast.success("Question updated successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.dismiss();
      const msg = err.response?.data?.message || "Failed to update question";
      toast.error(msg);
      console.error("Update question error:", err);
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={modalStyles.modalTitle}>Edit Question (MCQ)</h2>

        <div className={modalStyles.scrollContent}>
          <form className={modalStyles.form} onSubmit={handleSubmit}>
            {/* Class Selection */}
           

            {/* Question - Full Width */}
            <label className={modalStyles.fullWidthLabel}>
              Question <span style={{ color: "red" }}>*</span>
              <textarea
                name="question"
                value={form.question}
                onChange={handleChange}
                rows="5"
                placeholder="Edit your question here. Use line breaks for multiple lines."
                required
              />
              {errors.question && (
                <span className={modalStyles.error}>{errors.question}</span>
              )}
            </label>

            {/* Options */}
            <label>
              Option A
              <input
                name="option_a"
                value={form.option_a}
                onChange={handleChange}
                placeholder="e.g. Frontend framework"
              />
            </label>

            <label>
              Option B
              <input
                name="option_b"
                value={form.option_b}
                onChange={handleChange}
                placeholder="e.g. JavaScript runtime"
              />
            </label>

            <label>
              Option C
              <input
                name="option_c"
                value={form.option_c}
                onChange={handleChange}
                placeholder="e.g. Database"
              />
            </label>

            <label>
              Option D
              <input
                name="option_d"
                value={form.option_d}
                onChange={handleChange}
                placeholder="e.g. Operating System"
              />
            </label>

            {errors.options && (
              <div className={modalStyles.fullWidthLabel}>
                <span className={modalStyles.error}>{errors.options}</span>
              </div>
            )}

            {/* Correct Answer */}
            <label>
              Correct Answer
              <select
                name="correct_answer"
                value={form.correct_answer}
                onChange={handleChange}
              >
                <option value="">None (optional)</option>
                <option value="option_a" disabled={!form.option_a.trim()}>
                  A
                </option>
                <option value="option_b" disabled={!form.option_b.trim()}>
                  B
                </option>
                <option value="option_c" disabled={!form.option_c.trim()}>
                  C
                </option>
                <option value="option_d" disabled={!form.option_d.trim()}>
                  D
                </option>
              </select>
              {errors.correct_answer && (
                <span className={modalStyles.error}>{errors.correct_answer}</span>
              )}
              <small style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>
                Select only if the option is filled
              </small>
            </label>

            {/* Actions */}
            <div className={modalStyles.actions}>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={modalStyles.primaryBtn}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}