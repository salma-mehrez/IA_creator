"use client";

import { Users, Eye, Video, ExternalLink, Globe } from "lucide-react";

interface SimilarChannel {
  channel_id: string;
  title: string;
  description: string;
  thumbnail: string;
  banner: string;
  subscriber_count: number;
  view_count: number;
  video_count: number;
  country: string;
  url: string;
}

function formatNumber(n: number) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function SimilarChannelGrid({ channels }: { channels: SimilarChannel[] }) {
  if (channels.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {channels.map((ch) => (
        <a
          key={ch.channel_id}
          href={ch.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand-border hover:shadow-lg hover:shadow-brand/5 transition-all duration-300 flex flex-col"
        >
          {/* Banner / Header */}
          <div className="relative h-20 bg-gradient-to-r from-indigo-900/40 to-violet-900/40 overflow-hidden">
            {ch.banner && (
              <img
                src={ch.banner}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
              />
            )}
            {/* Open icon */}
            <div className="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-md rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex gap-3 items-start -mt-5 relative">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-2xl border-2 border-border bg-surface overflow-hidden flex-shrink-0 shadow-md">
              {ch.thumbnail ? (
                <img
                  src={ch.thumbnail}
                  alt={ch.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-lg">
                  {ch.title[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-5">
              <h4 className="text-sm font-black text-foreground truncate group-hover:text-brand transition-colors">
                {ch.title}
              </h4>
              {ch.country && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-subtle uppercase tracking-wider mt-0.5">
                  <Globe className="w-3 h-3" />
                  {ch.country}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {ch.description && (
            <p className="text-[11px] text-subtle font-medium px-4 pb-3 line-clamp-2 leading-relaxed">
              {ch.description}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-auto grid grid-cols-3 border-t border-border/50 divide-x divide-border/50">
            {[
              { icon: Users, value: ch.subscriber_count, label: "Subs" },
              { icon: Eye, value: ch.view_count, label: "Views" },
              { icon: Video, value: ch.video_count, label: "Videos" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center py-3 gap-1">
                <Icon className="w-3.5 h-3.5 text-subtle" />
                <span className="text-xs font-black text-foreground">{formatNumber(value)}</span>
                <span className="text-[9px] font-bold text-subtle uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </a>
      ))}
    </div>
  );
}
