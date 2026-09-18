import React from "react";
import { Database, ShieldCheck, HelpCircle, ArrowRight, RotateCcw } from "lucide-react";
import { VeyaLogo } from "./VeyaLogo";

interface NavbarProps {
  onNewAssessment: () => void;
  onOpenChat: () => void;
  onOpenWhatIf?: () => void;
  hasReport: boolean;
  hasRunAnalysis?: boolean;
  onResetScenario?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewAssessment,
  onOpenChat,
  onOpenWhatIf,
  hasReport,
  hasRunAnalysis,
  onResetScenario,
}) => {
  const isAnalysisRun = Boolean(hasRunAnalysis || hasReport);

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF7]/90 backdrop-blur-md border-b border-[#E2E8D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <div className="flex items-center cursor-pointer shrink-0" onClick={isAnalysisRun ? (onResetScenario || onNewAssessment) : onNewAssessment}>
          <VeyaLogo size="md" />
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

          {isAnalysisRun ? (
            <button
              onClick={onResetScenario || onNewAssessment}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E5D38] hover:bg-[#16472A] transition-all shadow-sm"
              title="Return to input form with your previous scenario pre-filled"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scenario</span>
            </button>
          ) : (
            <button
              onClick={onNewAssessment}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E5D38] hover:bg-[#16472A] transition-all shadow-sm"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
