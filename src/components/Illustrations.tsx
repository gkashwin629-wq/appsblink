import React from 'react';
import { AchievementBadgeId } from '../types';

export function SkillPathMark({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="32"
        height="32"
        rx="8"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="1.2"
      />
      <path
        d="M9 25C12.5 25 14 19 18 18C22 17 23.5 11 27 11"
        stroke="var(--sp-gold-bright)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="25" r="2.6" fill="var(--sp-teal)" />
      <circle cx="18" cy="18" r="2.5" fill="var(--sp-gold-bright)" />
      <circle cx="27" cy="11" r="2.8" fill="var(--sp-gold-bright)" />
      <path
        d="M27 6.5V8M27 14V15.5M22.5 11H24M30 11H31.5"
        stroke="var(--sp-teal)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FocusTargetIllustration({ className = 'w-11 h-11' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="18" stroke="var(--sp-gold)" strokeOpacity="0.35" strokeWidth="1.4" />
      <circle
        cx="24"
        cy="24"
        r="12"
        stroke="var(--sp-teal)"
        strokeOpacity="0.7"
        strokeWidth="1.6"
        strokeDasharray="4 3"
      />
      <circle cx="24" cy="24" r="5.5" fill="var(--sp-gold-bright)" fillOpacity="0.22" stroke="var(--sp-gold-bright)" strokeWidth="1.6" />
      <circle cx="24" cy="24" r="2" fill="var(--sp-gold-bright)" />
      <path d="M24 3V9M24 39V45M3 24H9M39 24H45" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function LearningPathIllustration({ className = 'w-11 h-11' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 37C15 37 15 26 22 25C29 24 28 12 38 11"
        stroke="var(--sp-gold-bright)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 37C17 33 17 17 25 16"
        stroke="var(--sp-teal)"
        strokeOpacity="0.65"
        strokeWidth="1.4"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
      <circle cx="9" cy="37" r="3.5" fill="var(--sp-surface-solid)" stroke="var(--sp-teal)" strokeWidth="1.8" />
      <circle cx="22" cy="25" r="3.5" fill="var(--sp-surface-solid)" stroke="var(--sp-gold-bright)" strokeWidth="1.8" />
      <circle cx="25" cy="16" r="2.8" fill="var(--sp-surface-solid)" stroke="var(--sp-teal)" strokeWidth="1.6" />
      <circle cx="38" cy="11" r="4" fill="var(--sp-gold-bright)" fillOpacity="0.25" stroke="var(--sp-gold-bright)" strokeWidth="1.8" />
    </svg>
  );
}

export function GrowthChartIllustration({ className = 'w-11 h-11' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 39H41" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="10" y="29" width="5" height="10" rx="1.5" fill="var(--sp-teal)" fillOpacity="0.35" stroke="var(--sp-teal)" strokeWidth="1.2" />
      <rect x="19" y="23" width="5" height="16" rx="1.5" fill="var(--sp-teal)" fillOpacity="0.5" stroke="var(--sp-teal)" strokeWidth="1.2" />
      <rect x="28" y="17" width="5" height="22" rx="1.5" fill="var(--sp-gold)" fillOpacity="0.4" stroke="var(--sp-gold-bright)" strokeWidth="1.2" />
      <rect x="37" y="10" width="5" height="29" rx="1.5" fill="var(--sp-gold-bright)" fillOpacity="0.55" stroke="var(--sp-gold-bright)" strokeWidth="1.2" />
      <path
        d="M11 24L21 17L30 13L40 7"
        stroke="var(--sp-gold-bright)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="7" r="2.2" fill="var(--sp-teal)" />
    </svg>
  );
}

export function CareerRoadmapHeroIllustration() {
  return (
    <svg
      viewBox="0 0 680 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      role="img"
      aria-label="Career-learning architecture connecting core skills, prerequisite roadmap milestones, and a target career goal"
    >
      <defs>
        <linearGradient id="spRoadGrad" x1="80" y1="120" x2="600" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--sp-teal)" />
          <stop offset="55%" stopColor="var(--sp-gold-bright)" />
          <stop offset="100%" stopColor="var(--sp-gold)" />
        </linearGradient>
        <linearGradient id="spPanelGrad" x1="0" y1="0" x2="680" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--sp-teal)" stopOpacity="0.08" />
          <stop offset="50%" stopColor="var(--sp-gold)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--sp-gold-bright)" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect
        x="4"
        y="4"
        width="672"
        height="222"
        rx="16"
        fill="url(#spPanelGrad)"
        stroke="currentColor"
        strokeOpacity="0.14"
      />

      {/* Subtle grid lines */}
      <path
        d="M40 56H640M40 115H640M40 174H640"
        stroke="currentColor"
        strokeOpacity="0.07"
        strokeDasharray="4 6"
      />

      {/* Left Cluster: Current Skills */}
      <g>
        <rect
          x="26"
          y="30"
          width="156"
          height="170"
          rx="12"
          fill="var(--sp-surface-solid)"
          fillOpacity="0.86"
          stroke="currentColor"
          strokeOpacity="0.14"
        />
        <text x="42" y="54" fill="var(--sp-teal)" fontSize="10.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
          01 · SKILLS
        </text>
        <text x="42" y="73" fill="currentColor" fontSize="13" fontFamily="Inter, sans-serif" fontWeight="600">
          Current Baseline
        </text>

        <rect x="42" y="90" width="124" height="24" rx="6" fill="var(--sp-teal)" fillOpacity="0.12" stroke="var(--sp-teal)" strokeOpacity="0.35" />
        <text x="52" y="106" fill="currentColor" fontSize="11" fontFamily="Inter, sans-serif">
          TypeScript · Lv 2
        </text>

        <rect x="42" y="122" width="124" height="24" rx="6" fill="var(--sp-gold)" fillOpacity="0.12" stroke="var(--sp-gold)" strokeOpacity="0.35" />
        <text x="52" y="138" fill="currentColor" fontSize="11" fontFamily="Inter, sans-serif">
          SQL Modeling · Gap
        </text>

        <rect x="42" y="154" width="124" height="24" rx="6" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.16" />
        <text x="52" y="170" fill="currentColor" fontSize="11" fontFamily="Inter, sans-serif">
          Backend APIs · Gap
        </text>
      </g>

      {/* Connecting curves from Skills to Roadmap */}
      <path d="M182 102C212 102 214 78 242 78" stroke="var(--sp-teal)" strokeWidth="1.8" strokeOpacity="0.8" />
      <path d="M182 134C212 134 214 118 242 118" stroke="url(#spRoadGrad)" strokeWidth="2.2" />
      <path d="M182 166C212 166 214 158 242 158" stroke="var(--sp-gold)" strokeWidth="1.8" strokeOpacity="0.7" strokeDasharray="4 3" />

      {/* Center Cluster: Prerequisite Roadmap */}
      <g>
        <rect
          x="242"
          y="30"
          width="196"
          height="170"
          rx="12"
          fill="var(--sp-surface-solid)"
          fillOpacity="0.9"
          stroke="var(--sp-gold)"
          strokeOpacity="0.35"
        />
        <text x="258" y="54" fill="var(--sp-gold-bright)" fontSize="10.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
          02 · ROADMAP
        </text>
        <text x="258" y="73" fill="currentColor" fontSize="13" fontFamily="Inter, sans-serif" fontWeight="600">
          Ordered Milestones
        </text>

        {/* Vertical spine */}
        <line x1="272" y1="92" x2="272" y2="174" stroke="url(#spRoadGrad)" strokeWidth="2" />

        <circle cx="272" cy="96" r="5" fill="var(--sp-teal)" />
        <text x="286" y="100" fill="currentColor" fontSize="11.5" fontFamily="Inter, sans-serif">
          1. Foundations &amp; Labs
        </text>

        <circle cx="272" cy="133" r="5.5" fill="var(--sp-gold-bright)" />
        <text x="286" y="137" fill="currentColor" fontSize="11.5" fontFamily="Inter, sans-serif">
          2. Practical Exercises
        </text>

        <circle cx="272" cy="170" r="5" fill="var(--sp-surface-solid)" stroke="var(--sp-gold-bright)" strokeWidth="2" />
        <text x="286" y="174" fill="currentColor" fontSize="11.5" fontFamily="Inter, sans-serif">
          3. Verified Assessment
        </text>
      </g>

      {/* Connecting curve from Roadmap to Career Goal */}
      <path d="M438 115C468 115 470 115 498 115" stroke="url(#spRoadGrad)" strokeWidth="2.6" />
      <polygon points="496,110 505,115 496,120" fill="var(--sp-gold-bright)" />

      {/* Right Cluster: Career Goal */}
      <g>
        <rect
          x="505"
          y="30"
          width="149"
          height="170"
          rx="12"
          fill="var(--sp-surface-solid)"
          fillOpacity="0.92"
          stroke="var(--sp-teal)"
          strokeOpacity="0.4"
        />
        <text x="521" y="54" fill="var(--sp-teal)" fontSize="10.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
          03 · GOAL
        </text>
        <text x="521" y="73" fill="currentColor" fontSize="13" fontFamily="Inter, sans-serif" fontWeight="600">
          Target Role
        </text>

        {/* Radial progress ring */}
        <circle cx="579" cy="126" r="34" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6" />
        <circle
          cx="579"
          cy="126"
          r="34"
          stroke="url(#spRoadGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="175 214"
          transform="rotate(-90 579 126)"
        />
        <text
          x="579"
          y="124"
          textAnchor="middle"
          fill="currentColor"
          fontSize="16"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="600"
        >
          82%
        </text>
        <text
          x="579"
          y="141"
          textAnchor="middle"
          fill="var(--sp-text-muted)"
          fontSize="10"
          fontFamily="Inter, sans-serif"
        >
          Role Fit
        </text>
        <text
          x="579"
          y="182"
          textAnchor="middle"
          fill="var(--sp-gold-bright)"
          fontSize="11"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
        >
          Full Stack Ready
        </text>
      </g>
    </svg>
  );
}

