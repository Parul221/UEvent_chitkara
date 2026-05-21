import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();

  function goBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-2 rounded-full border border-red-700 bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-red-700 ${className}`}
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}
