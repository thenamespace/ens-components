import { GitBranch, Megaphone, Send } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";

export function ReportBugSection() {
  return (
    <section className="section" id="report-bug">
      <SectionHeader
        icon={Megaphone}
        name="Community"
        title="Get Help & Report Issues"
        desc="Found a bug or need support? Reach out in the Namespace Builders Telegram group or open an issue on GitHub."
      />
      <div className="community-grid">
        <a
          className="community-card"
          href="https://t.me/+u2X1_QbR-CVmMGIy"
          target="_blank"
          rel="noreferrer"
        >
          <div className="community-card-icon community-card-icon-tg">
            <Send size={22} strokeWidth={2} />
          </div>
          <div className="community-card-body">
            <h3 className="community-card-title">Namespace Builders</h3>
            <p className="community-card-desc">Join our Telegram group for questions, feedback, and release announcements.</p>
          </div>
        </a>
        <a
          className="community-card"
          href="https://github.com/thenamespace/ens-components"
          target="_blank"
          rel="noreferrer"
        >
          <div className="community-card-icon community-card-icon-gh">
            <GitBranch size={22} strokeWidth={2} />
          </div>
          <div className="community-card-body">
            <h3 className="community-card-title">GitHub Repository</h3>
            <p className="community-card-desc">Browse source code, open issues, and contribute to the project.</p>
          </div>
        </a>
      </div>
    </section>
  );
}