export function IntroStageGraphic({ stage }: { stage: number }) {
  if (stage === 0) {
    return (
      <svg viewBox="0 0 180 120" className="w-44 h-28 mx-auto" fill="none" aria-hidden="true">
        <circle cx="90" cy="60" r="46" stroke="var(--sp-gold)" strokeOpacity="0.25" strokeWidth="1.2" />
        <circle cx="90" cy="60" r="30" stroke="var(--sp-teal)" strokeOpacity="0.5" strokeWidth="1.4" strokeDasharray="5 4" />
        <circle cx="90" cy="60" r="10" fill="var(--sp-gold-bright)" fillOpacity="0.24" stroke="var(--sp-gold-bright)" strokeWidth="1.8" />
        <circle cx="90" cy="60" r="3.5" fill="var(--sp-gold-bright)" />
      </svg>
    );
  }
  if (stage === 1) {
    return (
      <svg viewBox="0 0 220 120" className="w-52 h-28 mx-auto" fill="none" aria-hidden="true">
        <path d="M26 92C60 92 68 48 110 48C152 48 160 28 194 28" stroke="var(--sp-gold-bright)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M26 92C70 92 84 74 128 74C162 74 172 62 194 62" stroke="var(--sp-teal)" strokeWidth="1.6" strokeDasharray="4 4" strokeLinecap="round" />
        <circle cx="26" cy="92" r="5" fill="var(--sp-teal)" />
        <circle cx="110" cy="48" r="5.5" fill="var(--sp-gold-bright)" />
        <circle cx="194" cy="28" r="6" fill="var(--sp-surface-solid)" stroke="var(--sp-gold-bright)" strokeWidth="2.2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 220 120" className="w-52 h-28 mx-auto" fill="none" aria-hidden="true">
      <rect x="28" y="76" width="24" height="24" rx="4" fill="var(--sp-teal)" fillOpacity="0.35" stroke="var(--sp-teal)" />
      <rect x="68" y="58" width="24" height="42" rx="4" fill="var(--sp-teal)" fillOpacity="0.5" stroke="var(--sp-teal)" />
      <rect x="108" y="42" width="24" height="58" rx="4" fill="var(--sp-gold)" fillOpacity="0.45" stroke="var(--sp-gold-bright)" />
      <rect x="148" y="24" width="24" height="76" rx="4" fill="var(--sp-gold-bright)" fillOpacity="0.6" stroke="var(--sp-gold-bright)" />
      <path d="M38 66L80 46L120 32L162 14" stroke="var(--sp-gold-bright)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="162" cy="14" r="4" fill="var(--sp-teal)" />
    </svg>
  );
}

export function AchievementBadgeIcon({
  badgeId,
  earned,
  className = 'w-11 h-11',
}: {
  badgeId: AchievementBadgeId;
  earned: boolean;
  className?: string;
}) {
  const strokePrimary = earned ? 'var(--sp-gold-bright)' : 'currentColor';
  const strokeAccent = earned ? 'var(--sp-teal)' : 'currentColor';
  const opacity = earned ? 1 : 0.42;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      <polygon
        points="24,4 40,13 40,35 24,44 8,35 8,13"
        fill={earned ? 'var(--sp-gold-bright)' : 'currentColor'}
        fillOpacity={earned ? 0.14 : 0.05}
        stroke={strokePrimary}
        strokeWidth="1.6"
      />
      <circle cx="24" cy="24" r="12" stroke={strokeAccent} strokeOpacity={earned ? 0.75 : 0.4} strokeWidth="1.2" />
      {badgeId === 'first-resource' && (
        <path d="M18 24.5L22.2 28.5L30.5 19.5" stroke={strokePrimary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {badgeId === 'completed-10-resources' && (
        <path d="M16 29V20M21 29V17M26 29V22M31 29V15" stroke={strokePrimary} strokeWidth="2.1" strokeLinecap="round" />
      )}
      {badgeId === 'hands-on-builder' && (
        <path d="M18 19L14 24L18 29M30 19L34 24L30 29M26 17L22 31" stroke={strokePrimary} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {badgeId === 'level-5-proficiency' && (
        <path d="M24 14L26.8 20.2L33.5 21L28.4 25.5L29.8 32L24 28.6L18.2 32L19.6 25.5L14.5 21L21.2 20.2L24 14Z" fill={earned ? 'var(--sp-gold-bright)' : 'none'} stroke={strokePrimary} strokeWidth="1.5" strokeLinejoin="round" />
      )}
      {badgeId === 'portfolio-ready' && (
        <rect x="16" y="18" width="16" height="12" rx="2" stroke={strokePrimary} strokeWidth="1.7" />
      )}
      {badgeId === 'role-benchmark-80' && (
        <path d="M15 28L21 22L25 26L33 17M28 17H33V22" stroke={strokePrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
