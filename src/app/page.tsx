import Link from "next/link";
import { Shield, Vote, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="landing-hero">
      <div className="landing-logo">
        SJCET<span>Vote</span>
      </div>
      <p className="landing-tagline">
        Secure, transparent, and seamless online elections for the student community.
      </p>
      <p className="landing-institution">
        ST. JOSEPH&apos;S COLLEGE OF ENGINEERING AND TECHNOLOGY, PALAI
      </p>

      <div className="landing-features">
        <div className="landing-feature">
          <div className="landing-feature-icon">
            <Shield size={24} />
          </div>
          <div className="landing-feature-title">Secure Voting</div>
          <div className="landing-feature-desc">
            Domain-restricted authentication ensures only SJCET students can participate.
          </div>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">
            <Vote size={24} />
          </div>
          <div className="landing-feature-title">Easy to Use</div>
          <div className="landing-feature-desc">
            Cast your votes in minutes with an intuitive, clean interface.
          </div>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">
            <BarChart3 size={24} />
          </div>
          <div className="landing-feature-title">Live Results</div>
          <div className="landing-feature-desc">
            Track real-time election results with beautiful visualizations.
          </div>
        </div>
      </div>

      <Link href="/login" className="btn btn-primary btn-lg">
        Sign In to Vote
      </Link>
    </div>
  );
}
