export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl flex-1 overflow-auto px-4 py-6">
      <div className="kicker">Legal</div>
      <h1 className="exq-display mt-1 text-4xl text-gold-2">Privacy</h1>
      <p className="mt-3 text-[13px] leading-6 text-muted">
        Exquisite is a collab desk. It does not sell shoes, create accounts, or
        require a login.
      </p>
      <h2 className="mt-6 font-mono text-[11px] tracking-[0.16em] text-gold uppercase">
        What stays on your device
      </h2>
      <p className="mt-2 text-[13px] leading-6 text-muted">
        Watching, takes, your size, and city are stored in your browser or app
        storage on this device only. That book is not sent to a server. The
        heads-up when you open Exquisite stays on this device. If you turn on the
        optional day-before phone ping, that is scheduled here only.
      </p>
      <h2 className="mt-6 font-mono text-[11px] tracking-[0.16em] text-gold uppercase">
        What we do not collect
      </h2>
      <p className="mt-2 text-[13px] leading-6 text-muted">
        No analytics SDK, no advertising ID, no crash reporter, no location, no
        contacts. Market figures and where-to-buy notes in this version are desk
        estimates shipped with the app, not live store inventory.
      </p>
      <h2 className="mt-6 font-mono text-[11px] tracking-[0.16em] text-gold uppercase">
        Store listings
      </h2>
      <p className="mt-2 text-[13px] leading-6 text-muted">
        If you installed Exquisite from Google Play, app updates are delivered
        by the Play Store. Uninstalling the app removes local coverage data.
      </p>
      <p className="mt-6 font-mono text-[11px] text-dim">
        Last updated 9 September 2026
      </p>
      <p className="mt-3 font-mono text-[11px] leading-5 text-dim">
        The public copy for store listings is hosted on GitHub Pages at{" "}
        <a
          href="https://saintjeromeiii.github.io/Exquisite-Collaboration/privacy/"
          className="text-gold no-underline"
        >
          saintjeromeiii.github.io/Exquisite-Collaboration/privacy
        </a>
        .
      </p>
    </div>
  );
}
