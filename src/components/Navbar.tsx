import React from "react";
import { Database, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";

interface NavbarProps {
  onNewAssessment: () => void;
  onOpenChat: () => void;
  onOpenWhatIf?: () => void;
  hasReport: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewAssessment,
  onOpenChat,
  onOpenWhatIf,
  hasReport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF7]/90 backdrop-blur-md border-b border-[#E2E8D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={onNewAssessment}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E5D38] to-[#144327] flex items-center justify-center text-white shadow-sm shadow-[#1E5D38]/20">
            <span className="text-xl font-bold font-serif">V</span>
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-[#193826] tracking-tight block">
              VEYA
            </span>
            <p className="text-xs text-[#5D6B5F] hidden sm:block">
              Venture Evaluation & Yield Advisory
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {hasReport && onOpenWhatIf && (
            <button
              onClick={onOpenWhatIf}
              className="px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg text-[#1E5D38] bg-[#EDF7EE] hover:bg-[#E0F0E2] transition-colors border border-[#CDE1CF]"
            >
              What-If Simulator
            </button>
          )}

          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg text-[#233527] bg-white hover:bg-[#F3F6ED] transition-colors border border-[#D5DDD0]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#1E5D38]" />
            <span>Ask VEYA</span>
          </button>

          <button
            onClick={onNewAssessment}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E5D38] hover:bg-[#16472A] transition-all shadow-sm"
          >
            <span>Start Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
